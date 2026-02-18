package ai

import (
	"context"
	"fmt"

	"github.com/examlytics/server/internal/domain"
	pb "github.com/examlytics/server/pkg/proto/examlytics/v1"
)

type AIAdapter struct {
	client *ExamlyticsClient
}

func NewAIAdapter(client *ExamlyticsClient) domain.AIProvider {
	return &AIAdapter{
		client: client,
	}
}

func (a *AIAdapter) GenerateQuestions(ctx context.Context, topic string, count int, difficulty string) ([]domain.Question, error) {
	// Map domain args to gRPC request
	// Note: UserID is not passed in interface? We might need to adjust interface or pass a dummy
	// For now, let's pass "system" or context value if available
	resp, err := a.client.GenerateExam(ctx, "system", topic, count)
	if err != nil {
		return nil, fmt.Errorf("failed to generate exam: %w", err)
	}

	// Map gRPC response to domain entities
	questions := make([]domain.Question, len(resp.Questions))
	for i, q := range resp.Questions {
		questions[i] = domain.Question{
			ID:            q.Id,
			Text:          q.Text,
			Options:       q.Options,
			Type:          domain.QuestionType(q.Type),     // needing validation/mapping
			Difficulty:    domain.Difficulty(q.Difficulty), // mapped from proto
			TopicID:       q.Topic,
			Explanation:   q.Explanation,
			CorrectAnswer: q.CorrectAnswer,
		}
	}

	return questions, nil
}

func (a *AIAdapter) AnalyzePerformance(ctx context.Context, attempt *domain.ExamAttempt) (string, error) {
	// Map domain entity to gRPC request
	responses := make([]*pb.ResponseItem, len(attempt.Responses))
	for i, r := range attempt.Responses {
		responses[i] = &pb.ResponseItem{
			QuestionId: r.QuestionID,
			Answer:     r.Answer,
			TimeSpent:  int32(r.TimeSpent),
		}
	}

	resp, err := a.client.AnalyzeExam(ctx, attempt.ExamID, attempt.UserID, responses)
	if err != nil {
		return "", fmt.Errorf("failed to analyze exam: %w", err)
	}

	// Return improvement recommendation or summary
	// Ideally, we'd return a struct, but interface says string currently.
	// Let's assume we return a JSON string or just the recommendation text if available.
	// The proto response has detailed fields.
	// For now, let's return a simple formatted string.
	return fmt.Sprintf("Score: %.2f, Accuracy: %.2f", resp.Score, resp.Accuracy), nil
}
