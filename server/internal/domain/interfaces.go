package domain

import (
	"context"
)

// UserRepository defines the domain interface for user persistence
type UserRepository interface {
	FindByID(ctx context.Context, id string) (*User, error)
	FindByEmail(ctx context.Context, email string) (*User, error)
	GetByID(ctx context.Context, id string) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	Create(ctx context.Context, user *User) error
	Update(ctx context.Context, user *User) error
	Delete(ctx context.Context, id string) error
	SavePreferences(ctx context.Context, prefs *UserPreference) error
	GetPreferences(ctx context.Context, userID string) (*UserPreference, error)
	GetTopicAggregates(ctx context.Context, userID string) ([]*UserTopicAggregate, error)
	FindAIContextByUserID(ctx context.Context, userID string) (*UserAIContext, error)
	CountUsers(ctx context.Context) (int64, error)
	FindAll(ctx context.Context) ([]*User, error)
}

// ExamRepository defines the domain interface for exam persistence
type ExamRepository interface {
	GetByID(ctx context.Context, id string) (*Exam, error)
	Create(ctx context.Context, exam *Exam) error
	Update(ctx context.Context, exam *Exam) error
	ListByUser(ctx context.Context, userID string, limit, offset int) ([]*Exam, error)
	FindAllExams(ctx context.Context) ([]*Exam, error)
	FindAllTopics(ctx context.Context) ([]*Topic, error)
	CountExams(ctx context.Context) (int64, error)
	CountQuestions(ctx context.Context) (int64, error)
	GetUserWeakTopics(ctx context.Context, userID string) ([]*UserWeakTopic, error)

	// Additional methods used in services
	GetAttendedExamTypes(ctx context.Context, userID string) ([]string, error)
	ListPublic(limit, offset int, attendedTypes []string) ([]*Exam, error)
	FindSessionsByUserID(ctx context.Context, userID string) ([]*ExamSession, error)
	FindUserTopicAggregates(ctx context.Context, userID string) ([]*UserTopicAggregate, error)
	FindAnswersBySessionID(ctx context.Context, sessionID string) ([]*SessionAnswer, error)
	SaveSessionAnswers(answers []*SessionAnswer) error
	UpsertUserWeakTopic(ctx context.Context, wt *UserWeakTopic) error
	CreateExamTopicStats(ctx context.Context, stats []*ExamTopicStats) error
	FindUserTopicAggregate(ctx context.Context, userID, topic string) (*UserTopicAggregate, error)
	UpsertUserTopicAggregate(ctx context.Context, agg *UserTopicAggregate) error

	// Session methods
	CreateExamSession(session *ExamSession) error
	FindExamSessionByID(ctx context.Context, id string) (*ExamSession, error)
	UpdateExamSession(session *ExamSession) error
}

// AnalyticsRepository defines the domain interface for analytics persistence
type AnalyticsRepository interface {
	RecordAttempt(ctx context.Context, attempt *ExamAttempt) error
	GetUserSnapshots(ctx context.Context, userID string, limit int) ([]*LearningSnapshot, error)
	GetTopicHistory(ctx context.Context, userID, topic string, limit int) ([]*TopicMasteryHistory, error)
	CreateSnapshot(ctx context.Context, snapshot *LearningSnapshot) error
	GetInterviewReadiness(ctx context.Context, userID string) (*InterviewReadiness, error)
	UpsertInterviewReadiness(ctx context.Context, readiness *InterviewReadiness) error
	GetDueTopics(ctx context.Context, userID string) ([]*UserTopicSchedule, error)
	UpsertTopicSchedule(ctx context.Context, schedule *UserTopicSchedule) error
	GetQuestionStats(ctx context.Context, hash string) (*QuestionStats, error)
	UpsertQuestionStats(ctx context.Context, stats *QuestionStats) error
}

// QuestionRepository defines the domain interface for question persistence
type QuestionRepository interface {
	Create(q *Question) error
	GetByID(id string) (*Question, error)
	FindByID(id string) (*Question, error)
	Update(q *Question) error
	Delete(id string) error
	ListByTopic(topic string, limit, offset int) ([]*Question, error)
	CountByTopic(topic string) (int64, error)
	FindByTopic(topicID string, limit int) ([]*Question, error)
	GetRandomQuestions(count int, topicIDs []string, difficulty Difficulty) ([]*Question, error)
}

// AIProvider defines the interface for the separate AI microservice
type AIProvider interface {
	GenerateQuestions(ctx context.Context, topic string, count int, difficulty string) ([]Question, error)
	AnalyzePerformance(ctx context.Context, attempt *ExamAttempt) (string, error)
}
