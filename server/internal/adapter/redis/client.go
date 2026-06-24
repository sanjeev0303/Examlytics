package redis

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
	"golang.org/x/sync/singleflight"
)

// RedisClient wraps redis.Client with caching utilities.
type RedisClient struct {
	Client *redis.Client
	sf     singleflight.Group // Stampede protection
}

func NewRedisClient(url string) (*RedisClient, error) {
	opt, err := redis.ParseURL(url)
	if err != nil {
		return nil, err
	}

	// Explicitly set TLS config if scheme is rediss
	if strings.HasPrefix(url, "rediss://") {
		if opt.TLSConfig == nil {
			opt.TLSConfig = &tls.Config{}
		}
		opt.TLSConfig.MinVersion = tls.VersionTLS12
	}

	// Connection pool settings optimized for Upstash
	opt.DialTimeout = 15 * time.Second
	opt.ReadTimeout = 10 * time.Second
	opt.WriteTimeout = 10 * time.Second
	opt.PoolSize = 50     
	opt.MinIdleConns = 1  
	opt.PoolTimeout = 15 * time.Second
	opt.ConnMaxIdleTime = 30 * time.Second
	opt.ConnMaxLifetime = 2 * time.Minute

	client := redis.NewClient(opt)

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to redis: %w", err)
	}

	return &RedisClient{Client: client}, nil
}

func (r *RedisClient) Publish(ctx context.Context, channel string, message interface{}) error {
	return r.Client.Publish(ctx, channel, message).Err()
}

func (r *RedisClient) Enqueue(ctx context.Context, queue string, item interface{}) error {
	return r.Client.RPush(ctx, queue, item).Err()
}

func (r *RedisClient) Dequeue(ctx context.Context, queue string, timeout time.Duration) (string, error) {
	result, err := r.Client.BLPop(ctx, timeout, queue).Result()
	if err != nil {
		return "", err
	}
	if len(result) < 2 {
		return "", fmt.Errorf("invalid result from BLPop")
	}
	return result[1], nil
}

func (r *RedisClient) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	return r.Client.Set(ctx, key, value, expiration).Err()
}

func (r *RedisClient) Get(ctx context.Context, key string) (string, error) {
	return r.Client.Get(ctx, key).Result()
}

// GetJSON retrieves and unmarshals a JSON value.
func (r *RedisClient) GetJSON(ctx context.Context, key string, dest interface{}) error {
	val, err := r.Client.Get(ctx, key).Result()
	if err != nil {
		return err
	}
	return json.Unmarshal([]byte(val), dest)
}

// SetJSON marshals and stores a value as JSON.
func (r *RedisClient) SetJSON(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return r.Client.Set(ctx, key, data, expiration).Err()
}

// GetOrSet retrieves from cache or computes and caches the value.
// Uses singleflight to prevent cache stampedes.
func (r *RedisClient) GetOrSet(ctx context.Context, key string, ttl time.Duration, compute func() (interface{}, error)) (string, error) {
	// Try cache first
	val, err := r.Client.Get(ctx, key).Result()
	if err == nil {
		return val, nil
	}
	if err != redis.Nil {
		return "", err
	}

	// Cache miss - use singleflight to prevent stampede
	result, err, _ := r.sf.Do(key, func() (interface{}, error) {
		// Double-check cache (another goroutine might have populated it)
		val, err := r.Client.Get(ctx, key).Result()
		if err == nil {
			return val, nil
		}

		// Compute the value
		computed, err := compute()
		if err != nil {
			return nil, err
		}

		// Store in cache
		var data string
		switch v := computed.(type) {
		case string:
			data = v
		case []byte:
			data = string(v)
		default:
			bytes, err := json.Marshal(computed)
			if err != nil {
				return nil, err
			}
			data = string(bytes)
		}

		if setErr := r.Client.Set(ctx, key, data, ttl).Err(); setErr != nil {
			// Log but don't fail - we have the computed value
		}

		return data, nil
	})

	if err != nil {
		return "", err
	}
	return result.(string), nil
}

// Delete removes a key from cache.
func (r *RedisClient) Delete(ctx context.Context, key string) error {
	return r.Client.Del(ctx, key).Err()
}

// DeletePattern removes keys matching a pattern.
func (r *RedisClient) DeletePattern(ctx context.Context, pattern string) error {
	iter := r.Client.Scan(ctx, 0, pattern, 100).Iterator()
	for iter.Next(ctx) {
		if err := r.Client.Del(ctx, iter.Val()).Err(); err != nil {
			return err
		}
	}
	return iter.Err()
}

// Exists checks if a key exists.
func (r *RedisClient) Exists(ctx context.Context, key string) (bool, error) {
	n, err := r.Client.Exists(ctx, key).Result()
	return n > 0, err
}

// Incr increments a counter atomically.
func (r *RedisClient) Incr(ctx context.Context, key string) (int64, error) {
	return r.Client.Incr(ctx, key).Result()
}

// SetWithNX sets a key only if it doesn't exist (useful for locks).
func (r *RedisClient) SetNX(ctx context.Context, key string, value interface{}, expiration time.Duration) (bool, error) {
	return r.Client.SetNX(ctx, key, value, expiration).Result()
}

// Subscribe returns a PubSub for a channel.
func (r *RedisClient) Subscribe(ctx context.Context, channel string) *redis.PubSub {
	return r.Client.Subscribe(ctx, channel)
}

// XAdd adds an entry to a Redis Stream.
func (r *RedisClient) XAdd(ctx context.Context, stream string, values map[string]interface{}) error {
	return r.Client.XAdd(ctx, &redis.XAddArgs{
		Stream: stream,
		Values: values,
		// MaxLen limits the stream size to prevent unbounded memory growth
		MaxLen: 1000,
		Approx: true,
	}).Err()
}

// XRead reads from one or more streams.
func (r *RedisClient) XRead(ctx context.Context, streams []string, count int64, block time.Duration) ([]redis.XStream, error) {
	return r.Client.XRead(ctx, &redis.XReadArgs{
		Streams: streams,
		Count:   count,
		Block:   block,
	}).Result()
}

// XGroupCreate creates a consumer group.
func (r *RedisClient) XGroupCreate(ctx context.Context, stream, group, start string) error {
	err := r.Client.XGroupCreate(ctx, stream, group, start).Err()
	// Ignore BUSYGROUP error if group already exists
	if err != nil && strings.Contains(err.Error(), "BUSYGROUP") {
		return nil
	}
	return err
}

// XReadGroup reads from a consumer group.
func (r *RedisClient) XReadGroup(ctx context.Context, group, consumer string, streams []string, count int64, block time.Duration) ([]redis.XStream, error) {
	return r.Client.XReadGroup(ctx, &redis.XReadGroupArgs{
		Group:    group,
		Consumer: consumer,
		Streams:  streams,
		Count:    count,
		Block:    block,
	}).Result()
}

// XAck acknowledges a message in a consumer group.
func (r *RedisClient) XAck(ctx context.Context, stream, group string, ids ...string) error {
	return r.Client.XAck(ctx, stream, group, ids...).Err()
}
