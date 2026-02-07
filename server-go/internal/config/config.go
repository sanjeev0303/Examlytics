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

	return &Config{
		Port:            port,
		Env:             getEnv("ENV", "development"),
		LogLevel:        getEnv("LOG_LEVEL", "info"),
		DatabaseURL:     getEnv("DATABASE_URL", ""),
		ClerkSecretKey:  getEnv("CLERK_SECRET_KEY", ""),
		GeoIPDBPath:     getEnv("GEOIP_DB_PATH", "./data/GeoLite2-Country.mmdb"),
		AIServiceURL:    getEnv("AI_SERVICE_URL", "http://localhost:8000"),
		RedisURL:        getEnv("REDIS_URL", ""),
		AIServiceSecret: getEnv("AI_SERVICE_SECRET", "internal-secret"),
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
