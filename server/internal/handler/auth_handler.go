package handler

import (
	"net/http"
	"strings"

	"github.com/examlytics/server/internal/dto"
	"github.com/examlytics/server/internal/service"
	"github.com/examlytics/server/pkg/logger"
	"github.com/examlytics/server/pkg/utils"
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

// Register handles user registration
func (h *AuthHandler) Register(c *gin.Context) {
	var req dto.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	user, err := h.userService.CreateUser(c.Request.Context(), &req)
	if err != nil {
		logger.Error(err, "Failed to register user")
		if strings.Contains(err.Error(), "exists") {
			c.JSON(http.StatusConflict, dto.ErrorResponse{Error: "User already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to create user"})
		return
	}

	// Generate Tokens
	accessToken, err := utils.GenerateAccessToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to generate token"})
		return
	}

	refreshToken, err := utils.GenerateRefreshToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to generate token"})
		return
	}

	// Set Cookies
	setAuthCookies(c, accessToken, refreshToken)

	c.JSON(http.StatusCreated, user)
}

// Login handles user login
func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	user, err := h.userService.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Invalid email or password"})
		return
	}

	// Generate Tokens
	accessToken, err := utils.GenerateAccessToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to generate token"})
		return
	}

	refreshToken, err := utils.GenerateRefreshToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to generate token"})
		return
	}

	// Set Cookies
	setAuthCookies(c, accessToken, refreshToken)

	c.JSON(http.StatusOK, user)
}

// Logout clears auth cookies
func (h *AuthHandler) Logout(c *gin.Context) {
	// Clear cookies
	c.SetCookie("access_token", "", -1, "/", "", false, true)
	c.SetCookie("refresh_token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// GetMe returns current user
func (h *AuthHandler) GetMe(c *gin.Context) {
	// UserID is set by middleware
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Not authenticated"})
		return
	}

	user, err := h.userService.GetUserProfile(c.Request.Context(), userID.(string))
	if err != nil {
		logger.Error(err, "Failed to fetch user profile")
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to fetch user profile"})
		return
	}

	if user == nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// Helper to set cookies
func setAuthCookies(c *gin.Context, accessToken, refreshToken string) {
	// Secure should be true in production (https)
	// SameSite: Lax or None depending on cross-site needs.
	// For dev (localhost), secure=false.
	c.SetCookie("access_token", accessToken, 3600*24, "/", "", false, true)
	c.SetCookie("refresh_token", refreshToken, 3600*24*7, "/", "", false, true)
}
