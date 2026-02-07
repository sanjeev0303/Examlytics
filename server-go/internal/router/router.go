package router

import (
	"github.com/examlytics/server/internal/adapter/ai"
	"github.com/examlytics/server/internal/adapter/redis"
	"github.com/examlytics/server/internal/config"
	"github.com/examlytics/server/internal/handler"
	"github.com/examlytics/server/internal/middleware"
	"github.com/examlytics/server/internal/repository"
	"github.com/examlytics/server/internal/service"
	"github.com/examlytics/server/internal/worker"
	"github.com/examlytics/server/pkg/logger"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Router wraps the gin engine with dependency injection
type Router struct {
	engine *gin.Engine
	cfg    *config.Config
	db     *gorm.DB
}

// New creates a new Router with all dependencies injected
func New(cfg *config.Config, db *gorm.DB) *Router {
	// Force ReleaseMode to suppress debug logs as requested
	gin.SetMode(gin.ReleaseMode)

	engine := gin.New()

	return &Router{
		engine: engine,
		cfg:    cfg,
		db:     db,
	}
}

// Setup configures all routes and middleware
func (r *Router) Setup() *gin.Engine {
	// Initialize adapters
	aiClient := ai.NewAIClient(r.cfg.AIServiceURL, r.cfg.AIServiceSecret)
	redisClient, err := redis.NewRedisClient(r.cfg.RedisURL)
	if err != nil && r.cfg.RedisURL != "" {
		logger.Errorf("Failed to connect to Redis: %v", err)
	}

	// Initialize repositories
	userRepo := repository.NewPostgresUserRepository(r.db)
	examRepo := repository.NewPostgresExamRepository(r.db)
	questionRepo := repository.NewPostgresQuestionRepository(r.db)
	analyticsRepo := repository.NewAnalyticsRepository(r.db)

	// Initialize services
	userService := service.NewUserService(userRepo, examRepo)
	analyticsService := service.NewAnalyticsService(analyticsRepo, examRepo, userRepo)
	examService := service.NewExamService(examRepo, questionRepo, userRepo, aiClient, redisClient, analyticsService)

	// Initialize Workers
	if redisClient != nil {
		examWorker := worker.NewExamWorker(redisClient, examService)
		examWorker.Start()
	}

	// Initialize middleware with dependencies
	accessFilter := middleware.NewAccessFilter()
	botDetector := middleware.NewBotDetector()
	// Rate Limiters - Granular
	// Rate Limiters - Granular
	globalLimiter := middleware.NewRateLimiter(60*1000, 100000) // 100k req/min global
	authLimiter := middleware.NewRateLimiter(60*1000, 50000)    // 50k req/min for auth
	submitLimiter := middleware.NewRateLimiter(60*1000, 50000)  // 50k req/min for submissions
	waf := middleware.NewWAF()
	piiDetector := middleware.NewPIIDetector()
	clerkAuth := middleware.NewClerkAuth(r.cfg, userService)
	requestLogger := middleware.NewRequestLogger()

	// Global middleware
	r.engine.Use(gin.Recovery())
	r.engine.Use(requestLogger.Log())

	// CORS Setup
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"http://localhost:3000"} // Allow client origin
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Clerk-User-ID"}
	corsConfig.AllowCredentials = true
	r.engine.Use(cors.New(corsConfig))

	r.engine.Use(accessFilter.Filter())
	// Use Middleware
	r.engine.Use(clerkAuth.Authenticate())
	r.engine.Use(botDetector.Detect())
	r.engine.Use(waf.Protect())
	r.engine.Use(piiDetector.Detect())
	r.engine.Use(globalLimiter.Limit())

	// Initialize handlers
	userHandler := handler.NewUserHandler(userService)
	authHandler := handler.NewAuthHandler(userService)
	examHandler := handler.NewExamHandler(examService)
	healthHandler := handler.NewHealthHandler()
	analyticsHandler := handler.NewAnalyticsHandler(analyticsService, userRepo)

	// Register routes
	r.registerHealthRoutes(healthHandler)
	r.registerUserRoutes(userHandler)
	r.registerAuthRoutes(authHandler, clerkAuth, authLimiter)
	r.registerExamRoutes(examHandler, clerkAuth, submitLimiter)
	r.registerAdminRoutes(userHandler) // New admin routes
	r.registerAnalyticsRoutes(analyticsHandler, clerkAuth)

	return r.engine
}

func (r *Router) registerHealthRoutes(h *handler.HealthHandler) {
	r.engine.GET("/health", h.HealthCheck)
}

func (r *Router) registerUserRoutes(h *handler.UserHandler) {
	users := r.engine.Group("/users")
	{
		users.POST("", h.CreateUser)
		users.GET("", h.GetUsers)
		users.POST("/onboarding", h.OnboardUser)
		users.PUT("/preferences", h.OnboardUser) // Alias for updates
		users.GET("/weak-topics", h.GetWeakTopics)
	}
}

func (r *Router) registerAuthRoutes(h *handler.AuthHandler, auth *middleware.ClerkAuth, limiter *middleware.RateLimiter) {
	authGroup := r.engine.Group("/auth")
	authGroup.Use(limiter.Limit())
	{
		authGroup.POST("/sync", h.SyncUser)
		authGroup.GET("/me", auth.RequireLogin(), h.GetMe)
		authGroup.GET("/role", auth.RequireLogin(), h.GetRole)
	}
}

func (r *Router) registerExamRoutes(h *handler.ExamHandler, auth *middleware.ClerkAuth, submitLimiter *middleware.RateLimiter) {
	r.engine.GET("/exams", h.GetExams)
	r.engine.GET("/topics", h.GetTopics)

	examsAuth := r.engine.Group("/exams")
	examsAuth.Use(auth.RequireLogin())
	{
		examsAuth.GET("/session/config", h.GetExamSessionConfig)
		examsAuth.GET("/session/:id", h.GetExamSession)
		examsAuth.POST("/start", h.StartExam)
		examsAuth.GET("/status/:jobId", h.GetExamStatus) // New polling endpoint
		examsAuth.POST("/submit", submitLimiter.Limit(), h.SubmitExam)
		examsAuth.GET("/history", h.GetExamHistory)
		examsAuth.GET("/weak-topics", h.GetWeakTopics)
	}
}

// GetExamHistory handles GET /exams/history
func (r *Router) registerAdminRoutes(h *handler.UserHandler) {
	admin := r.engine.Group("/admin")
	// Add admin middleware check here ideally
	{
		admin.GET("/stats", h.GetAdminStats)
		admin.GET("/users/:id/ai-context", h.GetUserAIContext)
	}
}

func (r *Router) registerAnalyticsRoutes(h *handler.AnalyticsHandler, auth *middleware.ClerkAuth) {
	analytics := r.engine.Group("/analytics")
	analytics.Use(auth.RequireLogin())
	{
		analytics.GET("/learning-curve", h.GetLearningCurve)
		analytics.GET("/topic-curve/:topic", h.GetTopicCurve)
		analytics.GET("/readiness-score", h.GetInterviewReadiness)
		analytics.GET("/due-topics", h.GetDueTopics)
		analytics.POST("/recalculate-readiness", h.RecalculateReadiness)
	}
}
