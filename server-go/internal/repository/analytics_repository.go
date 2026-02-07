package repository

import (
	"context"
	"time"

	"github.com/examlytics/server/internal/domain"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// AnalyticsRepository handles persistence for analytics domain models
type AnalyticsRepository interface {
	// Learning Snapshots
	CreateSnapshot(ctx context.Context, snapshot *domain.LearningSnapshot) error
	GetUserSnapshots(ctx context.Context, userID string, limit int) ([]*domain.LearningSnapshot, error)

	// Topic Mastery History
	UpsertTopicMasteryHistory(ctx context.Context, history *domain.TopicMasteryHistory) error
	GetTopicHistory(ctx context.Context, userID, topic string, limit int) ([]*domain.TopicMasteryHistory, error)

	// Interview Readiness
	UpsertInterviewReadiness(ctx context.Context, readiness *domain.InterviewReadiness) error
	GetInterviewReadiness(ctx context.Context, userID string) (*domain.InterviewReadiness, error)

	// Question Stats
	UpsertQuestionStats(ctx context.Context, stats *domain.QuestionStats) error
	GetQuestionStats(ctx context.Context, questionHash string) (*domain.QuestionStats, error)

	// Spaced Repetition
	UpsertTopicSchedule(ctx context.Context, schedule *domain.UserTopicSchedule) error
	GetDueTopics(ctx context.Context, userID string) ([]*domain.UserTopicSchedule, error)
	GetTopicSchedule(ctx context.Context, userID, topic string) (*domain.UserTopicSchedule, error)
}

type analyticsRepositoryImpl struct {
	db *gorm.DB
}

func NewAnalyticsRepository(db *gorm.DB) AnalyticsRepository {
	return &analyticsRepositoryImpl{db: db}
}

// Learning Snapshots

func (r *analyticsRepositoryImpl) CreateSnapshot(ctx context.Context, snapshot *domain.LearningSnapshot) error {
	return r.db.WithContext(ctx).Create(snapshot).Error
}

func (r *analyticsRepositoryImpl) GetUserSnapshots(ctx context.Context, userID string, limit int) ([]*domain.LearningSnapshot, error) {
	var snapshots []*domain.LearningSnapshot
	err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("timestamp DESC").
		Limit(limit).
		Find(&snapshots).Error
	return snapshots, err
}

// Topic Mastery History

func (r *analyticsRepositoryImpl) UpsertTopicMasteryHistory(ctx context.Context, history *domain.TopicMasteryHistory) error {
	today := time.Now().Truncate(24 * time.Hour)

	// Try to find existing record for today
	var existing domain.TopicMasteryHistory
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND topic = ? AND date = ?", history.UserID, history.Topic, today).
		First(&existing).Error

	if err == gorm.ErrRecordNotFound {
		history.Date = today
		return r.db.WithContext(ctx).Create(history).Error
	}

	if err != nil {
		return err
	}

	// Update existing
	return r.db.WithContext(ctx).Model(&existing).Update("mastery_score", history.MasteryScore).Error
}

func (r *analyticsRepositoryImpl) GetTopicHistory(ctx context.Context, userID, topic string, limit int) ([]*domain.TopicMasteryHistory, error) {
	var history []*domain.TopicMasteryHistory
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND topic = ?", userID, topic).
		Order("date DESC").
		Limit(limit).
		Find(&history).Error
	return history, err
}

// Interview Readiness

func (r *analyticsRepositoryImpl) UpsertInterviewReadiness(ctx context.Context, readiness *domain.InterviewReadiness) error {
	return r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"score", "status", "topic_mastery_avg", "consistency_score", "confidence_score", "difficulty_factor", "speed_factor", "last_calculated"}),
	}).Create(readiness).Error
}

func (r *analyticsRepositoryImpl) GetInterviewReadiness(ctx context.Context, userID string) (*domain.InterviewReadiness, error) {
	var readiness domain.InterviewReadiness
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).First(&readiness).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &readiness, err
}

// Question Stats

func (r *analyticsRepositoryImpl) UpsertQuestionStats(ctx context.Context, stats *domain.QuestionStats) error {
	return r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "question_hash"}},
		DoUpdates: clause.AssignmentColumns([]string{
			"attempt_count", "correct_count", "total_confidence", "total_time_spent",
			"avg_confidence", "avg_time_spent", "difficulty_index", "calibrated_difficulty", "last_updated",
		}),
	}).Create(stats).Error
}

func (r *analyticsRepositoryImpl) GetQuestionStats(ctx context.Context, questionHash string) (*domain.QuestionStats, error) {
	var stats domain.QuestionStats
	err := r.db.WithContext(ctx).Where("question_hash = ?", questionHash).First(&stats).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &stats, err
}

// Spaced Repetition

func (r *analyticsRepositoryImpl) UpsertTopicSchedule(ctx context.Context, schedule *domain.UserTopicSchedule) error {
	return r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "topic"}},
		DoUpdates: clause.AssignmentColumns([]string{"mastery_score", "next_review_date", "last_review_date", "review_count", "updated_at"}),
	}).Create(schedule).Error
}

func (r *analyticsRepositoryImpl) GetDueTopics(ctx context.Context, userID string) ([]*domain.UserTopicSchedule, error) {
	var schedules []*domain.UserTopicSchedule
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND next_review_date <= ?", userID, time.Now()).
		Order("mastery_score ASC"). // Weakest first
		Find(&schedules).Error
	return schedules, err
}

func (r *analyticsRepositoryImpl) GetTopicSchedule(ctx context.Context, userID, topic string) (*domain.UserTopicSchedule, error) {
	var schedule domain.UserTopicSchedule
	err := r.db.WithContext(ctx).Where("user_id = ? AND topic = ?", userID, topic).First(&schedule).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &schedule, err
}
