package router

import (
	"time"

	"github.com/examlytics/server/internal/adapter/ai"
	"github.com/examlytics/server/internal/adapter/redis"
	"github.com/examlytics/server/internal/config"
	"github.com/examlytics/server/internal/handler"
	"github.com/examlytics/server/internal/middleware"
	"github.com/examlytics/server/internal/repository"
	"github.com/examlytics/server/internal/service"
	"github.com/examlytics/server/internal/worker"
	"github.com/examlytics/server/pkg/cache"
	"github.com/examlytics/server/pkg/logger"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Router wraps the gin engine with dependency injection
type Router struct {
	engine        *gin.Engine
	cfg           *config.Config
	db            *gorm.DB
	admissionCtrl *middleware.AdmissionController
}

// New creates a new Router with all dependencies injected
func New(cfg *config.Config, db *gorm.DB) *Router {
	// Force ReleaseMode to suppress debug logs as requested
	gin.SetMode(gin.ReleaseMode)

	engine := gin.New()

	// Initialize admission controller with configured limits
	admissionCtrl := middleware.NewAdmissionController()
	admissionCtrl.RegisterEndpoint("global", cfg.MaxGlobalConcurrency)       // 3000
	admissionCtrl.RegisterEndpoint("light", cfg.MaxLightConcurrency)         // 2000
	admissionCtrl.RegisterEndpoint("medium", cfg.MaxMediumConcurrency)       // 1000
	admissionCtrl.RegisterEndpoint("heavy", cfg.MaxHeavyEndpointConcurrency) // 200

	return &Router{
		engine:        engine,
		cfg:           cfg,
		db:            db,
		admissionCtrl: admissionCtrl,
	}
}

// Setup configures all routes and middleware
func (r *Router) Setup() *gin.Engine {
	// Initialize adapters with config
	aiClient := ai.NewAIClientWithConfig(ai.AIClientConfig{
		BaseURL:        r.cfg.AIServiceURL,
		Secret:         r.cfg.AIServiceSecret,
		MaxConcurrency: r.cfg.MaxAIConcurrency,
		Timeout:        time.Duration(r.cfg.RequestTimeoutSeconds) * time.Second,
		CacheEnabled:   true,
		CacheTTL:       1 * time.Hour,
	})

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
	// Initialize cache
	localCache := cache.NewCache()

	examService := service.NewExamService(examRepo, questionRepo, userRepo, aiClient, redisClient, analyticsService, localCache)

	// Initialize Workers
	if redisClient != nil {
		examWorker := worker.NewExamWorker(redisClient, examService)
		examWorker.Start()
	}

	// Initialize middleware with dependencies
	accessFilter := middleware.NewAccessFilter()
	botDetector := middleware.NewBotDetector()
	// Rate Limiters - Now reasonable limits
	globalLimiter := middleware.NewRateLimiter(60*1000, 1000) // 1k req/min global per IP
	authLimiter := middleware.NewRateLimiter(60*1000, 100)    // 100 req/min for auth per IP
	submitLimiter := middleware.NewRateLimiter(60*1000, 30)   // 30 req/min for submissions per IP
	waf := middleware.NewWAF()
	piiDetector := middleware.NewPIIDetector()
	clerkAuth := middleware.NewClerkAuth(r.cfg, userService)
	requestLogger := middleware.NewRequestLogger()

	// Timeout config
	requestTimeout := time.Duration(r.cfg.RequestTimeoutSeconds) * time.Second

	// Global middleware - ORDER MATTERS!
	// 1. Recovery and logging first
	r.engine.Use(gin.Recovery())
	r.engine.Use(requestLogger.Log())

	// 2. CORS for browser access
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"http://localhost:3000"} // Allow client origin
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Clerk-User-ID"}
	corsConfig.AllowCredentials = true
	r.engine.Use(cors.New(corsConfig))

	// Initialize handlers
	healthHandler := handler.NewHealthHandlerWithDeps(handler.HealthHandlerConfig{
		DB:          r.db,
		RedisClient: redisClient,
		AICircuit:   aiClient.GetCircuitBreaker(),
	})

	// 3. Basic filters (fast, no locks)
	r.engine.Use(accessFilter.Filter())

	// Health routes should bypass global admission control (to pass LB checks)
	r.registerHealthRoutes(healthHandler)

	// 4. CRITICAL: Global admission control BEFORE expensive operations
	// This enforces total concurrent request limit across ALL endpoints
	// Fast rejection when system is saturated prevents resource exhaustion
	r.engine.Use(r.admissionCtrl.Limit("global"))

	// 5. Now apply expensive middleware only for admitted requests
	dbGuard := middleware.NewDatabaseGuard(r.db)
	r.engine.Use(dbGuard.Protect())        // Fail fast if DB full
	r.engine.Use(clerkAuth.Authenticate()) // DB lookup for user
	r.engine.Use(globalLimiter.Limit())    // Now uses sharded locks
	r.engine.Use(botDetector.Detect())
	r.engine.Use(waf.Protect())
	r.engine.Use(piiDetector.Detect())

	// Initialize handlers
	userHandler := handler.NewUserHandler(userService)
	authHandler := handler.NewAuthHandler(userService)
	examHandler := handler.NewExamHandler(examService)
	analyticsHandler := handler.NewAnalyticsHandler(analyticsService, userRepo)

	// Metrics
	metricsHandler := handler.NewMetricsHandler(handler.MetricsConfig{
		AdmissionController: r.admissionCtrl,
		DB:                  r.db,
	})

	// Register routes with admission control and timeouts
	r.registerUserRoutes(userHandler, requestTimeout)
	r.registerAuthRoutes(authHandler, clerkAuth, authLimiter, requestTimeout)
	r.registerExamRoutes(examHandler, clerkAuth, submitLimiter, requestTimeout)
	r.registerAdminRoutes(userHandler)
	r.registerAnalyticsRoutes(analyticsHandler, clerkAuth, requestTimeout)

	// Metrics & Health
	r.engine.GET("/metrics", metricsHandler.Metrics)

	return r.engine
}

func (r *Router) registerHealthRoutes(h *handler.HealthHandler) {
	r.engine.GET("/health", h.HealthCheck)
	r.engine.GET("/health/detailed", h.ReadinessCheck)
}

func (r *Router) registerUserRoutes(h *handler.UserHandler, timeout time.Duration) {
	users := r.engine.Group("/users")
	users.Use(middleware.PropagateDeadline(timeout))
	{
		users.POST("", h.CreateUser)
		users.GET("", h.GetUsers)
		users.POST("/onboarding", h.OnboardUser)
		users.PUT("/preferences", h.OnboardUser) // Alias for updates
		users.GET("/weak-topics", h.GetWeakTopics)
	}
}

func (r *Router) registerAuthRoutes(h *handler.AuthHandler, auth *middleware.ClerkAuth, limiter *middleware.RateLimiter, timeout time.Duration) {
	authGroup := r.engine.Group("/auth")
	authGroup.Use(r.admissionCtrl.Limit("light")) // Light class: 2000 concurrent
	authGroup.Use(limiter.Limit())
	authGroup.Use(middleware.PropagateDeadline(timeout))
	{
		authGroup.POST("/sync", h.SyncUser)
		authGroup.GET("/me", auth.RequireLogin(), h.GetMe)
		authGroup.GET("/role", auth.RequireLogin(), h.GetRole)
	}
}

func (r *Router) registerExamRoutes(h *handler.ExamHandler, auth *middleware.ClerkAuth, submitLimiter *middleware.RateLimiter, timeout time.Duration) {
	// Public routes - medium class (1000 concurrent) for DB protection
	r.engine.GET("/exams",
		r.admissionCtrl.Limit("medium"),
		middleware.PropagateDeadline(5*time.Second),
		h.GetExams,
	)
	r.engine.GET("/topics",
		r.admissionCtrl.Limit("medium"),
		middleware.PropagateDeadline(5*time.Second),
		h.GetTopics,
	)

	examsAuth := r.engine.Group("/exams")
	examsAuth.Use(auth.RequireLogin())
	{
		// Read endpoints - medium class (1000 concurrent)
		examsAuth.GET("/session/config",
			r.admissionCtrl.Limit("medium"),
			middleware.PropagateDeadline(timeout),
			h.GetExamSessionConfig,
		)
		examsAuth.GET("/session/:id",
			r.admissionCtrl.Limit("medium"),
			middleware.PropagateDeadline(timeout),
			h.GetExamSession,
		)
		examsAuth.GET("/status/:jobId",
			r.admissionCtrl.Limit("medium"),
			middleware.PropagateDeadline(timeout),
			h.GetExamStatus,
		)
		examsAuth.GET("/history",
			r.admissionCtrl.Limit("medium"),
			middleware.PropagateDeadline(timeout),
			h.GetExamHistory,
		)
		examsAuth.GET("/weak-topics",
			r.admissionCtrl.Limit("medium"),
			middleware.PropagateDeadline(timeout),
			h.GetWeakTopics,
		)

		// Heavy write endpoints - heavy class (200 concurrent)
		examsAuth.POST("/start",
			r.admissionCtrl.Limit("heavy"),
			middleware.PropagateDeadline(timeout*2),
			h.StartExam,
		)
		examsAuth.POST("/submit",
			r.admissionCtrl.Limit("heavy"),
			submitLimiter.Limit(),
			middleware.PropagateDeadline(timeout*2),
			h.SubmitExam,
		)
	}
}

func (r *Router) registerAdminRoutes(h *handler.UserHandler) {
	admin := r.engine.Group("/admin")
	admin.Use(r.admissionCtrl.Limit("medium")) // Admin tools are medium priority
	admin.Use(middleware.PropagateDeadline(10 * time.Second))
	{
		admin.GET("/stats", h.GetAdminStats)
		admin.GET("/users/:id/ai-context", h.GetUserAIContext)
	}
}

func (r *Router) registerAnalyticsRoutes(h *handler.AnalyticsHandler, auth *middleware.ClerkAuth, timeout time.Duration) {
	analytics := r.engine.Group("/analytics")
	analytics.Use(auth.RequireLogin())
	analytics.Use(r.admissionCtrl.Limit("medium")) // Medium class: 1000 concurrent
	analytics.Use(middleware.PropagateDeadline(timeout))
	{
		analytics.GET("/learning-curve", h.GetLearningCurve)
		analytics.GET("/topic-curve/:topic", h.GetTopicCurve)
		analytics.GET("/readiness-score", h.GetInterviewReadiness)
		analytics.GET("/due-topics", h.GetDueTopics)
		analytics.POST("/recalculate-readiness", h.RecalculateReadiness)
		analytics.GET("/streaks", h.GetStreakData)
	}
}

// GetAdmissionController returns the admission controller for metrics.
func (r *Router) GetAdmissionController() *middleware.AdmissionController {
	return r.admissionCtrl
}
