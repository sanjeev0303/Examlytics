package middleware

import (
	"net/http"
	"regexp"
	"strings"

	"github.com/examlytics/server/internal/dto"
	"github.com/examlytics/server/pkg/logger"
	"github.com/gin-gonic/gin"
)

// BotDetector detects and blocks automated bot requests
type BotDetector struct {
	blockedPatterns []*regexp.Regexp
	botPatterns     *regexp.Regexp
}

// NewBotDetector creates a new BotDetector middleware
func NewBotDetector() *BotDetector {
	blockedPatterns := []*regexp.Regexp{
		regexp.MustCompile(`(?i)wget`),
		regexp.MustCompile(`(?i)python-requests`),
	}

	botPatterns := regexp.MustCompile(`(?i)bot|crawler|spider|crawling|curl|wget`)

	return &BotDetector{
		blockedPatterns: blockedPatterns,
		botPatterns:     botPatterns,
	}
}

// Detect is the middleware handler that detects bots
func (m *BotDetector) Detect() gin.HandlerFunc {
	return func(c *gin.Context) {
		userAgent := c.GetHeader("User-Agent")

		if m.botPatterns.MatchString(userAgent) {
			logger.Warnf("Bot detected: %s from IP: %s", userAgent, c.ClientIP())

			for _, pattern := range m.blockedPatterns {
				if pattern.MatchString(userAgent) {
					c.AbortWithStatusJSON(http.StatusForbidden, dto.ErrorResponse{Error: "Automated access denied."})
					return
				}
			}
		}

		if strings.Contains(strings.ToLower(userAgent), "bot") {
			logger.Warnf("Possible bot detected in browser name: %s", userAgent)
		}

		c.Next()
	}
}
