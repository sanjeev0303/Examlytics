package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/examlytics/server/internal/adapter/redis"
	"github.com/examlytics/server/internal/service"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AdminHandler struct {
	userService service.UserService
	examService service.ExamService
	db          *gorm.DB
	redis       *redis.RedisClient
	aiURL       string
	aiSecret    string
}

func NewAdminHandler(userService service.UserService, examService service.ExamService, aiURL string, aiSecret string, db *gorm.DB, redis *redis.RedisClient) *AdminHandler {
	return &AdminHandler{
		userService: userService,
		examService: examService,
		db:          db,
		redis:       redis,
		aiURL:       aiURL,
		aiSecret:    aiSecret,
	}
}

func (h *AdminHandler) GetSystemStats(c *gin.Context) {
	// 1. Get AI Service Stats
	client := &http.Client{Timeout: 5 * time.Second}
	req, _ := http.NewRequest("GET", h.aiURL+"/health/stats", nil)
	req.Header.Set("X-Internal-Secret", h.aiSecret)

	resp, err := client.Do(req)

	var aiStats interface{}
	if err == nil {
		defer resp.Body.Close()
		json.NewDecoder(resp.Body).Decode(&aiStats)
	}

	// 2. Check DB Health
	dbStatus := "online"
	sqlDB, err := h.db.DB()
	if err != nil || sqlDB.Ping() != nil {
		dbStatus = "offline"
	}

	// 3. Check Redis Health
	redisStatus := "online"
	if h.redis == nil || h.redis.Client.Ping(c.Request.Context()).Err() != nil {
		redisStatus = "offline"
	}

	// 4. Aggregate with local metrics
	c.JSON(http.StatusOK, gin.H{
		"ai_models": aiStats,
		"server": gin.H{
			"status": "online",
			"time":   time.Now(),
		},
		"db":    dbStatus,
		"redis": redisStatus,
	})
}

func (h *AdminHandler) GetExamRecords(c *gin.Context) {
	exams, err := h.examService.GetUserExamHistory(c.Request.Context(), "") // Empty string for "all" if service allows or fix later
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, exams)
}
