package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/examlytics/server/internal/domain"
)

type RESTAIProvider struct {
	baseURL        string
	httpClient     *http.Client
	internalSecret string
}

func NewRESTAIProvider(baseURL, secret string) domain.AIProvider {
	return &RESTAIProvider{
		baseURL:        baseURL,
		httpClient:     &http.Client{Timeout: 30 * time.Second},
		internalSecret: secret,
	}
}

type restGenerateRequest struct {
	UserID        string   `json:"userId"`
	ExamType      string   `json:"examType"`
	Mode          string   `json:"mode"`
	QuestionCount int      `json:"questionCount"`
	Topics        []string `json:"topics"`
}

type restQuestionItem struct {
	ID         string   `json:"id"`
	Text       string   `json:"text"`
	Options    []string `json:"options"`
	Type       string   `json:"type"`
	Difficulty string   `json:"difficulty"`
	Topic      string   `json:"topic"`
}

type restGenerateResponse struct {
	ExamID    string             `json:"examId"`
	Questions []restQuestionItem `json:"questions"`
	TimeLimit int                `json:"timeLimit"`
}

func (p *RESTAIProvider) GenerateQuestions(ctx context.Context, topic string, count int, difficulty string) ([]domain.Question, error) {
	reqBody := restGenerateRequest{
		UserID:        "system",
		ExamType:      "PRACTICE",
		Mode:          "MIXED",
		QuestionCount: count,
		Topics:        []string{topic},
	}

	jsonData, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(ctx, "POST", p.baseURL+"/api/exam/generate", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Internal-Secret", p.internalSecret)

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("AI service returned status: %d", resp.StatusCode)
	}

	var res restGenerateResponse
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return nil, err
	}

	questions := make([]domain.Question, len(res.Questions))
	for i, q := range res.Questions {
		questions[i] = domain.Question{
			ID:         q.ID,
			Text:       q.Text,
			Options:    q.Options,
			Type:       domain.QuestionType(q.Type),
			Difficulty: domain.Difficulty(q.Difficulty),
			TopicID:    q.Topic,
		}
	}

	return questions, nil
}

func (p *RESTAIProvider) AnalyzePerformance(ctx context.Context, attempt *domain.ExamAttempt) (string, error) {
	// Note: AnalyzePerformance in REST currently uses /api/v1/analyze/performance
	// which expects topic_stats, not just exam_id.
	// However, AI service also has /api/exam/analyze which takes exam_id.
	// For benchmarking communication overhead, /api/exam/analyze is a better comparison to gRPC's AnalyzeExam.

	reqBody := map[string]string{
		"examId": attempt.ExamID,
		"userId": attempt.UserID,
	}

	jsonData, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(ctx, "POST", p.baseURL+"/api/exam/analyze", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Internal-Secret", p.internalSecret)

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("AI service returned status: %d", resp.StatusCode)
	}

	var res map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return "", err
	}

	summary, _ := res["summary"].(map[string]interface{})
	return fmt.Sprintf("Score: %.2f, Accuracy: %.2f", summary["score"], summary["accuracy"]), nil
}
