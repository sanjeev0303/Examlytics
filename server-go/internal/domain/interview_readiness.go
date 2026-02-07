package domain

import (
	"time"
)

// InterviewReadiness stores the calculated interview readiness score for a user.
// Updated after each exam submission.
type InterviewReadiness struct {
	UserID           string    `json:"userId" gorm:"type:uuid;primaryKey"`
	Score            float64   `json:"score" gorm:"type:float"`
	Status           string    `json:"status" gorm:"type:varchar(50)"` // Interview Ready, Almost Ready, Needs Practice, Not Ready
	TopicMasteryAvg  float64   `json:"topicMasteryAvg" gorm:"type:float"`
	ConsistencyScore float64   `json:"consistencyScore" gorm:"type:float"` // Based on last 5 exams std dev
	ConfidenceScore  float64   `json:"confidenceScore" gorm:"type:float"`
	DifficultyFactor float64   `json:"difficultyFactor" gorm:"type:float"` // % hard questions answered correctly
	SpeedFactor      float64   `json:"speedFactor" gorm:"type:float"`      // Actual/expected time ratio
	LastCalculated   time.Time `json:"lastCalculated"`
}

func (InterviewReadiness) TableName() string {
	return "interview_readiness"
}

// GetStatus returns status label based on score
func GetReadinessStatus(score float64) string {
	switch {
	case score >= 85:
		return "Interview Ready"
	case score >= 70:
		return "Almost Ready"
	case score >= 50:
		return "Needs Practice"
	default:
		return "Not Ready"
	}
}

// GetRecommendation returns actionable text based on status
func GetReadinessRecommendation(status string) string {
	switch status {
	case "Interview Ready":
		return "You're well-prepared! Consider practicing under time pressure for peak performance."
	case "Almost Ready":
		return "Improve weak topics and attempt harder questions to reach interview readiness."
	case "Needs Practice":
		return "Focus on consistent practice across all topics. Review fundamentals."
	default:
		return "Build foundational knowledge with easier questions before progressing."
	}
}
