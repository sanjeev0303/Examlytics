package handler

import (
	"net/http"

	"github.com/examlytics/server/internal/dto"
	"github.com/examlytics/server/internal/service"
	"github.com/examlytics/server/pkg/logger"
	"github.com/gin-gonic/gin"
)

// UserHandler handles user-related HTTP requests
type UserHandler struct {
	userService service.UserService
}

// NewUserHandler creates a new UserHandler
func NewUserHandler(userService service.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// CreateUser handles POST /users
func (h *UserHandler) CreateUser(c *gin.Context) {
	var req dto.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	user, err := h.userService.CreateUser(c.Request.Context(), &req)
	if err != nil {
		logger.Error(err, "Error creating user")
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Internal Server Error"})
		return
	}

	c.JSON(http.StatusCreated, user)
}

// GetUsers handles GET /users
func (h *UserHandler) GetUsers(c *gin.Context) {
	users, err := h.userService.GetUsers(c.Request.Context())
	if err != nil {
		logger.Error(err, "Error fetching users")
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, users)
}

// OnboardUser handles POST /users/onboarding
func (h *UserHandler) OnboardUser(c *gin.Context) {
	var req dto.OnboardingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	userID, exists := c.Get("userID")
	if !exists || userID == "" {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthorized"})
		return
	}

	if err := h.userService.OnboardUser(c.Request.Context(), userID.(string), req); err != nil {
		logger.Error(err, "Error onboarding user")
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

// GetAdminStats handles GET /admin/stats
func (h *UserHandler) GetAdminStats(c *gin.Context) {
	stats, err := h.userService.GetAdminStats(c.Request.Context())
	if err != nil {
		logger.Error(err, "Error fetching admin stats")
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GetWeakTopics handles GET /users/weak-topics
func (h *UserHandler) GetWeakTopics(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists || userID == "" {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthorized"})
		return
	}

	topics, err := h.userService.GetUserWeakTopics(c.Request.Context(), userID.(string))
	if err != nil {
		logger.Error(err, "Error fetching weak topics")
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Internal Server Error"})
		return
	}

	c.JSON(http.StatusOK, topics)
}

// GetUserAIContext handles GET /users/:id/ai-context
func (h *UserHandler) GetUserAIContext(c *gin.Context) {
	userID := c.Param("id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "Missing user ID"})
		return
	}

	aiContext, err := h.userService.GetUserAIContext(c.Request.Context(), userID)
	if err != nil {
		logger.Error(err, "Error fetching user AI context")
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Internal Server Error"})
		return
	}

	if aiContext == nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "AI Context not found"})
		return
	}

	c.JSON(http.StatusOK, aiContext)
}
