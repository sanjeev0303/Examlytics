package handler

import (
	"context"
	"net/http"
	"runtime"
	"time"

	"github.com/examlytics/server/internal/adapter/redis"
	"github.com/examlytics/server/internal/dto"
	"github.com/examlytics/server/pkg/resilience"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// HealthHandler handles health check requests
type HealthHandler struct {
	db          *gorm.DB
	redisClient *redis.RedisClient
	aiCircuit   *resilience.CircuitBreaker
}

// HealthHandlerConfig holds dependencies for health checks.
type HealthHandlerConfig struct {
	DB          *gorm.DB
	RedisClient *redis.RedisClient
	AICircuit   *resilience.CircuitBreaker
}

// NewHealthHandler creates a new HealthHandler
func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

// NewHealthHandlerWithDeps creates a HealthHandler with dependencies for deep checks.
func NewHealthHandlerWithDeps(cfg HealthHandlerConfig) *HealthHandler {
	return &HealthHandler{
		db:          cfg.DB,
		redisClient: cfg.RedisClient,
		aiCircuit:   cfg.AICircuit,
	}
}

// HealthCheck handles GET /health - basic liveness probe
func (h *HealthHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, dto.HealthResponse{
		Status:    "ok",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	})
}

// HealthLevel represents system health state.
type HealthLevel string

const (
	HealthGreen  HealthLevel = "green"
	HealthYellow HealthLevel = "yellow"
	HealthRed    HealthLevel = "red"
)

// ReadinessResponse contains detailed health information.
type ReadinessResponse struct {
	Status     HealthLevel            `json:"status"`
	Timestamp  string                 `json:"timestamp"`
	Components map[string]interface{} `json:"components"`
}

// ReadinessCheck handles GET /health/ready - deep readiness probe
func (h *HealthHandler) ReadinessCheck(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 3*time.Second)
	defer cancel()

	overallStatus := HealthGreen
	components := make(map[string]interface{})

	// Check database
	if h.db != nil {
		dbStatus := h.checkDatabase(ctx)
		components["database"] = dbStatus
		if dbStatus["status"] == "red" {
			overallStatus = HealthRed
		} else if dbStatus["status"] == "yellow" && overallStatus != HealthRed {
			overallStatus = HealthYellow
		}
	}

	// Check Redis
	if h.redisClient != nil {
		redisStatus := h.checkRedis(ctx)
		components["redis"] = redisStatus
		if redisStatus["status"] == "red" && overallStatus != HealthRed {
			// Redis failure is degraded, not critical
			if overallStatus == HealthGreen {
				overallStatus = HealthYellow
			}
		}
	}

	// Check AI service circuit
	if h.aiCircuit != nil {
		circuitStatus := h.checkCircuit()
		components["ai_service"] = circuitStatus
		if circuitStatus["status"] == "red" && overallStatus == HealthGreen {
			overallStatus = HealthYellow // AI down is degraded, not critical
		}
	}

	// Check goroutine count (leak detection)
	goroutines := runtime.NumGoroutine()
	goroutineStatus := "green"
	if goroutines > 10000 {
		goroutineStatus = "red"
		overallStatus = HealthRed
	} else if goroutines > 5000 {
		goroutineStatus = "yellow"
		if overallStatus == HealthGreen {
			overallStatus = HealthYellow
		}
	}
	components["runtime"] = map[string]interface{}{
		"status":     goroutineStatus,
		"goroutines": goroutines,
	}

	// Set HTTP status based on health
	httpStatus := http.StatusOK
	if overallStatus == HealthRed {
		httpStatus = http.StatusServiceUnavailable
	}

	c.JSON(httpStatus, ReadinessResponse{
		Status:     overallStatus,
		Timestamp:  time.Now().UTC().Format(time.RFC3339),
		Components: components,
	})
}

func (h *HealthHandler) checkDatabase(ctx context.Context) map[string]interface{} {
	sqlDB, err := h.db.DB()
	if err != nil {
		return map[string]interface{}{
			"status": "red",
			"error":  "failed to get DB connection",
		}
	}

	// Check connection pool saturation
	stats := sqlDB.Stats()
	inUseRatio := float64(stats.InUse) / float64(stats.MaxOpenConnections)

	status := "green"
	if inUseRatio > 0.95 {
		status = "red"
	} else if inUseRatio > 0.80 {
		status = "yellow"
	}

	// Ping test
	if err := sqlDB.PingContext(ctx); err != nil {
		return map[string]interface{}{
			"status": "red",
			"error":  "ping failed",
		}
	}

	return map[string]interface{}{
		"status":           status,
		"open_connections": stats.OpenConnections,
		"in_use":           stats.InUse,
		"idle":             stats.Idle,
		"max_open":         stats.MaxOpenConnections,
		"wait_count":       stats.WaitCount,
	}
}

func (h *HealthHandler) checkRedis(ctx context.Context) map[string]interface{} {
	if _, err := h.redisClient.Client.Ping(ctx).Result(); err != nil {
		return map[string]interface{}{
			"status": "red",
			"error":  "ping failed",
		}
	}
	return map[string]interface{}{
		"status": "green",
	}
}

func (h *HealthHandler) checkCircuit() map[string]interface{} {
	state := h.aiCircuit.State()
	status := "green"
	if state == resilience.StateOpen {
		status = "red"
	} else if state == resilience.StateHalfOpen {
		status = "yellow"
	}
	return map[string]interface{}{
		"status":        status,
		"circuit_state": state.String(),
	}
}
