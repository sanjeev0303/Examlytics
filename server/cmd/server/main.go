package main

import (
	"context"
	"fmt"
	"net/http"
	_ "net/http/pprof" // Register pprof handlers
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/examlytics/server/internal/config"
	"github.com/examlytics/server/internal/database"
	"github.com/examlytics/server/internal/router"
	"github.com/examlytics/server/pkg/logger"
	"github.com/gin-gonic/gin"
)

func init() {
	gin.SetMode(gin.ReleaseMode)
}

func main() {
	// Load configuration
	cfg := config.Load()

	// Setup logger
	logger.Setup(cfg.LogLevel)

	// Connect to database
	db, err := database.Connect(cfg)
	if err != nil {
		logger.Fatal(err, "Failed to connect to database")
	}

	// Run migrations
	if err := database.Migrate(db); err != nil {
		logger.Fatal(err, "Failed to run migrations")
	}

	// Seed sample data
	if err := database.SeedExams(db); err != nil {
		logger.Warnf("Failed to seed exams: %v", err)
		// Don't fail the entire application for seed data
	}

	// Check for migrate-only flag
	if len(os.Args) > 1 && os.Args[1] == "--migrate-only" {
		logger.Info("Migration completed. Exiting.")
		return
	}

	// Start pprof server for profiling
	go func() {
		logger.Info("Starting pprof server on :6060")
		if err := http.ListenAndServe("localhost:6060", nil); err != nil {
			logger.Warnf("pprof server failed: %v", err)
		}
	}()

	// Setup router with dependency injection
	r := router.New(cfg, db)
	engine := r.Setup()

	// Create HTTP server
	srv := &http.Server{
		Addr:    fmt.Sprintf(":%d", cfg.Port),
		Handler: engine,
		// Optimization: Increase timeouts to prevent 502s from Load Balancers
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       120 * time.Second,
		ReadHeaderTimeout: 10 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		logger.Infof("🚀 Server is running on port %d", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal(err, "Failed to start server")
		}
	}()

	// Graceful Shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	sig := <-quit

	logger.Infof("%s received: closing HTTP server", sig.String())

	// Create shutdown context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Shutdown server
	if err := srv.Shutdown(ctx); err != nil {
		logger.Error(err, "Server forced to shutdown")
	}

	logger.Info("HTTP server closed")

	// Close database connection
	if err := database.Disconnect(db); err != nil {
		logger.Error(err, "Error during database disconnect")
	} else {
		logger.Info("Database connection closed")
	}

	logger.Info("Server exited gracefully")
}
