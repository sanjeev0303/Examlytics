package domain

import "time"

// ExamAttempt represents a user's attempt at an exam
type ExamAttempt struct {
	ID        string     `json:"id" gorm:"type:uuid;primaryKey"`
	ExamID    string     `json:"examId" gorm:"type:uuid;index"`
	UserID    string     `json:"userId" gorm:"type:uuid;index"`
	Responses []Response `json:"responses" gorm:"type:jsonb"`
	Score     float64    `json:"score"`
	Accuracy  float64    `json:"accuracy"`
	StartedAt time.Time  `json:"startedAt"`
	EndedAt   time.Time  `json:"endedAt"`
}

// Response represents a single question response in an exam attempt
type Response struct {
	QuestionID string `json:"questionId"`
	Answer     string `json:"answer"`
	IsCorrect  bool   `json:"isCorrect"`
	TimeSpent  int    `json:"timeSpent"` // Seconds
}
