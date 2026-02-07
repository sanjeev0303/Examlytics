package middleware

import (
	"time"

	"github.com/examlytics/server/pkg/logger"
	"github.com/gin-gonic/gin"
)

// RequestLogger logs incoming requests
type RequestLogger struct{}

// NewRequestLogger creates a new RequestLogger middleware
func NewRequestLogger() *RequestLogger {
	return &RequestLogger{}
}

// Log is the middleware handler that logs requests
func (m *RequestLogger) Log() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()
		method := c.Request.Method
		path := c.Request.URL.Path

		logger.Infof("%s %s %d %v", method, path, status, latency)
	}
}
