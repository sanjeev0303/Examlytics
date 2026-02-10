package cache

import (
	"context"
	"encoding/json"
	"sync"
	"time"

	"github.com/examlytics/server/internal/adapter/redis"
	"github.com/examlytics/server/pkg/logger"
)

// BackgroundRevalidator handles soft-expire cache revalidation.
// Items are served stale while being refreshed in the background.
type BackgroundRevalidator struct {
	redis        *redis.RedisClient
	revalidating sync.Map // tracks keys being revalidated
	stopCh       chan struct{}
	wg           sync.WaitGroup
}

// CacheEntry wraps cached data with metadata for soft-expire.
type CacheEntry struct {
	Data       interface{} `json:"data"`
	ExpiresAt  int64       `json:"expires_at"`  // Hard expiry (unix timestamp)
	SoftExpiry int64       `json:"soft_expiry"` // Soft expiry for background refresh
}

// NewBackgroundRevalidator creates a new revalidator.
func NewBackgroundRevalidator(redis *redis.RedisClient) *BackgroundRevalidator {
	return &BackgroundRevalidator{
		redis:  redis,
		stopCh: make(chan struct{}),
	}
}

// GetOrRefresh retrieves cached data, triggering background refresh if soft-expired.
func (r *BackgroundRevalidator) GetOrRefresh(
	ctx context.Context,
	key string,
	ttl time.Duration,
	softTTL time.Duration,
	refresh func(ctx context.Context) (interface{}, error),
) (interface{}, error) {
	// Try to get existing entry
	val, err := r.redis.Get(ctx, key)
	if err == nil {
		var entry CacheEntry
		if jsonErr := json.Unmarshal([]byte(val), &entry); jsonErr == nil {
			now := time.Now().Unix()

			// Check if soft-expired but not hard-expired
			if now > entry.SoftExpiry && now < entry.ExpiresAt {
				// Trigger background refresh (non-blocking)
				r.triggerBackgroundRefresh(key, ttl, softTTL, refresh)
			}

			// Return stale data immediately
			return entry.Data, nil
		}
	}

	// Cache miss - fetch synchronously
	data, err := refresh(ctx)
	if err != nil {
		return nil, err
	}

	// Store with soft-expire metadata
	r.storeEntry(ctx, key, data, ttl, softTTL)
	return data, nil
}

func (r *BackgroundRevalidator) triggerBackgroundRefresh(
	key string,
	ttl time.Duration,
	softTTL time.Duration,
	refresh func(ctx context.Context) (interface{}, error),
) {
	// Check if already revalidating this key
	if _, loaded := r.revalidating.LoadOrStore(key, true); loaded {
		return // Another goroutine is already refreshing
	}

	r.wg.Add(1)
	go func() {
		defer r.wg.Done()
		defer r.revalidating.Delete(key)

		// Use background context with timeout
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		data, err := refresh(ctx)
		if err != nil {
			logger.Warnf("Background refresh failed for key %s: %v", key, err)
			return
		}

		r.storeEntry(ctx, key, data, ttl, softTTL)
	}()
}

func (r *BackgroundRevalidator) storeEntry(
	ctx context.Context,
	key string,
	data interface{},
	ttl time.Duration,
	softTTL time.Duration,
) {
	now := time.Now()
	entry := CacheEntry{
		Data:       data,
		ExpiresAt:  now.Add(ttl).Unix(),
		SoftExpiry: now.Add(softTTL).Unix(),
	}

	encoded, err := json.Marshal(entry)
	if err != nil {
		logger.Warnf("Failed to marshal cache entry: %v", err)
		return
	}

	if err := r.redis.Set(ctx, key, encoded, ttl); err != nil {
		logger.Warnf("Failed to store cache entry: %v", err)
	}
}

// Stop gracefully shuts down background refresh goroutines.
func (r *BackgroundRevalidator) Stop() {
	close(r.stopCh)
	r.wg.Wait()
}

// Invalidate removes a cached key.
func (r *BackgroundRevalidator) Invalidate(ctx context.Context, key string) error {
	return r.redis.Delete(ctx, key)
}
