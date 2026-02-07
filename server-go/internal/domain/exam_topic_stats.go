package domain

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ExamTopicStats tracks performance metrics for a specific topic within an exam
type ExamTopicStats struct {
	ID             string  `json:"id" gorm:"type:uuid;primaryKey"`
	ExamID         string  `json:"examId" gorm:"type:uuid;index:idx_exam_topic"`
	Topic          string  `json:"topic" gorm:"type:varchar(255);index:idx_exam_topic"`
	Accuracy       float64 `json:"accuracy"` // Legacy % score for this topic in this exam
	CorrectCount   int     `json:"correctCount"`
	PartialCount   int     `json:"partialCount"`
	IncorrectCount int     `json:"incorrectCount"`
	AvgTime        float64 `json:"avgTime"`
	WeakScore      float64 `json:"weakScore"`
}

func (ExamTopicStats) TableName() string {
	return "exam_topic_stats"
}

func (e *ExamTopicStats) BeforeCreate(tx *gorm.DB) error {
	if e.ID == "" {
		e.ID = uuid.New().String()
	}
	return nil
}
