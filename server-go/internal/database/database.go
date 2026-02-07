package database

import (
	"fmt"

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

	sqlDB.SetMaxIdleConns(50)
	sqlDB.SetMaxOpenConns(200)

	logger.Info("Connected to database")

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

// Disconnect closes the database connection
func Disconnect(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
