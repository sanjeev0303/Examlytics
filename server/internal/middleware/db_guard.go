package middleware

import (
	"net/http"

	"github.com/examlytics/server/pkg/logger"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// DatabaseGuard middleware protects the DB connection pool by failing fast
// if the pool is saturated.
type DatabaseGuard struct {
	db *gorm.DB
}

// NewDatabaseGuard creates a new DatabaseGuard
func NewDatabaseGuard(db *gorm.DB) *DatabaseGuard {
	return &DatabaseGuard{db: db}
}

// Protect checks DB pool stats and rejects requests if saturated
func (g *DatabaseGuard) Protect() gin.HandlerFunc {
	// Cached stats updated periodically to avoid mutex contention on every request?
	// standard sql.DB.Stats() takes a lock.
	// For high throughput, we might want to sample it or trust the blocking behavior with timeout.
	// However, "Fast Fail" implies we don't want to wait in the queue.

	// Let's rely on a somewhat looser check or just call Stats().
	// Go's Stat() is relatively fast but does lock.
	// Alternative: Use a semaphore that matches MaxOpenConns.

	return func(c *gin.Context) {
		sqlDB, err := g.db.DB()
		if err != nil {
			c.Next()
			return
		}

		stats := sqlDB.Stats()
		// If InUse >= MaxOpenConnections, we are saturated.
		// Allow a small buffer (e.g., 95%) to allow administrative actions if needed,
		// but generally reject.

		threshold := int(float64(stats.MaxOpenConnections) * 0.95)
		if stats.MaxOpenConnections > 0 && stats.InUse >= threshold {
			// Check if we are actually blocked (WaitCount increasing?)
			// For now, simple saturation rejection.

			logger.Warnf("DB Pool Saturated: InUse=%d, Max=%d. Rejecting request.", stats.InUse, stats.MaxOpenConnections)
			c.Header("Retry-After", "5")
			c.AbortWithStatusJSON(http.StatusServiceUnavailable, gin.H{
				"error": "Service busy (Database saturated)",
			})
			return
		}

		c.Next()
	}
}
