package dto

import "time"

// LearningCurveResponse contains time-series data for learning curve graphs
type LearningCurveResponse struct {
	Labels   []string              `json:"labels"` // Date labels: "Jan 1", "Jan 5", etc.
	Datasets LearningCurveDatasets `json:"datasets"`
}

type LearningCurveDatasets struct {
	OverallScore []float64 `json:"overallScore"`
	Accuracy     []float64 `json:"accuracy"`
	Confidence   []float64 `json:"confidence"`
}

// TopicCurveResponse contains topic-specific mastery progression
type TopicCurveResponse struct {
	Topic   string    `json:"topic"`
	Labels  []string  `json:"labels"`
	Mastery []float64 `json:"mastery"`
}

// InterviewReadinessResponse for IRS API
type InterviewReadinessResponse struct {
	Score          float64      `json:"interviewReadinessScore"`
	Status         string       `json:"status"`
	Recommendation string       `json:"recommendation"`
	Breakdown      IRSBreakdown `json:"breakdown"`
	LastCalculated time.Time    `json:"lastCalculated"`
}

type IRSBreakdown struct {
	TopicMasteryAvg  float64 `json:"topicMasteryAvg"`
	ConsistencyScore float64 `json:"consistencyScore"`
	ConfidenceScore  float64 `json:"confidenceScore"`
	DifficultyFactor float64 `json:"difficultyFactor"`
	SpeedFactor      float64 `json:"speedFactor"`
}

// DueTopic for spaced repetition
type DueTopic struct {
	Topic         string  `json:"topic"`
	MasteryScore  float64 `json:"masteryScore"`
	DaysSinceLast int     `json:"daysSinceLast"`
	Priority      string  `json:"priority"` // HIGH, MEDIUM, LOW
}

// SpacedRepetitionResponse contains due topics for review
type SpacedRepetitionResponse struct {
	DueTopics          []DueTopic `json:"dueTopics"`
	TotalDue           int        `json:"totalDue"`
	NextRecommendation string     `json:"nextRecommendation"`
}

// QuestionCalibrationResponse shows calibrated difficulty stats
type QuestionCalibrationResponse struct {
	QuestionHash         string  `json:"questionHash"`
	Topic                string  `json:"topic"`
	AttemptCount         int     `json:"attemptCount"`
	CorrectnessRate      float64 `json:"correctnessRate"`
	AvgConfidence        float64 `json:"avgConfidence"`
	AvgTimeSpent         float64 `json:"avgTimeSpent"`
	DifficultyIndex      float64 `json:"difficultyIndex"`
	OriginalDifficulty   string  `json:"originalDifficulty"`
	CalibratedDifficulty string  `json:"calibratedDifficulty"`
}

// AnalyticsSummaryResponse for dashboard overview
type AnalyticsSummaryResponse struct {
	InterviewReadiness InterviewReadinessResponse `json:"interviewReadiness"`
	RecentSnapshots    []LearningSnapshotDTO      `json:"recentSnapshots"`
	DueTopicsCount     int                        `json:"dueTopicsCount"`
	TopWeakTopics      []string                   `json:"topWeakTopics"`
}

type LearningSnapshotDTO struct {
	SessionID     string    `json:"sessionId"`
	OverallScore  float64   `json:"overallScore"`
	Accuracy      float64   `json:"accuracy"`
	AvgConfidence float64   `json:"avgConfidence"`
	Timestamp     time.Time `json:"timestamp"`
}

// StreakDataResponse contains user activity streak information
type StreakDataResponse struct {
	CurrentStreak    int                `json:"currentStreak"`
	LongestStreak    int                `json:"longestStreak"`
	TotalActiveDays  int                `json:"totalActiveDays"`
	ActivityCalendar []ActivityDayEntry `json:"activityCalendar"`
}

type ActivityDayEntry struct {
	Date     string `json:"date"` // YYYY-MM-DD
	Count    int    `json:"count"`
	HasExams bool   `json:"hasExams"`
}
