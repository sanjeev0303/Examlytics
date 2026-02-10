package domain

import (
	"time"
)

// UserTopicSchedule tracks spaced repetition schedule for each user-topic pair.
type UserTopicSchedule struct {
	UserID         string    `json:"userId" gorm:"type:uuid;primaryKey"`
	Topic          string    `json:"topic" gorm:"type:varchar(255);primaryKey"`
	MasteryScore   float64   `json:"masteryScore" gorm:"type:float"`
	NextReviewDate time.Time `json:"nextReviewDate" gorm:"index"`
	LastReviewDate time.Time `json:"lastReviewDate"`
	ReviewCount    int       `json:"reviewCount" gorm:"default:0"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

func (UserTopicSchedule) TableName() string {
	return "user_topic_schedules"
}

// CalculateNextReview determines next review date based on mastery score
// Schedule:
// < 40%: 1 day
// 40-60%: 3 days
// 60-80%: 7 days
// 85%+: 21 days
func (uts *UserTopicSchedule) CalculateNextReview() {
	var daysUntilReview int

	switch {
	case uts.MasteryScore < 40:
		daysUntilReview = 1
	case uts.MasteryScore < 60:
		daysUntilReview = 3
	case uts.MasteryScore < 80:
		daysUntilReview = 7
	case uts.MasteryScore >= 85:
		daysUntilReview = 21
	default:
		daysUntilReview = 7
	}

	uts.LastReviewDate = time.Now()
	uts.NextReviewDate = time.Now().AddDate(0, 0, daysUntilReview)
	uts.ReviewCount++
	uts.UpdatedAt = time.Now()
}

// IsDue returns true if topic is due for review
func (uts *UserTopicSchedule) IsDue() bool {
	return time.Now().After(uts.NextReviewDate) || time.Now().Equal(uts.NextReviewDate)
}
