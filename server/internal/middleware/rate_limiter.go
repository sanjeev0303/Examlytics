package middleware

import (
	"hash/fnv"
	"net/http"
	"sync"
	"time"

	"github.com/examlytics/server/internal/dto"
	"github.com/gin-gonic/gin"
)

const numShards = 256 // Must be power of 2 for fast modulo

// RateLimiter implements a sharded token bucket rate limiting algorithm.
// Uses consistent hashing to distribute IPs across shards, eliminating global lock contention.
type RateLimiter struct {
	shards     [numShards]*ipShard
	windowMs   time.Duration
	maxRequest int
}

// ipShard is a lock-independent shard of rate limiting state
type ipShard struct {
	requests map[string]*clientRequests
	mu       sync.RWMutex
}

type clientRequests struct {
	count    int
	lastSeen time.Time
}

// NewRateLimiter creates a new sharded RateLimiter middleware
func NewRateLimiter(windowMs int, maxRequest int) *RateLimiter {
	rl := &RateLimiter{
		windowMs:   time.Duration(windowMs) * time.Millisecond,
		maxRequest: maxRequest,
	}

	// Initialize all shards
	for i := 0; i < numShards; i++ {
		rl.shards[i] = &ipShard{
			requests: make(map[string]*clientRequests),
		}
	}

	go rl.cleanup()

	return rl
}

// getShard returns the shard for a given IP using consistent hashing
func (m *RateLimiter) getShard(ip string) *ipShard {
	h := fnv.New32a()
	h.Write([]byte(ip))
	return m.shards[h.Sum32()%numShards]
}

// Limit is the middleware handler that limits requests per IP
func (m *RateLimiter) Limit() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		shard := m.getShard(ip)

		// Only lock this specific shard, not the entire rate limiter
		shard.mu.Lock()
		client, exists := shard.requests[ip]
		now := time.Now()

		if !exists {
			shard.requests[ip] = &clientRequests{
				count:    1,
				lastSeen: now,
			}
			shard.mu.Unlock()
			c.Next()
			return
		}

		// Reset window if expired
		if now.Sub(client.lastSeen) > m.windowMs {
			client.count = 1
			client.lastSeen = now
			shard.mu.Unlock()
			c.Next()
			return
		}

		client.count++
		client.lastSeen = now

		if client.count > m.maxRequest {
			shard.mu.Unlock()
			c.Header("Retry-After", "60")
			c.AbortWithStatusJSON(http.StatusTooManyRequests, dto.ErrorResponse{
				Error: "Too many requests, please try again later.",
			})
			return
		}

		shard.mu.Unlock()
		c.Next()
	}
}

// cleanup periodically removes old entries from all shards
func (m *RateLimiter) cleanup() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		now := time.Now()
		// Clean each shard independently
		for i := 0; i < numShards; i++ {
			shard := m.shards[i]
			shard.mu.Lock()
			for ip, client := range shard.requests {
				if now.Sub(client.lastSeen) > m.windowMs*2 {
					delete(shard.requests, ip)
				}
			}
			shard.mu.Unlock()
		}
	}
}
