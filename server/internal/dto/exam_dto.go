package dto

import "time"

type StartExamRequest struct {
	ExamID        string   `json:"exam_id"`        // Optional if custom
	Type          string   `json:"type"`           // JOB, CODING, etc.
	Mode          string   `json:"mode"`           // MCQ, SUBJECTIVE, MIXED
	Difficulty    string   `json:"difficulty"`     // EASY, MEDIUM, HARD
	QuestionCount int      `json:"question_count"` // 10, 20, 30
	TopicID       string   `json:"topic_id"`       // For focused improvement
	Language      string   `json:"language"`       // Python, Java, etc.
	JobCategory   string   `json:"job_category"`   // SQL, System Design
	Subjects      []string `json:"subjects"`       // Physics, Chemistry
	Source        string   `json:"source"`         // source of request (e.g. load_test)
}

type AnswerSubmission struct {
	QuestionID string `json:"questionId" binding:"required"`
	Answer     string `json:"answer" binding:"required"`
	TimeSpent  int    `json:"timeSpent" binding:"required"` // In seconds
}

type SubmitExamRequest struct {
	SessionID string             `json:"sessionId" binding:"required"`
	Answers   []AnswerSubmission `json:"answers" binding:"required"`
}

type WeakTopic struct {
	TopicID   string  `json:"topicId"`
	TopicName string  `json:"topicName"`
	Accuracy  float64 `json:"accuracy"`
	Severity  string  `json:"severity"`
}

type WeakTopicSummary struct {
	ExamType  string `json:"examType"`
	TopicName string `json:"topicName"`
	Accuracy  int    `json:"accuracy"`
	Attempts  int    `json:"attempts"`
	Status    string `json:"status"`
}

type ExamResultResponse struct {
	SessionID                 string      `json:"sessionId"`
	Score                     float64     `json:"score"`
	Accuracy                  float64     `json:"accuracy"`
	TimeTaken                 int         `json:"timeTaken"`
	TotalQuestions            int         `json:"totalQuestions"`
	CorrectCount              int         `json:"correctCount"`
	WeakTopics                []WeakTopic `json:"weakTopics"`
	ImprovementRecommendation string      `json:"improvementRecommendation"`
	StartedAt                 time.Time   `json:"startedAt"`
	CompletedAt               time.Time   `json:"completedAt"`
}

type QuestionDTO struct {
	ID            string   `json:"id"`
	Text          string   `json:"text"`
	Options       []string `json:"options"`
	Type          string   `json:"type"` // MCQ, CODING
	UserAnswer    string   `json:"userAnswer,omitempty"`
	CorrectAnswer string   `json:"correctAnswer,omitempty"`
	Explanation   string   `json:"explanation,omitempty"`
	IsCorrect     bool     `json:"isCorrect"`
	TimeSpent     int      `json:"timeSpent,omitempty"`
}

type ExamSessionResponse struct {
	SessionID                 string        `json:"sessionId"`
	Type                      string        `json:"type,omitempty"`
	TopicID                   string        `json:"topicId,omitempty"`
	TotalQuestions            int           `json:"totalQuestions"`
	Status                    string        `json:"status"`
	Questions                 []QuestionDTO `json:"questions"`
	Duration                  int           `json:"duration"` // Seconds
	Score                     float64       `json:"score"`
	Accuracy                  float64       `json:"accuracy"`
	CorrectCount              int           `json:"correctCount"` // Added field
	TimeTaken                 int           `json:"timeTaken"`
	StartedAt                 time.Time     `json:"startedAt"`
	CompletedAt               *time.Time    `json:"completedAt"`
	WeakTopics                []WeakTopic   `json:"weakTopics"`
	ImprovementRecommendation string        `json:"improvementRecommendation"`
}

type ExamGenerationJob struct {
	JobID       string           `json:"jobId"`
	UserID      string           `json:"userId"`
	Preferences StartExamRequest `json:"preferences"`
	Source      string           `json:"source"`
	CreatedAt   int64            `json:"createdAt"` // Unix timestamp
}

type ExamSubmissionJob struct {
	JobID     string            `json:"jobId"`
	UserID    string            `json:"userId"`
	Request   SubmitExamRequest `json:"request"`
	CreatedAt time.Time         `json:"createdAt"`
}

type ExamGenerationStatus struct {
	JobID     string `json:"jobId"`
	Status    string `json:"status"` // PENDING, PROCESSING, COMPLETED, FAILED
	SessionID string `json:"sessionId,omitempty"`
	Error     string `json:"error,omitempty"`
}

const (
	JobStatusPending    = "PENDING"
	JobStatusProcessing = "PROCESSING"
	JobStatusCompleted  = "COMPLETED"
	JobStatusFailed     = "FAILED"
)
