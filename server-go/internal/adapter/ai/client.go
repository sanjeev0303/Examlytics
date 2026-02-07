package ai

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type AIClient struct {
	BaseURL    string
	Secret     string
	HTTPClient *http.Client
}

func NewAIClient(baseURL, secret string) *AIClient {
	return &AIClient{
		BaseURL: baseURL,
		Secret:  secret,
		HTTPClient: &http.Client{
			Timeout: 60 * time.Second, // LLM operations can take longer
		},
	}
}

func (c *AIClient) doRequest(req *http.Request) (*http.Response, error) {
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Internal-Secret", c.Secret)
	return c.HTTPClient.Do(req)
}

// Request/Response types matching Python definitions

type QuestionResult struct {
	QuestionID string `json:"question_id"`
	TopicID    string `json:"topic_id"`
	IsCorrect  bool   `json:"is_correct"`
	TimeSpent  int    `json:"time_spent"`
	Difficulty string `json:"difficulty"`
}

type ExamAnalysisRequest struct {
	SessionID      string           `json:"session_id"`
	UserID         string           `json:"user_id"`
	TotalQuestions int              `json:"total_questions"`
	Results        []QuestionResult `json:"results"`
}

type WeakTopic struct {
	TopicID      string  `json:"topic_id"`   // Changed from 'topic' to 'topic_id' to match standard naming. Will update Python to output topic_id.
	TopicName    string  `json:"topic_name"` // Added
	Accuracy     float64 `json:"accuracy"`
	AvgTimeSpent float64 `json:"avg_time_spent"`
	Severity     string  `json:"severity"`
}

type ExamAnalysisResponse struct {
	SessionID                 string      `json:"session_id"`
	WeakTopics                []WeakTopic `json:"weak_topics"`
	ImprovementRecommendation string      `json:"improvement_recommendation"`
	StrongTopics              []string    `json:"strong_topics"`
}

type BlueprintRequest struct {
	WeakTopicIDs []string `json:"weak_topic_ids"`
	Difficulty   string   `json:"difficulty"`
	NumQuestions int      `json:"num_questions"`
	ExamType     string   `json:"exam_type"`
	Mode         string   `json:"mode"`
}

type QuestionCriteria struct {
	TopicID    string `json:"topic_id"`
	Difficulty string `json:"difficulty"`
	Count      int    `json:"count"`
}

type ExamBlueprintResponse struct {
	Criteria []QuestionCriteria `json:"criteria"`
}

type SemanticRequest struct {
	Question      string `json:"question"`
	CorrectAnswer string `json:"correctAnswer"`
	UserAnswer    string `json:"userAnswer"`
}

type SemanticResponse struct {
	IsCorrect   bool              `json:"isCorrect"`
	Confidence  float64           `json:"confidence"`
	Explanation map[string]string `json:"explanation"`
}

func (c *AIClient) EvaluateSubmission(req ExamAnalysisRequest) (*ExamAnalysisResponse, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	reqHTTP, err := http.NewRequest("POST", c.BaseURL+"/api/v1/evaluate/evaluate", bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}

	resp, err := c.doRequest(reqHTTP)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("AI service returned status: %d", resp.StatusCode)
	}

	var result ExamAnalysisResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return &result, nil
}

func (c *AIClient) GenerateBlueprint(req BlueprintRequest) (*ExamBlueprintResponse, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	reqHTTP, err := http.NewRequest("POST", c.BaseURL+"/api/v1/generate/generate-blueprint", bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}

	resp, err := c.doRequest(reqHTTP)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("AI service returned status: %d", resp.StatusCode)
	}

	var result ExamBlueprintResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return &result, nil
}

func (c *AIClient) SemanticCheck(question, correctAnswer, userAnswer string) (bool, float64, map[string]string, error) {
	req := SemanticRequest{
		Question:      question,
		CorrectAnswer: correctAnswer,
		UserAnswer:    userAnswer,
	}

	body, err := json.Marshal(req)
	if err != nil {
		return false, 0, nil, err
	}

	reqHTTP, err := http.NewRequest("POST", c.BaseURL+"/api/v1/evaluate/semantic-check", bytes.NewBuffer(body))
	if err != nil {
		return false, 0, nil, err
	}

	resp, err := c.doRequest(reqHTTP)
	if err != nil {
		return false, 0, nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, 0, nil, fmt.Errorf("AI service returned status: %d", resp.StatusCode)
	}

	var result SemanticResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return false, 0, nil, err
	}

	return result.IsCorrect, result.Confidence, result.Explanation, nil
}
