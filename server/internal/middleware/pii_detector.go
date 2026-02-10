package middleware

import (
	"net/http"
	"regexp"

	"github.com/examlytics/server/internal/dto"
	"github.com/examlytics/server/pkg/logger"
	"github.com/gin-gonic/gin"
)

// PIIDetector detects and blocks requests containing PII
type PIIDetector struct {
	creditCardPattern *regexp.Regexp
	ssnPattern        *regexp.Regexp
}

// NewPIIDetector creates a new PIIDetector middleware
func NewPIIDetector() *PIIDetector {
	return &PIIDetector{
		creditCardPattern: regexp.MustCompile(`\b(?:\d[ -]*?){13,16}\b`),
		ssnPattern:        regexp.MustCompile(`\b\d{3}-\d{2}-\d{4}\b`),
	}
}

// Detect is the middleware handler that detects PII
func (m *PIIDetector) Detect() gin.HandlerFunc {
	return func(c *gin.Context) {
		var bodyBytes []byte
		if c.Request.Body != nil {
			bodyBytes, _ = c.GetRawData()
			c.Request.Body = newBodyReader(bodyBytes)
		}

		stringifiedBody := string(bodyBytes)

		if m.creditCardPattern.MatchString(stringifiedBody) || m.ssnPattern.MatchString(stringifiedBody) {
			logger.Warnf("PII (Credit Card or SSN) detected in request body from IP: %s", c.ClientIP())
			c.AbortWithStatusJSON(http.StatusBadRequest, dto.ErrorResponse{
				Error: "Request contains sensitive information (PII) and cannot be processed.",
			})
			return
		}

		c.Next()
	}
}
