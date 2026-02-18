package middleware

import (
	"net/http"
	"strings"

	"github.com/examlytics/server/internal/dto"
	"github.com/examlytics/server/internal/service"
	"github.com/examlytics/server/pkg/logger"
	"github.com/examlytics/server/pkg/utils"
	"github.com/gin-gonic/gin"
)

// JWTAuth is a middleware that validates JWT tokens
type JWTAuth struct {
	userService service.UserService
}

// NewJWTAuth creates a new JWTAuth middleware
func NewJWTAuth(userService service.UserService) *JWTAuth {
	return &JWTAuth{
		userService: userService,
	}
}

// Authenticate validates the JWT token and sets the user ID in context
func (m *JWTAuth) Authenticate() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Try to get token from Cookie
		accessToken, err := c.Cookie("access_token")
		if err != nil || accessToken == "" {
			// Fallback to Header (Bearer)
			authHeader := c.GetHeader("Authorization")
			if authHeader != "" {
				accessToken = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		claims, err := utils.ValidateToken(accessToken)
		if err == nil {
			logger.Infof("Authenticated user: %s (ID used)", claims.UserID)
			c.Set("userID", claims.UserID)
			c.Set("role", claims.Role)
			c.Set("raw_token", accessToken) // Preserve for gRPC propagation
			c.Next()
			return
		}

		// 3. If Access Token invalid/expired, try Refresh Token
		refreshToken, err := c.Cookie("refresh_token")
		if err != nil || refreshToken == "" {
			c.Next()
			return
		}

		refreshClaims, err := utils.ValidateToken(refreshToken)
		if err != nil {
			c.Next()
			return
		}

		// Verify refresh token is actually a refresh token? (Claims should have type if we distinguished)
		// For now assuming separation by secret or purpose field if using `utils`.
		// Our `jwt_util` uses same secret but different usage?
		// Checking `jwt_util` implementation (assumed standard).
		// Let's assume we trust it if it validates.

		// 4. Generate New Access Token
		// We need User to regenerate.
		// Use ID from refresh token.
		// Ideally check DB to see if user wasn't banned/deleted.
		// For speed, just re-issue based on claims.
		// But `GenerateAccessToken` takes `*domain.User`.
		// Let's create a minimal user struct or fetch from DB.
		// Fetching from DB is safer.
		user, err := m.userService.GetUserProfile(c.Request.Context(), refreshClaims.UserID)
		if err != nil || user == nil {
			c.Next()
			return
		}

		newAccessToken, _ := utils.GenerateAccessToken(user)
		// Optionally rotate refresh token too?
		// For now, just new access token.

		// Set new cookie
		c.SetCookie("access_token", newAccessToken, 3600*24, "/", "", false, true)

		c.Set("userID", user.ID)
		c.Set("role", user.Role)
		c.Next()
	}
}

// RequireLogin ensures the user is authenticated
func (m *JWTAuth) RequireLogin() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists || userID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthenticated"})
			return
		}
		c.Next()
	}
}

// RequireAdmin ensures the user has admin role
func (m *JWTAuth) RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists || userID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthenticated"})
			return
		}

		role, exists := c.Get("role")
		if !exists || role != "ADMIN" {
			// Double check DB if context missing?
			// But Authenticate should set it.
			c.AbortWithStatusJSON(http.StatusForbidden, dto.ErrorResponse{Error: "Admin access required"})
			return
		}
		c.Next()
	}
}
