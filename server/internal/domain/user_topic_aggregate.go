package domain

import (
	"time"
)

// UserTopicAggregate represents pre-computed analytics for a user on a specific topic.
// This table is optimized for O(1) dashboard reads.
type UserTopicAggregate struct {
	UserID         string    `json:"userId" gorm:"primaryKey;type:uuid"`
	Topic          string    `json:"topic" gorm:"primaryKey;type:varchar(255)"`
	TotalAttempts  int       `json:"totalAttempts" gorm:"default:0"`
	CorrectCount   int       `json:"correctCount" gorm:"default:0"`        // Added for detailed tracking
	PartialCount   int       `json:"partialCount" gorm:"default:0"`        // Added for detailed tracking
	IncorrectCount int       `json:"incorrectCount" gorm:"default:0"`      // Added for detailed tracking
	AvgAccuracy    float64   `json:"avgAccuracy" gorm:"type:float"`        // Legacy: Running average %
	MasteryScore   float64   `json:"masteryScore" gorm:"type:float;index"` // New: Weighted Mastery
	AvgTime        float64   `json:"avgTime" gorm:"type:float"`            // In seconds
	WeakScore      float64   `json:"weakScore" gorm:"type:float;index"`    // For sorting weak topics
	AvgConfidence  float64   `json:"avgConfidence" gorm:"type:float"`      // Avg AI confidence for IRS
	LastUpdated    time.Time `json:"lastUpdated"`
}

func (UserTopicAggregate) TableName() string {
	return "user_topic_aggregates"
}
