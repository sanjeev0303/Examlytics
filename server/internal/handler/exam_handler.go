package handler

import (
	"net/http"

	"github.com/examlytics/server/internal/dto"
	"github.com/examlytics/server/internal/service"
	"github.com/examlytics/server/pkg/logger"
	"github.com/gin-gonic/gin"
)

// ExamHandler handles exam-related HTTP requests
type ExamHandler struct {
	examService service.ExamService
}

// NewExamHandler creates a new ExamHandler
func NewExamHandler(examService service.ExamService) *ExamHandler {
	return &ExamHandler{examService: examService}
}

// GetExams handles GET /exams
// GetExams handles GET /exams
func (h *ExamHandler) GetExams(c *gin.Context) {
	var userID string
	if val, exists := c.Get("clerkUserID"); exists {
		userID = val.(string)
	}

	exams, err := h.examService.GetExams(c.Request.Context(), userID)
	if err != nil {
		logger.Error(err, "Error fetching exams")
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Internal Server Error"})
		return
	}
	c.JSON(http.StatusOK, exams)
}

// GetExamSession handles GET /exams/session/:id
func (h *ExamHandler) GetExamSession(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "Session ID required"})
		return
	}

	session, err := h.examService.GetExamSession(c.Request.Context(), id)
	if err != nil {
		logger.Error(err, "Error fetching exam session")
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
		return
	}
	c.JSON(http.StatusOK, session)
}

// GetExamSessionConfig handles GET /exams/session/config
func (h *ExamHandler) GetExamSessionConfig(c *gin.Context) {
	// Return a default configuration or static session data
	// This is a placeholder/fallback for the frontend
	c.JSON(http.StatusOK, gin.H{
		"sessionId":      "config",
		"totalQuestions": 0,
		"status":         "LIVE",
		"questions":      []interface{}{},
		"duration":       600,
	})
}

// GetTopics handles GET /topics
func (h *ExamHandler) GetTopics(c *gin.Context) {
	topics, err := h.examService.GetTopics(c.Request.Context())
	if err != nil {
		logger.Error(err, "Error fetching topics")
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Internal Server Error"})
		return
	}
	c.JSON(http.StatusOK, topics)
}

// StartExam handles POST /exams/start
func (h *ExamHandler) StartExam(c *gin.Context) {
	var req dto.StartExamRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	clerkID, exists := c.Get("clerkUserID")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthorized"})
		return
	}

	session, err := h.examService.StartExam(c.Request.Context(), clerkID.(string), req)
	if err != nil {
		logger.Error(err, "Error starting exam")
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusAccepted, session)
}

// GetExamStatus handles GET /exams/status/:jobId
func (h *ExamHandler) GetExamStatus(c *gin.Context) {
	jobID := c.Param("jobId")
	if jobID == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "Job ID required"})
		return
	}

	status, err := h.examService.GetExamGenerationStatus(c.Request.Context(), jobID)
	if err != nil {
		if err.Error() == "redis: nil" {
			c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Job not found"})
			return
		}
		logger.Error(err, "Error fetching job status")
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, status)
}

// SubmitExam handles POST /exams/submit
func (h *ExamHandler) SubmitExam(c *gin.Context) {
	// Enforce 1MB body limit
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, 1024*1024)

	var req dto.SubmitExamRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	clerkID, exists := c.Get("clerkUserID")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthorized"})
		return
	}

	status, err := h.examService.SubmitExam(c.Request.Context(), clerkID.(string), req)
	if err != nil {
		logger.Error(err, "Error submitting exam")
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusAccepted, status)
}

// GetExamHistory handles GET /exams/history
func (h *ExamHandler) GetExamHistory(c *gin.Context) {
	clerkID, exists := c.Get("clerkUserID")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthorized"})
		return
	}

	sessions, err := h.examService.GetUserExamHistory(c.Request.Context(), clerkID.(string))
	if err != nil {
		logger.Error(err, "Error fetching exam history")
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, sessions)
}

// GetWeakTopics handles GET /exams/weak-topics
func (h *ExamHandler) GetWeakTopics(c *gin.Context) {
	clerkID, exists := c.Get("clerkUserID")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthorized"})
		return
	}

	weakTopics, err := h.examService.GetWeakTopics(c.Request.Context(), clerkID.(string))
	if err != nil {
		logger.Error(err, "Error fetching weak topics")
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, weakTopics)
}
