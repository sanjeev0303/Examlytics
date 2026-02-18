package repository

import (
	"context"
	"time"

	"github.com/examlytics/server/internal/domain"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// ExamRepository defines interface for exam data access

// PostgresExamRepository implements ExamRepository for PostgreSQL
type PostgresExamRepository struct {
	db *gorm.DB
}

// NewPostgresExamRepository creates a new PostgresExamRepository
func NewPostgresExamRepository(db *gorm.DB) domain.ExamRepository {
	return &PostgresExamRepository{db: db}
}

// GetByID retrieves an exam by ID
func (r *PostgresExamRepository) GetByID(ctx context.Context, id string) (*domain.Exam, error) {
	return r.FindExamByID(ctx, id)
}

// Create creates a new exam
func (r *PostgresExamRepository) Create(ctx context.Context, exam *domain.Exam) error {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	return r.db.WithContext(ctx).Create(exam).Error
}

// Update updates an exam
func (r *PostgresExamRepository) Update(ctx context.Context, exam *domain.Exam) error {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	return r.db.WithContext(ctx).Save(exam).Error
}

// ListByUser returns exams for a user
func (r *PostgresExamRepository) ListByUser(ctx context.Context, userID string, limit, offset int) ([]*domain.Exam, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	var exams []*domain.Exam
	err := r.db.WithContext(ctx).Where("created_by = ?", userID).Limit(limit).Offset(offset).Find(&exams).Error
	return exams, err
}

// FindAllExams retrieves all exams
func (r *PostgresExamRepository) FindAllExams(ctx context.Context) ([]*domain.Exam, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	var exams []*domain.Exam
	if err := r.db.WithContext(ctx).Find(&exams).Error; err != nil {
		return nil, err
	}
	return exams, nil
}

// FindExamByID retrieves an exam by ID
func (r *PostgresExamRepository) FindExamByID(ctx context.Context, id string) (*domain.Exam, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	var exam domain.Exam
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&exam).Error; err != nil {
		return nil, err
	}
	return &exam, nil
}

// FindAllTopics retrieves all topics
func (r *PostgresExamRepository) FindAllTopics(ctx context.Context) ([]*domain.Topic, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	var topics []*domain.Topic
	if err := r.db.WithContext(ctx).Find(&topics).Error; err != nil {
		return nil, err
	}
	return topics, nil
}

// CreateExamSession creates a new exam session
func (r *PostgresExamRepository) CreateExamSession(session *domain.ExamSession) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	return r.db.WithContext(ctx).Create(session).Error
}

// FindExamSessionByID finds a session by ID
func (r *PostgresExamRepository) FindExamSessionByID(ctx context.Context, id string) (*domain.ExamSession, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	var session domain.ExamSession
	if err := r.db.WithContext(ctx).Preload("User").Where("id = ?", id).First(&session).Error; err != nil {
		return nil, err
	}
	return &session, nil
}

// UpdateExamSession updates an exam session
func (r *PostgresExamRepository) UpdateExamSession(session *domain.ExamSession) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	return r.db.WithContext(ctx).Save(session).Error
}

// SaveSessionAnswers saves answers for a session
func (r *PostgresExamRepository) SaveSessionAnswers(answers []*domain.SessionAnswer) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	return r.db.WithContext(ctx).Create(answers).Error
}

// FindQuestionsByExamID gets questions for an exam (mock logic for now since we don't have ExamQuestion mapping)
func (r *PostgresExamRepository) FindQuestionsByExamID(ctx context.Context, examID string) ([]*domain.Question, error) {
	// In a real app we would query the exam_questions join table
	// For now, let's just return 10 random questions
	var questions []*domain.Question
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	if err := r.db.WithContext(ctx).Limit(10).Find(&questions).Error; err != nil {
		return nil, err
	}
	return questions, nil
}

// FindQuestionByID finds a question by ID
func (r *PostgresExamRepository) FindQuestionByID(ctx context.Context, id string) (*domain.Question, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	var q domain.Question
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&q).Error; err != nil {
		return nil, err
	}
	return &q, nil
}

// FindQuestionsByIDs batch fetches questions by IDs - eliminates N+1 queries
func (r *PostgresExamRepository) FindQuestionsByIDs(ctx context.Context, ids []string) ([]*domain.Question, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	var questions []*domain.Question
	if err := r.db.WithContext(ctx).Where("id IN ?", ids).Find(&questions).Error; err != nil {
		return nil, err
	}
	return questions, nil
}

func (r *PostgresExamRepository) CountExams(ctx context.Context) (int64, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	var count int64
	err := r.db.WithContext(ctx).Model(&domain.Exam{}).Count(&count).Error
	return count, err
}

func (r *PostgresExamRepository) CountQuestions(ctx context.Context) (int64, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	var count int64
	err := r.db.WithContext(ctx).Model(&domain.Question{}).Count(&count).Error
	return count, err
}

// FindAnswersBySessionID retrieves all answers/questions for a session
func (r *PostgresExamRepository) FindAnswersBySessionID(ctx context.Context, sessionID string) ([]*domain.SessionAnswer, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	var answers []*domain.SessionAnswer
	if err := r.db.WithContext(ctx).Preload("Question").Where("session_id = ?", sessionID).Find(&answers).Error; err != nil {
		return nil, err
	}
	return answers, nil
}

func (r *PostgresExamRepository) FindSessionsByUserID(ctx context.Context, userID string) ([]*domain.ExamSession, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	var sessions []*domain.ExamSession
	if err := r.db.WithContext(ctx).Session(&gorm.Session{PrepareStmt: false}).Where("user_id = ?", userID).Order("started_at desc").Find(&sessions).Error; err != nil {
		return nil, err
	}
	return sessions, nil

}

func (r *PostgresExamRepository) GetUserWeakTopics(ctx context.Context, userID string) ([]*domain.UserWeakTopic, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	var topics []*domain.UserWeakTopic
	if err := r.db.WithContext(ctx).Where("user_id = ? AND is_resolved = ?", userID, false).Find(&topics).Error; err != nil {
		return nil, err
	}
	return topics, nil
}

func (r *PostgresExamRepository) UpsertUserWeakTopic(ctx context.Context, topic *domain.UserWeakTopic) error {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	// Upsert based on UserID, TopicID, ExamType
	// We want to update accuracy, status, attempts if it exists
	var existing domain.UserWeakTopic
	err := r.db.WithContext(ctx).Where("user_id = ? AND topic_id = ? AND exam_type = ?", topic.UserID, topic.TopicID, topic.ExamType).First(&existing).Error

	if err == nil {
		// Update existing
		topic.ID = existing.ID
		topic.CreatedAt = existing.CreatedAt
		return r.db.WithContext(ctx).Save(topic).Error
	}

	// Create new
	return r.db.WithContext(ctx).Create(topic).Error
}

func (r *PostgresExamRepository) UpsertUserTopicAggregate(ctx context.Context, agg *domain.UserTopicAggregate) error {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
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

	return r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "topic"}},
		DoUpdates: clause.AssignmentColumns([]string{"total_attempts", "avg_accuracy", "avg_time", "weak_score", "last_updated"}),
	}).Create(agg).Error
}

func (r *PostgresExamRepository) CreateExamTopicStats(ctx context.Context, stats []*domain.ExamTopicStats) error {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	return r.db.WithContext(ctx).Create(stats).Error
}

// FindUserTopicAggregate finds specific aggregate
func (r *PostgresExamRepository) FindUserTopicAggregate(ctx context.Context, userID, topic string) (*domain.UserTopicAggregate, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	var agg domain.UserTopicAggregate
	if err := r.db.WithContext(ctx).Where("user_id = ? AND topic = ?", userID, topic).First(&agg).Error; err != nil {
		return nil, err
	}
	return &agg, nil
}

func (r *PostgresExamRepository) FindUserTopicAggregates(ctx context.Context, userID string) ([]*domain.UserTopicAggregate, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	var aggs []*domain.UserTopicAggregate
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).Order("weak_score desc").Find(&aggs).Error; err != nil {
		return nil, err
	}
	return aggs, nil
}

// GetAttendedExamTypes retrieves distinct exam types attended by the user
func (r *PostgresExamRepository) GetAttendedExamTypes(ctx context.Context, userID string) ([]string, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	var types []string
	// Use DISTINCT to get unique types from exam_sessions
	if err := r.db.WithContext(ctx).Model(&domain.ExamSession{}).
		Where("user_id = ? AND type IS NOT NULL AND type != ''", userID).
		Distinct("type").
		Pluck("type", &types).Error; err != nil {
		return nil, err
	}
	// Filter out empty strings if any
	var validTypes []string
	for _, t := range types {
		if t != "" {
			validTypes = append(validTypes, t)
		}
	}
	return validTypes, nil
}

// ListPublic retrieves public exams, optionally filtered by types
func (r *PostgresExamRepository) ListPublic(limit, offset int, types []string) ([]*domain.Exam, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var exams []*domain.Exam
	query := r.db.WithContext(ctx).Where("is_public = ?", true)

	if len(types) > 0 {
		query = query.Where("type IN ?", types)
	}

	if err := query.Limit(limit).Offset(offset).Find(&exams).Error; err != nil {
		return nil, err
	}
	return exams, nil
}
