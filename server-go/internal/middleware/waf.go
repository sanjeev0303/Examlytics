package middleware

import (
	"net/http"
	"regexp"
	"strings"

	"github.com/examlytics/server/internal/dto"
	"github.com/examlytics/server/pkg/logger"
	"github.com/gin-gonic/gin"
)

// WAF implements a basic Web Application Firewall
type WAF struct {
	sqlInjectionPattern *regexp.Regexp
	xssPatterns         []*regexp.Regexp
}

// NewWAF creates a new WAF middleware
func NewWAF() *WAF {
	return &WAF{
		sqlInjectionPattern: regexp.MustCompile(`(%27)|(')|(--)|(%23)|(#)`),
		xssPatterns: []*regexp.Regexp{
			regexp.MustCompile(`(?i)<script[^>]*>[\s\S]*?</script[^>]*>`),
			regexp.MustCompile(`(?i)<[^>]+on\w+\s*=`),
			regexp.MustCompile(`(?i)javascript:`),
		},
	}
}

// Protect is the middleware handler that protects against attacks
func (m *WAF) Protect() gin.HandlerFunc {
	return func(c *gin.Context) {
		var bodyBytes []byte
		if c.Request.Body != nil {
			bodyBytes, _ = c.GetRawData()
			c.Request.Body = newBodyReader(bodyBytes)
		}

		// Skip XSS body check for endpoints with user-generated content
		excludedPaths := []string{"/exams/submit", "/exams/sessions"}
		skipBodyCheck := false
		for _, path := range excludedPaths {
			if strings.Contains(c.Request.URL.Path, path) {
				skipBodyCheck = true
				break
			}
		}

		if !skipBodyCheck {
			stringifiedBody := string(bodyBytes)
			for _, pattern := range m.xssPatterns {
				if pattern.MatchString(stringifiedBody) {
					logger.Warnf("Potential XSS attack detected from IP: %s", c.ClientIP())
					c.AbortWithStatusJSON(http.StatusForbidden, dto.ErrorResponse{Error: "Malicious content detected."})
					return
				}
			}
		}

		c.Next()
	}
}

// SanitizeXSS sanitizes XSS from string input
func SanitizeXSS(input string) string {
	replacer := strings.NewReplacer(
		"<", "&lt;",
		">", "&gt;",
		"\"", "&quot;",
		"'", "&#39;",
		"&", "&amp;",
	)
	return replacer.Replace(input)
}
