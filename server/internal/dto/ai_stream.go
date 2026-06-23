package dto

import "time"

type AIStreamEventType string

const (
	EventStarted                 AIStreamEventType = "started"
	EventProgress                AIStreamEventType = "progress"
	EventRetrievalStarted        AIStreamEventType = "retrieval_started"
	EventRetrievalCompleted      AIStreamEventType = "retrieval_completed"
	EventQuestionGenerated       AIStreamEventType = "question_generated"
	EventQuestionValidated       AIStreamEventType = "question_validated"
	EventDifficultyScored        AIStreamEventType = "difficulty_scored"
	EventBloomScored             AIStreamEventType = "bloom_scored"
	EventAnalyticsGenerated      AIStreamEventType = "analytics_generated"
	EventRecommendationsGenerated AIStreamEventType = "recommendations_generated"
	EventCompleted               AIStreamEventType = "completed"
	EventError                   AIStreamEventType = "error"
)

type AIStreamEvent struct {
	EventID   string            `json:"eventId"`
	SessionID string            `json:"sessionId"`
	Timestamp time.Time         `json:"timestamp"`
	Type      AIStreamEventType `json:"type"`
	Node      string            `json:"node"`
	Progress  float64           `json:"progress"`
	Payload   interface{}       `json:"payload,omitempty"`
	Error     string            `json:"error,omitempty"`
}
