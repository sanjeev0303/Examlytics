package entity

import "time"

type QuestionType string
type ExamType string
type ExamMode string
type ExamStatus string

const (
	QuestionTypeMCQ    QuestionType = "MCQ"
	QuestionTypeCoding QuestionType = "CODING"

	ExamTypeJob      ExamType = "JOB"
	ExamTypeAcademic ExamType = "ACADEMIC"

	ExamModeMCQ        ExamMode = "MCQ"        // Speed-focused
	ExamModeSubjective ExamMode = "SUBJECTIVE" // Depth-focused
	ExamModeMixed      ExamMode = "MIXED"

	ExamStatusPending    ExamStatus = "PENDING"
	ExamStatusProcessing ExamStatus = "PROCESSING"
	ExamStatusReady      ExamStatus = "READY"
	ExamStatusCompleted  ExamStatus = "COMPLETED"
	ExamStatusFailed     ExamStatus = "FAILED"
)

type Question struct {
	ID            string       `json:"id" bson:"_id"`
	Text          string       `json:"text" bson:"text"`
	Options       []string     `json:"options" bson:"options"`
	Type          QuestionType `json:"type" bson:"type"`
	CorrectAnswer string       `json:"correctAnswer" bson:"correctAnswer"` // Stored but not sent to client during exam
	Explanation   string       `json:"explanation" bson:"explanation"`
	Topic         string       `json:"topic" bson:"topic"`
	Difficulty    string       `json:"difficulty" bson:"difficulty"` // EASY, MEDIUM, HARD
}

type Exam struct {
	ID             string     `json:"id" bson:"_id"`
	UserID         string     `json:"userId" bson:"userId"`
	Type           ExamType   `json:"type" bson:"type"`
	Mode           ExamMode   `json:"mode" bson:"mode"`
	Status         ExamStatus `json:"status" bson:"status"`
	Questions      []Question `json:"questions" bson:"questions"`
	TotalQuestions int        `json:"totalQuestions" bson:"totalQuestions"`
	TimeLimit      int        `json:"timeLimit" bson:"timeLimit"` // Seconds
	Score          float64    `json:"score" bson:"score"`
	CreatedAt      time.Time  `json:"createdAt" bson:"createdAt"`
	CompletedAt    *time.Time `json:"completedAt" bson:"completedAt"`
}
