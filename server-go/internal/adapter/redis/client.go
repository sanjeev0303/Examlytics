package redis

import (
	"context"
	"crypto/tls"
	"fmt"     // Corrected import
	"strings" // Added strings for prefix check
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisClient struct {
	Client *redis.Client
}

func NewRedisClient(url string) (*RedisClient, error) {
	opt, err := redis.ParseURL(url)
	if err != nil {
		return nil, err
	}

	// Force TLS for Upstash if rediss:// is used, ParseURL handles it but let's be safe if needed
	// But usually ParseURL is enough.
	// However, for local dev without TLS, we might need adjustments.
	// Assuming the URL provided in env is correct.

	// Explicitly set TLS config if scheme is rediss
	if strings.HasPrefix(url, "rediss://") {
		opt.TLSConfig = &tls.Config{
			MinVersion: tls.VersionTLS12,
		}
	}

	client := redis.NewClient(opt)

	if err := client.Ping(context.Background()).Err(); err != nil {
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
	// result is [queue_name, value]
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
