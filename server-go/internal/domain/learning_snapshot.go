package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// LearningSnapshot stores time-series data for learning curve visualization.
// Appended after every exam, never overwritten.
type LearningSnapshot struct {
	ID            string    `json:"id" gorm:"type:uuid;primaryKey"`
	UserID        string    `json:"userId" gorm:"type:uuid;index;not null"`
	SessionID     string    `json:"sessionId" gorm:"type:uuid;index;not null"`
	OverallScore  float64   `json:"overallScore" gorm:"type:float"`
	Accuracy      float64   `json:"accuracy" gorm:"type:float"`
	AvgConfidence float64   `json:"avgConfidence" gorm:"type:float"`
	Timestamp     time.Time `json:"timestamp" gorm:"index"`
	CreatedAt     time.Time `json:"createdAt"`
}

func (LearningSnapshot) TableName() string {
	return "learning_snapshots"
}

func (ls *LearningSnapshot) BeforeCreate(tx *gorm.DB) error {
	if ls.ID == "" {
		ls.ID = uuid.New().String()
	}
	if ls.Timestamp.IsZero() {
		ls.Timestamp = time.Now()
	}
	return nil
}
