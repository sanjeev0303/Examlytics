package domain

import (
	"crypto/sha256"
	"encoding/hex"
	"time"

	"gorm.io/gorm"
)

// QuestionStats tracks aggregate performance metrics for difficulty calibration.
// Used to objectively reclassify question difficulty.
type QuestionStats struct {
	QuestionHash         string    `json:"questionHash" gorm:"type:varchar(64);primaryKey"` // SHA256 of question text
	Topic                string    `json:"topic" gorm:"type:varchar(255);index"`
	AttemptCount         int       `json:"attemptCount" gorm:"default:0"`
	CorrectCount         int       `json:"correctCount" gorm:"default:0"`
	AvgConfidence        float64   `json:"avgConfidence" gorm:"type:float"`
	TotalConfidence      float64   `json:"-" gorm:"type:float"`                       // Running sum for avg calculation
	AvgTimeSpent         float64   `json:"avgTimeSpent" gorm:"type:float"`            // Seconds
	TotalTimeSpent       float64   `json:"-" gorm:"type:float"`                       // Running sum
	ExpectedTime         float64   `json:"expectedTime" gorm:"type:float;default:60"` // Baseline: 60 seconds
	DifficultyIndex      float64   `json:"difficultyIndex" gorm:"type:float;index"`
	CalibratedDifficulty string    `json:"calibratedDifficulty" gorm:"type:varchar(20)"` // EASY, MEDIUM, HARD
	OriginalDifficulty   string    `json:"originalDifficulty" gorm:"type:varchar(20)"`   // AI-declared
	LastUpdated          time.Time `json:"lastUpdated"`
}

func (QuestionStats) TableName() string {
	return "question_stats"
}

// HashQuestion generates a deterministic hash for deduplication
func HashQuestion(questionText string) string {
	h := sha256.New()
	h.Write([]byte(questionText))
	return hex.EncodeToString(h.Sum(nil))
}

// CalibrateDifficulty calculates difficulty index and returns bucket
// Formula: (1 - correctnessRate) * 0.5 + (1 - avgConfidence) * 0.3 + (avgTime / expectedTime) * 0.2
func (qs *QuestionStats) CalibrateDifficulty() {
	if qs.AttemptCount == 0 {
		return
	}

	correctnessRate := float64(qs.CorrectCount) / float64(qs.AttemptCount)
	qs.AvgConfidence = qs.TotalConfidence / float64(qs.AttemptCount)
	qs.AvgTimeSpent = qs.TotalTimeSpent / float64(qs.AttemptCount)

	expectedTime := qs.ExpectedTime
	if expectedTime == 0 {
		expectedTime = 60 // Default 60 seconds
	}

	timeRatio := qs.AvgTimeSpent / expectedTime
	if timeRatio > 2 {
		timeRatio = 2 // Cap at 2x expected time
	}

	qs.DifficultyIndex = (1-correctnessRate)*0.5 + (1-qs.AvgConfidence)*0.3 + timeRatio*0.2

	// Bucket assignment
	switch {
	case qs.DifficultyIndex < 0.35:
		qs.CalibratedDifficulty = "EASY"
	case qs.DifficultyIndex <= 0.65:
		qs.CalibratedDifficulty = "MEDIUM"
	default:
		qs.CalibratedDifficulty = "HARD"
	}

	qs.LastUpdated = time.Now()
}

func (qs *QuestionStats) BeforeUpdate(tx *gorm.DB) error {
	qs.CalibrateDifficulty()
	return nil
}
