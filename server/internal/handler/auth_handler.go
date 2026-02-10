package handler

import (
	"net/http"

	"github.com/examlytics/server/internal/dto"
	"github.com/examlytics/server/internal/service"
	"github.com/examlytics/server/pkg/logger"
	"github.com/gin-gonic/gin"
)

// AuthHandler handles authentication-related HTTP requests
type AuthHandler struct {
	userService service.UserService
}

// NewAuthHandler creates a new AuthHandler
func NewAuthHandler(userService service.UserService) *AuthHandler {
	return &AuthHandler{userService: userService}
}

// SyncUser handles POST /auth/sync
func (h *AuthHandler) SyncUser(c *gin.Context) {
	userID, exists := c.Get("clerkUserID")
	if !exists || userID == "" {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Not authenticated"})
		return
	}

	var req dto.SyncUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	if req.Email == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "Missing email"})
		return
	}

	createReq := &dto.CreateUserRequest{
		ClerkID:   userID.(string),
		Email:     req.Email,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		ImageURL:  req.ImageURL,
	}

	user, err := h.userService.SyncClerkUser(c.Request.Context(), createReq)
	if err != nil {
		logger.Error(err, "Error in AuthHandler.SyncUser")
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to sync user"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// GetMe handles GET /auth/me
func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, exists := c.Get("clerkUserID")
	if !exists || userID == "" {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Not authenticated"})
		return
	}

	user, err := h.userService.GetUserByClerkID(c.Request.Context(), userID.(string))
	if err != nil {
		logger.Error(err, "Error in AuthHandler.GetMe")
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to get user"})
		return
	}

	if user == nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "User not found. Please sync your account first."})
		return
	}

	c.JSON(http.StatusOK, user)
}

// GetRole handles GET /auth/role
func (h *AuthHandler) GetRole(c *gin.Context) {
	userID, exists := c.Get("clerkUserID")
	if !exists || userID == "" {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Not authenticated"})
		return
	}

	role, err := h.userService.GetUserRoleByClerkID(c.Request.Context(), userID.(string))
	if err != nil {
		logger.Error(err, "Error in AuthHandler.GetRole")
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to get role"})
		return
	}

	if role == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found", "role": nil})
		return
	}

	c.JSON(http.StatusOK, dto.RoleResponse{Role: *role})
}
