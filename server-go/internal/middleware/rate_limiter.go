package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/examlytics/server/internal/dto"
	"github.com/examlytics/server/pkg/logger"
	"github.com/gin-gonic/gin"
)

// RateLimiter implements a token bucket rate limiting algorithm
type RateLimiter struct {
	requests   map[string]*clientRequests
	mu         sync.RWMutex
	windowMs   time.Duration
	maxRequest int
}

type clientRequests struct {
	count    int
	lastSeen time.Time
}

// NewRateLimiter creates a new RateLimiter middleware
func NewRateLimiter(windowMs int, maxRequest int) *RateLimiter {
	rl := &RateLimiter{
		requests:   make(map[string]*clientRequests),
		windowMs:   time.Duration(windowMs) * time.Millisecond,
		maxRequest: maxRequest,
	}

	go rl.cleanup()

	return rl
}

// Limit is the middleware handler that limits requests
func (m *RateLimiter) Limit() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()

		m.mu.Lock()
		client, exists := m.requests[ip]
		now := time.Now()

		if !exists {
			m.requests[ip] = &clientRequests{
				count:    1,
				lastSeen: now,
			}
			m.mu.Unlock()
			c.Next()
			return
		}

		if now.Sub(client.lastSeen) > m.windowMs {
			client.count = 1
			client.lastSeen = now
			m.mu.Unlock()
			c.Next()
			return
		}

		client.count++
		client.lastSeen = now

		if client.count > m.maxRequest {
			m.mu.Unlock()
			logger.Warnf("Rate limit exceeded for IP: %s", ip)
			c.AbortWithStatusJSON(http.StatusTooManyRequests, dto.ErrorResponse{
				Error: "Too many requests, please try again later.",
			})
			return
		}

		m.mu.Unlock()
		c.Next()
	}
}

// cleanup periodically removes old entries
func (m *RateLimiter) cleanup() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		m.mu.Lock()
		now := time.Now()
		for ip, client := range m.requests {
			if now.Sub(client.lastSeen) > m.windowMs*2 {
				delete(m.requests, ip)
			}
		}
		m.mu.Unlock()
	}
}
