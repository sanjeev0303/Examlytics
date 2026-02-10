package handler

import (
	"net/http"
	"runtime"
	"sync/atomic"

	"github.com/examlytics/server/internal/middleware"
	"github.com/examlytics/server/pkg/concurrency"
	"github.com/examlytics/server/pkg/resilience"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// MetricsHandler provides system metrics for observability.
type MetricsHandler struct {
	admissionCtrl *middleware.AdmissionController
	circuits      map[string]*resilience.CircuitBreaker
	workerPools   map[string]*concurrency.WorkerPool
	db            *gorm.DB
}

// MetricsConfig holds references to system components for metrics.
type MetricsConfig struct {
	AdmissionController *middleware.AdmissionController
	CircuitBreakers     map[string]*resilience.CircuitBreaker
	WorkerPools         map[string]*concurrency.WorkerPool
	DB                  *gorm.DB
}

func NewMetricsHandler(cfg MetricsConfig) *MetricsHandler {
	return &MetricsHandler{
		admissionCtrl: cfg.AdmissionController,
		circuits:      cfg.CircuitBreakers,
		workerPools:   cfg.WorkerPools,
		db:            cfg.DB,
	}
}

// Global metrics counters
var (
	totalRequests uint64
	totalErrors   uint64
	totalRejected uint64
)

func IncrementRequests() { atomic.AddUint64(&totalRequests, 1) }
func IncrementErrors()   { atomic.AddUint64(&totalErrors, 1) }
func IncrementRejected() { atomic.AddUint64(&totalRejected, 1) }

// Metrics returns system metrics in Prometheus-compatible format.
func (h *MetricsHandler) Metrics(c *gin.Context) {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	// Build metrics response
	metrics := map[string]interface{}{
		"system": map[string]interface{}{
			"goroutines":        runtime.NumGoroutine(),
			"heap_alloc_mb":     float64(m.HeapAlloc) / 1024 / 1024,
			"heap_sys_mb":       float64(m.HeapSys) / 1024 / 1024,
			"gc_pause_total_ns": m.PauseTotalNs,
			"gc_num":            m.NumGC,
		},
		"requests": map[string]interface{}{
			"total":    atomic.LoadUint64(&totalRequests),
			"errors":   atomic.LoadUint64(&totalErrors),
			"rejected": atomic.LoadUint64(&totalRejected),
		},
	}

	// Database stats
	if h.db != nil {
		sqlDB, err := h.db.DB()
		if err == nil {
			dbStats := sqlDB.Stats()
			metrics["database"] = map[string]interface{}{
				"open_connections": dbStats.OpenConnections,
				"in_use":           dbStats.InUse,
				"idle":             dbStats.Idle,
				"wait_count":       dbStats.WaitCount,
				"wait_duration_ms": dbStats.WaitDuration.Milliseconds(),
				"max_open":         dbStats.MaxOpenConnections,
			}
		}
	}

	// Admission control stats
	if h.admissionCtrl != nil {
		semaphoreStats := make(map[string]interface{})
		for name, stats := range h.admissionCtrl.Stats() {
			semaphoreStats[name] = map[string]interface{}{
				"max":      stats.Max,
				"current":  stats.Current,
				"waiting":  stats.Waiting,
				"rejected": stats.Rejected,
			}
		}
		metrics["admission"] = semaphoreStats
	}

	// Circuit breaker stats
	if h.circuits != nil {
		cbStats := make(map[string]interface{})
		for name, cb := range h.circuits {
			stats := cb.Stats()
			cbStats[name] = map[string]interface{}{
				"state":          stats.State,
				"failures":       stats.Failures,
				"total_requests": stats.TotalRequests,
				"total_failures": stats.TotalFailures,
				"total_rejects":  stats.TotalRejects,
			}
		}
		metrics["circuit_breakers"] = cbStats
	}

	// Worker pool stats
	if h.workerPools != nil {
		wpStats := make(map[string]interface{})
		for name, wp := range h.workerPools {
			stats := wp.Stats()
			wpStats[name] = map[string]interface{}{
				"workers":     stats.Workers,
				"queue_depth": stats.QueueDepth,
				"processed":   stats.Processed,
				"failed":      stats.Failed,
				"running":     stats.Running,
			}
		}
		metrics["worker_pools"] = wpStats
	}

	c.JSON(http.StatusOK, metrics)
}
