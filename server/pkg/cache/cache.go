package cache

import (
	"context"
	"sync"
	"time"

	"golang.org/x/sync/singleflight"
)

// Cache provides multi-layer caching with stampede protection
type Cache struct {
	local sync.Map // In-memory for hot data
	sf    singleflight.Group
}

// cacheItem wraps a value with expiration
type cacheItem struct {
	Value      interface{}
	Expiration time.Time
}

// NewCache creates a new cache instance
func NewCache() *Cache {
	c := &Cache{}
	go c.cleanup()
	return c
}

// Get retrieves a value from cache
func (c *Cache) Get(key string) (interface{}, bool) {
	val, ok := c.local.Load(key)
	if !ok {
		return nil, false
	}

	entry := val.(*cacheItem)
	if time.Now().After(entry.Expiration) {
		c.local.Delete(key)
		return nil, false
	}

	return entry.Value, true
}

// Set stores a value in cache with TTL
func (c *Cache) Set(key string, value interface{}, ttl time.Duration) {
	entry := &cacheItem{
		Value:      value,
		Expiration: time.Now().Add(ttl),
	}
	c.local.Store(key, entry)
}

// GetOrCompute retrieves from cache or computes the value
// Uses singleflight to prevent cache stampede
func (c *Cache) GetOrCompute(ctx context.Context, key string, ttl time.Duration, fn func(context.Context) (interface{}, error)) (interface{}, error) {
	// Check cache first
	if val, ok := c.Get(key); ok {
		return val, nil
	}

	// Use singleflight to ensure only one goroutine computes the value
	val, err, _ := c.sf.Do(key, func() (interface{}, error) {
		// Double-check cache (might have been filled while waiting)
		if cached, ok := c.Get(key); ok {
			return cached, nil
		}

		// Compute value
		result, err := fn(ctx)
		if err != nil {
			return nil, err
		}

		// Store in cache
		c.Set(key, result, ttl)
		return result, nil
	})

	return val, err
}

// Delete removes a key from cache
func (c *Cache) Delete(key string) {
	c.local.Delete(key)
}

// cleanup periodically removes expired entries
func (c *Cache) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		now := time.Now()
		c.local.Range(func(key, value interface{}) bool {
			entry := value.(*cacheItem)
			if now.After(entry.Expiration) {
				c.local.Delete(key)
			}
			return true
		})
	}
}
