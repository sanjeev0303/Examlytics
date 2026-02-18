package entity

import "time"

type ExamAttempt struct {
	ID        string     `json:"id" bson:"_id"`
	ExamID    string     `json:"examId" bson:"examId"`
	UserID    string     `json:"userId" bson:"userId"`
	Responses []Response `json:"responses" bson:"responses"`
	Score     float64    `json:"score" bson:"score"`
	Accuracy  float64    `json:"accuracy" bson:"accuracy"`
	StartedAt time.Time  `json:"startedAt" bson:"startedAt"`
	EndedAt   time.Time  `json:"endedAt" bson:"endedAt"`
}

type Response struct {
	QuestionID string `json:"questionId" bson:"questionId"`
	Answer     string `json:"answer" bson:"answer"`
	IsCorrect  bool   `json:"isCorrect" bson:"isCorrect"`
	TimeSpent  int    `json:"timeSpent" bson:"timeSpent"` // Seconds
}
