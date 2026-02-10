package repository

import (
	"github.com/examlytics/server/internal/domain"
	"gorm.io/gorm"
)

type PostgresQuestionRepository struct {
	db *gorm.DB
}

func NewPostgresQuestionRepository(db *gorm.DB) domain.QuestionRepository {
	return &PostgresQuestionRepository{db: db}
}

func (r *PostgresQuestionRepository) Create(question *domain.Question) error {
	return r.db.Create(question).Error
}

func (r *PostgresQuestionRepository) FindByID(id string) (*domain.Question, error) {
	var q domain.Question
	if err := r.db.Preload("Topic").Where("id = ?", id).First(&q).Error; err != nil {
		return nil, err
	}
	return &q, nil
}

func (r *PostgresQuestionRepository) FindByTopic(topicID string, limit int) ([]*domain.Question, error) {
	var questions []*domain.Question
	if err := r.db.Where("topic_id = ?", topicID).Limit(limit).Find(&questions).Error; err != nil {
		return nil, err
	}
	return questions, nil
}

func (r *PostgresQuestionRepository) GetRandomQuestions(count int, topicIDs []string, difficulty domain.Difficulty) ([]*domain.Question, error) {
	var questions []*domain.Question
	query := r.db.Model(&domain.Question{})

	if len(topicIDs) > 0 {
		query = query.Where("topic_id IN ?", topicIDs)
	}

	if difficulty != "" {
		query = query.Where("difficulty = ?", difficulty)
	}

	// This is not efficient for large datasets but works for MVP
	if err := query.Order("RANDOM()").Limit(count).Find(&questions).Error; err != nil {
		return nil, err
	}

	return questions, nil
}
