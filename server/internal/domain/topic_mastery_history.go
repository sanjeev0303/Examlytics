package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// TopicMasteryHistory stores daily mastery snapshots per topic for learning curves.
type TopicMasteryHistory struct {
	ID           string    `json:"id" gorm:"type:uuid;primaryKey"`
	UserID       string    `json:"userId" gorm:"type:uuid;index;not null"`
	Topic        string    `json:"topic" gorm:"type:varchar(255);index;not null"`
	MasteryScore float64   `json:"masteryScore" gorm:"type:float"`
	Date         time.Time `json:"date" gorm:"type:date;index"`
	CreatedAt    time.Time `json:"createdAt"`
}

func (TopicMasteryHistory) TableName() string {
	return "topic_mastery_history"
}

func (tmh *TopicMasteryHistory) BeforeCreate(tx *gorm.DB) error {
	if tmh.ID == "" {
		tmh.ID = uuid.New().String()
	}
	return nil
}
