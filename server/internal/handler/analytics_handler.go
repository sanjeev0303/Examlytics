package handler

import (
	"net/http"

	"github.com/examlytics/server/internal/domain"
	"github.com/examlytics/server/internal/service"
	"github.com/examlytics/server/pkg/logger"
	"github.com/gin-gonic/gin"
)

// AnalyticsHandler handles analytics-related HTTP requests
type AnalyticsHandler struct {
	analyticsService service.AnalyticsService
	userRepo         domain.UserRepository
}

// NewAnalyticsHandler creates a new AnalyticsHandler
func NewAnalyticsHandler(analyticsService service.AnalyticsService, userRepo domain.UserRepository) *AnalyticsHandler {
	return &AnalyticsHandler{
		analyticsService: analyticsService,
		userRepo:         userRepo,
	}
}

// GetLearningCurve returns learning curve data for graphs
// GET /analytics/learning-curve
func (h *AnalyticsHandler) GetLearningCurve(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	response, err := h.analyticsService.GetLearningCurve(c.Request.Context(), userID)
	if err != nil {
		logger.Errorf("Failed to get learning curve: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get learning curve"})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetTopicCurve returns mastery progression for a specific topic
// GET /analytics/topic-curve/:topic
func (h *AnalyticsHandler) GetTopicCurve(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	topic := c.Param("topic")
	if topic == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Topic parameter required"})
		return
	}

	response, err := h.analyticsService.GetTopicCurve(c.Request.Context(), userID, topic)
	if err != nil {
		logger.Errorf("Failed to get topic curve: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get topic curve"})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetInterviewReadiness returns the interview readiness score
// GET /analytics/readiness-score
func (h *AnalyticsHandler) GetInterviewReadiness(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	response, err := h.analyticsService.GetInterviewReadiness(c.Request.Context(), userID)
	if err != nil {
		logger.Errorf("Failed to get interview readiness: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get interview readiness"})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetDueTopics returns topics due for spaced repetition review
// GET /analytics/due-topics
func (h *AnalyticsHandler) GetDueTopics(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	response, err := h.analyticsService.GetDueTopics(c.Request.Context(), userID)
	if err != nil {
		logger.Errorf("Failed to get due topics: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get due topics"})
		return
	}

	c.JSON(http.StatusOK, response)
}

// RecalculateReadiness triggers IRS recalculation
// POST /analytics/recalculate-readiness
func (h *AnalyticsHandler) RecalculateReadiness(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	if err := h.analyticsService.RecalculateReadiness(c.Request.Context(), userID); err != nil {
		logger.Errorf("Failed to recalculate readiness: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to recalculate readiness"})
		return
	}

	// Return the updated score
	response, err := h.analyticsService.GetInterviewReadiness(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get updated readiness"})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetStreakData returns user activity streak information
// GET /analytics/streaks
func (h *AnalyticsHandler) GetStreakData(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	response, err := h.analyticsService.GetStreakData(c.Request.Context(), userID)
	if err != nil {
		logger.Errorf("Failed to get streak data: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get streak data"})
		return
	}

	c.JSON(http.StatusOK, response)
}
