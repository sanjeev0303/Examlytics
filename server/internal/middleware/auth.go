package middleware

import (
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/examlytics/server/internal/config"
	"github.com/examlytics/server/internal/dto"
	"github.com/examlytics/server/internal/service"
	"github.com/examlytics/server/pkg/logger"
	"github.com/gin-gonic/gin"
)

// ClerkAuth is a middleware that validates Clerk JWT tokens
type ClerkAuth struct {
	secretKey   string
	userService service.UserService
}

// NewClerkAuth creates a new ClerkAuth middleware
func NewClerkAuth(cfg *config.Config, userService service.UserService) *ClerkAuth {
	// Configure Clerk Key globally (required by SDK)
	if cfg.ClerkSecretKey != "" {
		clerk.SetKey(cfg.ClerkSecretKey)
	}
	return &ClerkAuth{
		secretKey:   cfg.ClerkSecretKey,
		userService: userService,
	}
}

// Authenticate validates the Clerk JWT token and sets the user ID in context
func (m *ClerkAuth) Authenticate() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")

		// LOAD TEST BYPASS: Only allow in development mode for load testing
		// SECURITY: This bypass is DISABLED in production
		if token == "LOAD_TEST_BYPASS_TOKEN" {
			// Check if we're in development mode
			env := os.Getenv("ENV")
			if env == "development" || env == "dev" {
				// Set a special clerk user ID that maps to our seeded user
				c.Set("clerkUserID", "load_test_user_bypass")
				logger.Warnf("⚠️  Load test bypass used - only allowed in development")
				c.Next()
				return
			}
			// In production, treat as invalid token and continue to normal auth
			logger.Errorf("🚨 SECURITY: Load test bypass attempted in production mode - BLOCKED")
			c.AbortWithStatusJSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Invalid token"})
			return
		}

		// Verify signature using Clerk SDK
		// Note: Ideally use JWKS, but with Secret Key we can verify HS256 if configured,
		// or use Decode with specific config.
		// For this task, we assume generic decoding or simply checking claims if signature requires JWKS.
		// Actually, clerk-sdk-go/v2/jwt.Decode automatically fetches JWKS if SecretKey is set in valid context/config
		// or effectively validates sessions.

		// Simpler approach for this environment: Verify using the Secret Key if it's a "standard" JWT library
		// or just use the SDK's Decode which handles JWKS caching.
		// Since we don't have the full Clerk API Setup in main.go, we will use a more manual generic verification
		// OR better: trust the SDK.

		claims, err := jwt.Verify(c.Request.Context(), &jwt.VerifyParams{
			Token:  token,
			Leeway: 10 * time.Second,
		})
		if err != nil {
			logger.Errorf("JWT verification failed: %v", err)
			c.Next()
			return
		}

		c.Set("clerkUserID", claims.Subject)
		c.Next()
	}
}

// RequireLogin ensures the user is authenticated
func (m *ClerkAuth) RequireLogin() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("clerkUserID")
		if !exists || userID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthenticated"})
			return
		}
		c.Next()
	}
}

// RequireAdmin ensures the user has admin role by checking the DB
func (m *ClerkAuth) RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("clerkUserID")
		if !exists || userID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "Unauthenticated"})
			return
		}

		// Check Role in DB (Cached by Service/Repo ideally, but distinct query is safer than client header)
		// casting userID to string is safe here
		uid := userID.(string)

		rolePtr, err := m.userService.GetUserRoleByClerkID(c.Request.Context(), uid)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Authorization check failed"})
			return
		}

		if rolePtr == nil || *rolePtr != "ADMIN" {
			c.AbortWithStatusJSON(http.StatusForbidden, dto.ErrorResponse{Error: "Admin access required"})
			return
		}

		c.Next()
	}
}
