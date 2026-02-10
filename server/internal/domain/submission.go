package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SessionStatus tracks the state of an exam attempt
type SessionStatus string

const (
	SessionLive       SessionStatus = "LIVE"
	SessionCompleted  SessionStatus = "COMPLETED"
	SessionAborted    SessionStatus = "ABORTED"
	SessionPending    SessionStatus = "PENDING"
	SessionProcessing SessionStatus = "PROCESSING"
	SessionReady      SessionStatus = "READY"
	SessionFailed     SessionStatus = "FAILED"
)

// ExamSession represents a user's attempt at an exam
type ExamSession struct {
	ID             string        `json:"id" gorm:"type:uuid;primaryKey"`
	UserID         string        `json:"userId" gorm:"type:uuid;index;not null"`
	User           User          `json:"user" gorm:"foreignKey:UserID"`
	ExamID         *string       `json:"examId" gorm:"type:uuid;index"`    // Optional if custom generated
	Type           string        `json:"type" gorm:"type:varchar(20)"`     // JOB, CODING, etc.
	TopicID        string        `json:"topicId" gorm:"type:varchar(100)"` // For topic-based exams
	TotalQuestions int           `json:"totalQuestions" gorm:"not null"`
	Score          float64       `json:"score"`
	Accuracy       float64       `json:"accuracy"`  // Percentage
	TimeTaken      int           `json:"timeTaken"` // In seconds
	Status         SessionStatus `json:"status" gorm:"type:varchar(20);default:'LIVE';index"`
	StartedAt      time.Time     `json:"startedAt" gorm:"index"`
	CompletedAt    *time.Time    `json:"completedAt"`
	Recommendation string     `json:"recommendation"`
	WeakTopics     []byte     `json:"weakTopics" gorm:"type:jsonb"` // Stores []dto.WeakTopic

	// AI Service Integration
	Questions      []byte  `json:"questions" gorm:"type:jsonb"`      // Generated questions
	UserResponses  []byte  `json:"userResponses" gorm:"type:jsonb"`  // User answers
	CacheHash      *string `json:"cacheHash" gorm:"index"`           // Deduplication hash
	CachedAnalysis []byte     `json:"cachedAnalysis" gorm:"type:jsonb"` // Cached AI result
	JobError       *string    `json:"jobError"`                         // Error from AI worker
	CreatedAt      time.Time  `json:"createdAt"`
	UpdatedAt      time.Time  `json:"updatedAt"`
}

func (ExamSession) TableName() string {
	return "exam_sessions"
}

func (es *ExamSession) BeforeCreate(tx *gorm.DB) error {
	if es.ID == "" {
		es.ID = uuid.New().String()
	}
	return nil
}

// SessionAnswer represents a user's answer to a specific question
type SessionAnswer struct {
	ID         string    `json:"id" gorm:"type:uuid;primaryKey"`
	SessionID  string    `json:"sessionId" gorm:"type:uuid;index;not null"`
	QuestionID string    `json:"questionId" gorm:"type:uuid;index;not null"`
	Question   Question  `json:"question" gorm:"foreignKey:QuestionID"`
	UserAnswer string    `json:"userAnswer"`
	IsCorrect  bool      `json:"isCorrect"`
	TimeSpent  int       `json:"timeSpent"` // Seconds spent on this question
	IsFlagged  bool      `json:"isFlagged" gorm:"default:false"`
	CreatedAt  time.Time `json:"createdAt"`
}

func (SessionAnswer) TableName() string {
	return "session_answers"
}

func (sa *SessionAnswer) BeforeCreate(tx *gorm.DB) error {
	if sa.ID == "" {
		sa.ID = uuid.New().String()
	}
	return nil
}
