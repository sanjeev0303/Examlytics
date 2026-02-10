package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
	"github.com/rs/zerolog/log"
)

// Config holds all application configuration
type Config struct {
	Port            int
	Env             string
	LogLevel        string
	DatabaseURL     string
	ClerkSecretKey  string
	GeoIPDBPath     string
	AIServiceURL    string
	RedisURL        string
	AIServiceSecret string

	// Concurrency limits (admission control)
	MaxGlobalConcurrency        int // default: 3000 (total admitted requests)
	MaxLightConcurrency         int // default: 2000 (health, auth, metadata)
	MaxMediumConcurrency        int // default: 1000 (reads, analytics)
	MaxHeavyEndpointConcurrency int // default: 200  (writes, AI calls)
	MaxAIConcurrency            int // default: 10   (AI service client)
	WorkerPoolSize              int // default: 20
	RequestTimeoutSeconds       int // default: 15
}

// Load reads configuration from environment variables
func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Warn().Msg("No .env file found, using environment variables")
	}

	port, err := strconv.Atoi(getEnv("PORT", "8000"))
	if err != nil {
		port = 8000
	}

	// Parse concurrency limits with production-safe defaults
	globalConcurrency, _ := strconv.Atoi(getEnv("MAX_GLOBAL_CONCURRENCY", "3000"))
	lightConcurrency, _ := strconv.Atoi(getEnv("MAX_LIGHT_CONCURRENCY", "2000"))
	mediumConcurrency, _ := strconv.Atoi(getEnv("MAX_MEDIUM_CONCURRENCY", "1000"))
	heavyConcurrency, _ := strconv.Atoi(getEnv("MAX_HEAVY_CONCURRENCY", "200"))
	aiConcurrency, _ := strconv.Atoi(getEnv("MAX_AI_CONCURRENCY", "10"))
	workerPoolSize, _ := strconv.Atoi(getEnv("WORKER_POOL_SIZE", "20"))
	requestTimeout, _ := strconv.Atoi(getEnv("REQUEST_TIMEOUT_SECONDS", "15"))

	return &Config{
		Port:                        port,
		Env:                         getEnv("ENV", "development"),
		LogLevel:                    getEnv("LOG_LEVEL", "info"),
		DatabaseURL:                 getEnv("DATABASE_URL", ""),
		ClerkSecretKey:              getEnv("CLERK_SECRET_KEY", ""),
		GeoIPDBPath:                 getEnv("GEOIP_DB_PATH", "./data/GeoLite2-Country.mmdb"),
		AIServiceURL:                getEnv("AI_SERVICE_URL", "http://localhost:8001"),
		RedisURL:                    getEnv("REDIS_URL", ""),
		AIServiceSecret:             getEnv("AI_SERVICE_SECRET", "internal-secret"),
		MaxGlobalConcurrency:        globalConcurrency,
		MaxLightConcurrency:         lightConcurrency,
		MaxMediumConcurrency:        mediumConcurrency,
		MaxHeavyEndpointConcurrency: heavyConcurrency,
		MaxAIConcurrency:            aiConcurrency,
		WorkerPoolSize:              workerPoolSize,
		RequestTimeoutSeconds:       requestTimeout,
	}
}

// IsDevelopment returns true if running in development mode
func (c *Config) IsDevelopment() bool {
	return c.Env == "development"
}

// IsProduction returns true if running in production mode
func (c *Config) IsProduction() bool {
	return c.Env == "production"
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
