package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type WeakTopicStatus string

const (
	StatusWeak      WeakTopicStatus = "WEAK"
	StatusImproving WeakTopicStatus = "IMPROVING"
	StatusResolved  WeakTopicStatus = "RESOLVED"
)

// UserWeakTopic tracks a user's performance on weak topics over time
type UserWeakTopic struct {
	ID            string          `json:"id" gorm:"type:uuid;primaryKey"`
	UserID        string          `json:"userId" gorm:"type:uuid;index;not null"`
	TopicID       string          `json:"topicId" gorm:"type:uuid;index;not null"`
	TopicName     string          `json:"topicName" gorm:"type:varchar(255);not null"` // Cached for easy access
	ExamType      string          `json:"examType" gorm:"type:varchar(50);not null"`   // e.g., "JEE", "JOB"
	Accuracy      float64         `json:"accuracy"`                                    // Current accuracy
	Attempts      int             `json:"attempts"`
	Status        WeakTopicStatus `json:"status" gorm:"type:varchar(20);default:'WEAK'"`
	IsResolved    bool            `json:"isResolved" gorm:"default:false"`
	LastAttemptAt time.Time       `json:"lastAttemptAt"`
	CreatedAt     time.Time       `json:"createdAt"`
	UpdatedAt     time.Time       `json:"updatedAt"`
}

func (UserWeakTopic) TableName() string {
	return "user_weak_topics"
}

func (u *UserWeakTopic) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	return nil
}
