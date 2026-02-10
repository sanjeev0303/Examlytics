package middleware

import (
	"net/http"
	"sync"

	"github.com/examlytics/server/internal/dto"
	"github.com/examlytics/server/pkg/concurrency"
	"github.com/gin-gonic/gin"
)

// AdmissionController manages semaphores for different endpoint categories.
type AdmissionController struct {
	semaphores map[string]*concurrency.Semaphore
	mu         sync.RWMutex
}

// NewAdmissionController creates a controller with default limits.
func NewAdmissionController() *AdmissionController {
	return &AdmissionController{
		semaphores: make(map[string]*concurrency.Semaphore),
	}
}

// RegisterEndpoint registers a semaphore for an endpoint category.
func (ac *AdmissionController) RegisterEndpoint(name string, maxConcurrent int) {
	ac.mu.Lock()
	defer ac.mu.Unlock()
	ac.semaphores[name] = concurrency.NewSemaphore(maxConcurrent)
}

// GetSemaphore retrieves the semaphore for an endpoint.
func (ac *AdmissionController) GetSemaphore(name string) *concurrency.Semaphore {
	ac.mu.RLock()
	defer ac.mu.RUnlock()
	return ac.semaphores[name]
}

// Limit returns middleware that limits concurrency for the given category.
// If acquire fails immediately, returns 429 Too Many Requests.
func (ac *AdmissionController) Limit(category string) gin.HandlerFunc {
	return func(c *gin.Context) {
		sem := ac.GetSemaphore(category)
		if sem == nil {
			// No limit configured, pass through
			c.Next()
			return
		}

		// Try to acquire without blocking
		if !sem.TryAcquire() {
			stats := sem.Stats()
			c.Header("Retry-After", "5")
			c.Header("X-Concurrency-Limit", string(rune(stats.Max)))
			c.AbortWithStatusJSON(http.StatusTooManyRequests, dto.ErrorResponse{
				Error: "Server at capacity, please retry shortly",
			})
			return
		}

		// Ensure release on finish
		defer sem.Release()
		c.Next()
	}
}

// LimitBlocking returns middleware that blocks waiting for a slot.
// Respects request context timeout.
func (ac *AdmissionController) LimitBlocking(category string) gin.HandlerFunc {
	return func(c *gin.Context) {
		sem := ac.GetSemaphore(category)
		if sem == nil {
			c.Next()
			return
		}

		if err := sem.Acquire(c.Request.Context()); err != nil {
			c.Header("Retry-After", "5")
			c.AbortWithStatusJSON(http.StatusTooManyRequests, dto.ErrorResponse{
				Error: "Request timeout waiting for capacity",
			})
			return
		}

		defer sem.Release()
		c.Next()
	}
}

// Stats returns stats for all registered semaphores.
func (ac *AdmissionController) Stats() map[string]concurrency.SemaphoreStats {
	ac.mu.RLock()
	defer ac.mu.RUnlock()

	stats := make(map[string]concurrency.SemaphoreStats)
	for name, sem := range ac.semaphores {
		stats[name] = sem.Stats()
	}
	return stats
}

// Close closes all semaphores.
func (ac *AdmissionController) Close() {
	ac.mu.Lock()
	defer ac.mu.Unlock()
	for _, sem := range ac.semaphores {
		sem.Close()
	}
}
