package repository

import (
	"context"

	"github.com/examlytics/server/internal/domain"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// ExamRepository defines interface for exam data access
type ExamRepository interface {
	FindAllExams(ctx context.Context) ([]*domain.Exam, error)
	FindExamByID(ctx context.Context, id string) (*domain.Exam, error)
	FindAllTopics(ctx context.Context) ([]*domain.Topic, error)
	CreateExamSession(session *domain.ExamSession) error
	FindExamSessionByID(ctx context.Context, id string) (*domain.ExamSession, error)
	UpdateExamSession(session *domain.ExamSession) error
	SaveSessionAnswers(answers []*domain.SessionAnswer) error
	FindQuestionsByExamID(ctx context.Context, examID string) ([]*domain.Question, error)
	FindQuestionByID(ctx context.Context, id string) (*domain.Question, error)
	CountExams(ctx context.Context) (int64, error)
	CountQuestions(ctx context.Context) (int64, error)
	FindAnswersBySessionID(ctx context.Context, sessionID string) ([]*domain.SessionAnswer, error)
	FindSessionsByUserID(ctx context.Context, userID string) ([]*domain.ExamSession, error)
	GetUserWeakTopics(ctx context.Context, userID string) ([]*domain.UserWeakTopic, error)
	UpsertUserWeakTopic(ctx context.Context, topic *domain.UserWeakTopic) error
	UpsertUserTopicAggregate(ctx context.Context, agg *domain.UserTopicAggregate) error
	CreateExamTopicStats(ctx context.Context, stats []*domain.ExamTopicStats) error
	FindUserTopicAggregate(ctx context.Context, userID, topic string) (*domain.UserTopicAggregate, error)
	FindUserTopicAggregates(ctx context.Context, userID string) ([]*domain.UserTopicAggregate, error)
}

// PostgresExamRepository implements ExamRepository for PostgreSQL
type PostgresExamRepository struct {
	db *gorm.DB
}

// NewPostgresExamRepository creates a new PostgresExamRepository
func NewPostgresExamRepository(db *gorm.DB) ExamRepository {
	return &PostgresExamRepository{db: db}
}

// FindAllExams retrieves all exams
func (r *PostgresExamRepository) FindAllExams(ctx context.Context) ([]*domain.Exam, error) {
	var exams []*domain.Exam
	if err := r.db.WithContext(ctx).Find(&exams).Error; err != nil {
		return nil, err
	}
	return exams, nil
}

// FindExamByID retrieves an exam by ID
func (r *PostgresExamRepository) FindExamByID(ctx context.Context, id string) (*domain.Exam, error) {
	var exam domain.Exam
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&exam).Error; err != nil {
		return nil, err
	}
	return &exam, nil
}

// FindAllTopics retrieves all topics
func (r *PostgresExamRepository) FindAllTopics(ctx context.Context) ([]*domain.Topic, error) {
	var topics []*domain.Topic
	if err := r.db.WithContext(ctx).Find(&topics).Error; err != nil {
		return nil, err
	}
	return topics, nil
}

// CreateExamSession creates a new exam session
func (r *PostgresExamRepository) CreateExamSession(session *domain.ExamSession) error {
	return r.db.Create(session).Error
}

// FindExamSessionByID finds a session by ID
func (r *PostgresExamRepository) FindExamSessionByID(ctx context.Context, id string) (*domain.ExamSession, error) {
	var session domain.ExamSession
	if err := r.db.WithContext(ctx).Preload("User").Where("id = ?", id).First(&session).Error; err != nil {
		return nil, err
	}
	return &session, nil
}

// UpdateExamSession updates an exam session
func (r *PostgresExamRepository) UpdateExamSession(session *domain.ExamSession) error {
	return r.db.Save(session).Error
}

// SaveSessionAnswers saves answers for a session
func (r *PostgresExamRepository) SaveSessionAnswers(answers []*domain.SessionAnswer) error {
	return r.db.Create(answers).Error
}

// FindQuestionsByExamID gets questions for an exam (mock logic for now since we don't have ExamQuestion mapping)
func (r *PostgresExamRepository) FindQuestionsByExamID(ctx context.Context, examID string) ([]*domain.Question, error) {
	// In a real app we would query the exam_questions join table
	// For now, let's just return 10 random questions
	var questions []*domain.Question
	if err := r.db.WithContext(ctx).Limit(10).Find(&questions).Error; err != nil {
		return nil, err
	}
	return questions, nil
}

// FindQuestionByID finds a question by ID
func (r *PostgresExamRepository) FindQuestionByID(ctx context.Context, id string) (*domain.Question, error) {
	var q domain.Question
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&q).Error; err != nil {
		return nil, err
	}
	return &q, nil
}

func (r *PostgresExamRepository) CountExams(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&domain.Exam{}).Count(&count).Error
	return count, err
}

func (r *PostgresExamRepository) CountQuestions(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&domain.Question{}).Count(&count).Error
	return count, err
}

// FindAnswersBySessionID retrieves all answers/questions for a session
func (r *PostgresExamRepository) FindAnswersBySessionID(ctx context.Context, sessionID string) ([]*domain.SessionAnswer, error) {
	var answers []*domain.SessionAnswer
	if err := r.db.WithContext(ctx).Preload("Question").Where("session_id = ?", sessionID).Find(&answers).Error; err != nil {
		return nil, err
	}
	return answers, nil
}

func (r *PostgresExamRepository) FindSessionsByUserID(ctx context.Context, userID string) ([]*domain.ExamSession, error) {
	var sessions []*domain.ExamSession
	if err := r.db.WithContext(ctx).Session(&gorm.Session{PrepareStmt: false}).Where("user_id = ?", userID).Order("started_at desc").Find(&sessions).Error; err != nil {
		return nil, err
	}
	return sessions, nil

}

func (r *PostgresExamRepository) GetUserWeakTopics(ctx context.Context, userID string) ([]*domain.UserWeakTopic, error) {
	var topics []*domain.UserWeakTopic
	if err := r.db.WithContext(ctx).Where("user_id = ? AND is_resolved = ?", userID, false).Find(&topics).Error; err != nil {
		return nil, err
	}
	return topics, nil
}

func (r *PostgresExamRepository) UpsertUserWeakTopic(ctx context.Context, topic *domain.UserWeakTopic) error {
	// Upsert based on UserID, TopicID, ExamType
	// We want to update accuracy, status, attempts if it exists
	var existing domain.UserWeakTopic
	err := r.db.WithContext(ctx).Where("user_id = ? AND topic_id = ? AND exam_type = ?", topic.UserID, topic.TopicID, topic.ExamType).First(&existing).Error

	if err == nil {
		// Update existing
		topic.ID = existing.ID
		topic.CreatedAt = existing.CreatedAt
		return r.db.Save(topic).Error
	}

	// Create new
	return r.db.Create(topic).Error
}

func (r *PostgresExamRepository) UpsertUserTopicAggregate(ctx context.Context, agg *domain.UserTopicAggregate) error {
	// GORM Clause to handle ON CONFLICT DO UPDATE
	// We want to update totals and averages.
	// However, passing a simplistic struct might overwrite.
	// We need to use an expression for atomic updates if possible, or read-modify-write if we are in a transaction.
	// Since this is high-performance, we can use a raw SQL or a smart GORM clause.
	// For simplicity and correctness with "running average" logic computed in Service, we assume Service passes the FINAL values.
	// BUT, concurrency issue: if two exams submitted for same topic same time.
	// Better: Service locks or we use DB expression.
	// User Requirement: "Pre-aggregate after exam submission".
	// Let's rely on Save (Upsert) assuming Service calculates value based on OLD value.
	// Service needs to fetch old value first? Yes.

	// Actually, easier to use clause.OnConflict to Update columns.
	// But calculating new average in SQL is hard.
	// Plan: Service does Read -> Calculate -> Write (Upsert).
	// So Repo just needs "Save".

	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "topic"}},
		DoUpdates: clause.AssignmentColumns([]string{"total_attempts", "avg_accuracy", "avg_time", "weak_score", "last_updated"}),
	}).Create(agg).Error
}

func (r *PostgresExamRepository) CreateExamTopicStats(ctx context.Context, stats []*domain.ExamTopicStats) error {
	return r.db.Create(stats).Error
}

// FindUserTopicAggregate finds specific aggregate
func (r *PostgresExamRepository) FindUserTopicAggregate(ctx context.Context, userID, topic string) (*domain.UserTopicAggregate, error) {
	var agg domain.UserTopicAggregate
	if err := r.db.WithContext(ctx).Where("user_id = ? AND topic = ?", userID, topic).First(&agg).Error; err != nil {
		return nil, err
	}
	return &agg, nil
}

func (r *PostgresExamRepository) FindUserTopicAggregates(ctx context.Context, userID string) ([]*domain.UserTopicAggregate, error) {
	var aggs []*domain.UserTopicAggregate
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).Order("weak_score desc").Find(&aggs).Error; err != nil {
		return nil, err
	}
	return aggs, nil
}
