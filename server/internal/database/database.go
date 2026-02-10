package database

import (
	"fmt"
	"time"

	"github.com/examlytics/server/internal/config"
	"github.com/examlytics/server/internal/domain"
	"github.com/examlytics/server/pkg/logger"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
)

// Connect establishes a connection to the PostgreSQL database
func Connect(cfg *config.Config) (*gorm.DB, error) {
	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}

	// Use Silent mode to suppress SQL logs
	// Change to gormlogger.Warn or gormlogger.Error for less verbose logging
	logLevel := gormlogger.Silent

	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{
		Logger:      gormlogger.Default.LogMode(logLevel),
		PrepareStmt: false,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying DB: %w", err)
	}

	// Connection pool tuning for high concurrency
	sqlDB.SetMaxIdleConns(25)                  // Reduce idle connections (was 50)
	sqlDB.SetMaxOpenConns(100)                 // Cap max connections (was 200)
	sqlDB.SetConnMaxLifetime(30 * time.Minute) // Recycle connections
	sqlDB.SetConnMaxIdleTime(5 * time.Minute)  // Close idle connections faster

	// Verify connection with ping
	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	logger.Info("Connected to database with optimized pool settings")

	return db, nil
}

// Migrate runs database migrations
func Migrate(db *gorm.DB) error {
	logger.Info("Running database migrations...")

	if err := db.AutoMigrate(
		&domain.User{},
		&domain.UserPreference{},
		&domain.Topic{},
		&domain.Question{},
		&domain.Exam{},
		&domain.ExamSession{},
		&domain.SessionAnswer{},
		&domain.UserWeakTopic{},
		&domain.UserTopicAggregate{},
		&domain.ExamTopicStats{},
		&domain.UserAIContext{},
		// Analytics & Learning Intelligence
		&domain.LearningSnapshot{},
		&domain.TopicMasteryHistory{},
		&domain.InterviewReadiness{},
		&domain.QuestionStats{},
		&domain.UserTopicSchedule{},
	); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	// Create GIN index for UserAIContext topicMastery
	// GORM doesn't support expression indexes via tags easily
	if err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_user_ai_contexts_topic_mastery
		ON user_ai_contexts USING GIN ((context_data -> 'topicMastery'))`).Error; err != nil {
		logger.Warnf("Failed to create index idx_user_ai_contexts_topic_mastery: %v", err)
		// Don't fail the entire migration for an index
	}

	logger.Info("Database migrations completed")
	return nil
}

// SeedExams populates the database with sample exams if empty
func SeedExams(db *gorm.DB) error {
	var count int64
	db.Model(&domain.Exam{}).Count(&count)

	if count > 0 {
		logger.Info("Exams already seeded, skipping...")
		return nil
	}

	logger.Info("Seeding sample exams...")

	exams := []domain.Exam{
		{
			Title:       "Software Engineering Fundamentals",
			Description: "Test your knowledge of core software engineering concepts",
			Duration:    30,
			Difficulty:  domain.DifficultyMedium,
			Type:        "TECHNICAL",
			IsPublic:    true,
		},
		{
			Title:       "Data Structures & Algorithms",
			Description: "Master the fundamentals of DSA",
			Duration:    45,
			Difficulty:  domain.DifficultyHard,
			Type:        "CODING",
			IsPublic:    true,
		},
		{
			Title:       "System Design Basics",
			Description: "Learn system design principles and patterns",
			Duration:    60,
			Difficulty:  domain.DifficultyMedium,
			Type:        "TECHNICAL",
			IsPublic:    true,
		},
		{
			Title:       "Database Fundamentals",
			Description: "SQL, NoSQL, and database design concepts",
			Duration:    40,
			Difficulty:  domain.DifficultyMedium,
			Type:        "TECHNICAL",
			IsPublic:    true,
		},
		{
			Title:       "Web Development Essentials",
			Description: "Frontend, backend, and full-stack concepts",
			Duration:    35,
			Difficulty:  domain.DifficultyEasy,
			Type:        "TECHNICAL",
			IsPublic:    true,
		},
	}

	for _, exam := range exams {
		if err := db.Create(&exam).Error; err != nil {
			return fmt.Errorf("failed to seed exam: %w", err)
		}
	}

	logger.Info("Sample exams seeded successfully")
	return nil
}

// Disconnect closes the database connection
func Disconnect(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
