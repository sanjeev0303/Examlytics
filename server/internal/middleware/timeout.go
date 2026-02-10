package middleware

import (
	"context"
	"net/http"
	"time"

	"github.com/examlytics/server/internal/dto"
	"github.com/gin-gonic/gin"
)

// TimeoutConfig holds per-category timeout settings.
type TimeoutConfig struct {
	defaults map[string]time.Duration
}

// NewTimeoutConfig creates a timeout config with defaults.
func NewTimeoutConfig() *TimeoutConfig {
	return &TimeoutConfig{
		defaults: map[string]time.Duration{
			"read":   5 * time.Second,
			"write":  10 * time.Second,
			"submit": 15 * time.Second,
			"ai":     30 * time.Second,
		},
	}
}

// SetTimeout sets timeout for a category.
func (tc *TimeoutConfig) SetTimeout(category string, d time.Duration) {
	tc.defaults[category] = d
}

// GetTimeout returns timeout for a category.
func (tc *TimeoutConfig) GetTimeout(category string) time.Duration {
	if d, ok := tc.defaults[category]; ok {
		return d
	}
	return 10 * time.Second // default
}

// Timeout returns middleware that enforces a request deadline.
func Timeout(duration time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), duration)
		defer cancel()

		// Replace request context
		c.Request = c.Request.WithContext(ctx)

		// Channel to signal completion
		done := make(chan struct{})

		go func() {
			c.Next()
			close(done)
		}()

		select {
		case <-done:
			// Request completed normally
		case <-ctx.Done():
			// Timeout exceeded
			c.AbortWithStatusJSON(http.StatusGatewayTimeout, dto.ErrorResponse{
				Error: "Request timeout exceeded",
			})
		}
	}
}

// TimeoutCategory returns middleware using categorized timeouts.
func TimeoutCategory(tc *TimeoutConfig, category string) gin.HandlerFunc {
	return Timeout(tc.GetTimeout(category))
}

// PropagateDeadline is a simpler version that just sets context deadline
// without any goroutine overhead. Use this for most cases.
func PropagateDeadline(duration time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), duration)
		defer cancel()
		c.Request = c.Request.WithContext(ctx)
		c.Next()
	}
}
