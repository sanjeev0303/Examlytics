package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

// Shared Enums

type Difficulty string

const (
	DifficultyEasy   Difficulty = "EASY"
	DifficultyMedium Difficulty = "MEDIUM"
	DifficultyHard   Difficulty = "HARD"
)

type QuestionType string

const (
	QuestionTypeMCQ    QuestionType = "MCQ"
	QuestionTypeCode   QuestionType = "CODE"
	QuestionTypeBlanks QuestionType = "BLANKS"
)

// Topic represents a subject or category
type Topic struct {
	ID          string    `json:"id" gorm:"type:uuid;primaryKey"`
	Name        string    `json:"name" gorm:"uniqueIndex;not null"`
	Description string    `json:"description"`
	ParentID    *string   `json:"parentId" gorm:"type:uuid"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (Topic) TableName() string {
	return "topics"
}

func (t *Topic) BeforeCreate(tx *gorm.DB) error {
	if t.ID == "" {
		t.ID = uuid.New().String()
	}
	return nil
}

// Question represents a single question in the question bank
type Question struct {
	ID            string         `json:"id" gorm:"type:uuid;primaryKey"`
	Text          string         `json:"text" gorm:"type:text;not null"`
	CodeSnippet   string         `json:"codeSnippet,omitempty" gorm:"type:text"`
	Type          QuestionType   `json:"type" gorm:"type:varchar(20);default:'MCQ'"`
	Difficulty    Difficulty     `json:"difficulty" gorm:"type:varchar(10);not null"`
	TopicID       string         `json:"topicId" gorm:"type:uuid;index;not null"`
	Topic         Topic          `json:"topic" gorm:"foreignKey:TopicID"`
	Options       pq.StringArray `json:"options" gorm:"type:text[]"`
	CorrectAnswer string         `json:"correctAnswer" gorm:"type:text;not null"`
	Explanation   string         `json:"explanation" gorm:"type:text"`
	Tags          pq.StringArray `json:"tags" gorm:"type:text[]"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
}

func (Question) TableName() string {
	return "questions"
}

func (q *Question) BeforeCreate(tx *gorm.DB) error {
	if q.ID == "" {
		q.ID = uuid.New().String()
	}
	return nil
}
