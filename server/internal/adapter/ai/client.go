package ai

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/examlytics/server/pkg/concurrency"
	"github.com/examlytics/server/pkg/resilience"
)

// AIClientConfig holds configuration for the AI client.
type AIClientConfig struct {
	BaseURL        string
	Secret         string
	MaxConcurrency int           // Max concurrent AI calls (default: 10)
	Timeout        time.Duration // HTTP timeout (default: 30s)
	CacheEnabled   bool          // Enable result caching (default: true)
	CacheTTL       time.Duration // Cache TTL (default: 1h)
}

// AIClient wraps HTTP calls to the AI service with resilience features.
type AIClient struct {
	BaseURL    string
	Secret     string
	HTTPClient *http.Client

	// Concurrency control
	semaphore *concurrency.Semaphore

	// Circuit breaker for failover
	circuitBreaker *resilience.CircuitBreaker

	// In-memory cache for semantic checks
	cache        map[string]*cachedResult
	cacheMu      sync.RWMutex
	cacheTTL     time.Duration
	cacheEnabled bool

	// Buffer pool to reduce GC pressure
	bufferPool sync.Pool
}

type cachedResult struct {
	isCorrect   bool
	confidence  float64
	explanation map[string]string
	cachedAt    time.Time
}

// NewAIClient creates a new AI client with resilience features.
func NewAIClient(baseURL, secret string) *AIClient {
	return NewAIClientWithConfig(AIClientConfig{
		BaseURL:        baseURL,
		Secret:         secret,
		MaxConcurrency: 10,
		Timeout:        30 * time.Second,
		CacheEnabled:   true,
		CacheTTL:       1 * time.Hour,
	})
}

// NewAIClientWithConfig creates a client with custom configuration.
func NewAIClientWithConfig(cfg AIClientConfig) *AIClient {
	if cfg.MaxConcurrency <= 0 {
		cfg.MaxConcurrency = 10
	}
	if cfg.Timeout <= 0 {
		cfg.Timeout = 30 * time.Second
	}
	if cfg.CacheTTL <= 0 {
		cfg.CacheTTL = 1 * time.Hour
	}

	client := &AIClient{
		BaseURL: cfg.BaseURL,
		Secret:  cfg.Secret,
		HTTPClient: &http.Client{
			Timeout: cfg.Timeout,
		},
		semaphore: concurrency.NewSemaphore(cfg.MaxConcurrency),
		circuitBreaker: resilience.NewCircuitBreaker(resilience.CircuitBreakerConfig{
			Name:         "ai-service",
			MaxFailures:  5,
			ResetTimeout: 30 * time.Second,
			HalfOpenMax:  2,
		}),
		cache:        make(map[string]*cachedResult),
		cacheTTL:     cfg.CacheTTL,
		cacheEnabled: cfg.CacheEnabled,
		bufferPool: sync.Pool{
			New: func() interface{} {
				return new(bytes.Buffer)
			},
		},
	}

	// Start cache cleanup goroutine
	if cfg.CacheEnabled {
		go client.cleanupCache()
	}

	return client
}

func (c *AIClient) cleanupCache() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		c.cacheMu.Lock()
		now := time.Now()
		for key, result := range c.cache {
			if now.Sub(result.cachedAt) > c.cacheTTL {
				delete(c.cache, key)
			}
		}
		c.cacheMu.Unlock()
	}
}

func (c *AIClient) doRequest(ctx context.Context, req *http.Request) (*http.Response, error) {
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Internal-Secret", c.Secret)

	// Use context for request
	req = req.WithContext(ctx)

	return c.HTTPClient.Do(req)
}

// doWithResilience executes an HTTP request with semaphore and circuit breaker.
func (c *AIClient) doWithResilience(ctx context.Context, req *http.Request) (*http.Response, error) {
	// Acquire semaphore slot
	if err := c.semaphore.Acquire(ctx); err != nil {
		return nil, fmt.Errorf("AI service at capacity: %w", err)
	}
	defer c.semaphore.Release()

	// Execute through circuit breaker
	var resp *http.Response
	err := c.circuitBreaker.Execute(ctx, func(ctx context.Context) error {
		var reqErr error
		resp, reqErr = c.doRequest(ctx, req)
		if reqErr != nil {
			return reqErr
		}
		// Treat 5xx as failures for circuit breaker
		if resp.StatusCode >= 500 {
			resp.Body.Close()
			return fmt.Errorf("AI service returned status: %d", resp.StatusCode)
		}
		return nil
	})

	return resp, err
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
	TopicID      string  `json:"topic_id"`
	TopicName    string  `json:"topic_name"`
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
	return c.EvaluateSubmissionWithContext(context.Background(), req)
}

func (c *AIClient) EvaluateSubmissionWithContext(ctx context.Context, req ExamAnalysisRequest) (*ExamAnalysisResponse, error) {
	// Use pool to reduce allocations
	buf := c.bufferPool.Get().(*bytes.Buffer)
	buf.Reset()
	defer c.bufferPool.Put(buf)

	if err := json.NewEncoder(buf).Encode(req); err != nil {
		return nil, err
	}

	reqHTTP, err := http.NewRequest("POST", c.BaseURL+"/api/v1/evaluate/evaluate", buf)
	if err != nil {
		return nil, err
	}

	resp, err := c.doWithResilience(ctx, reqHTTP)
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
	return c.GenerateBlueprintWithContext(context.Background(), req)
}

func (c *AIClient) GenerateBlueprintWithContext(ctx context.Context, req BlueprintRequest) (*ExamBlueprintResponse, error) {
	// Use pool to reduce allocations
	buf := c.bufferPool.Get().(*bytes.Buffer)
	buf.Reset()
	defer c.bufferPool.Put(buf)

	if err := json.NewEncoder(buf).Encode(req); err != nil {
		return nil, err
	}

	reqHTTP, err := http.NewRequest("POST", c.BaseURL+"/api/v1/generate/generate-blueprint", buf)
	if err != nil {
		return nil, err
	}

	resp, err := c.doWithResilience(ctx, reqHTTP)
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

// cacheKey generates a unique key for caching semantic check results.
func cacheKey(question, correctAnswer, userAnswer string) string {
	h := sha256.New()
	h.Write([]byte(question))
	h.Write([]byte("|"))
	h.Write([]byte(correctAnswer))
	h.Write([]byte("|"))
	h.Write([]byte(userAnswer))
	return hex.EncodeToString(h.Sum(nil))[:32]
}

func (c *AIClient) SemanticCheck(question, correctAnswer, userAnswer string) (bool, float64, map[string]string, error) {
	return c.SemanticCheckWithContext(context.Background(), question, correctAnswer, userAnswer)
}

func (c *AIClient) SemanticCheckWithContext(ctx context.Context, question, correctAnswer, userAnswer string) (bool, float64, map[string]string, error) {
	// Check cache first
	if c.cacheEnabled {
		key := cacheKey(question, correctAnswer, userAnswer)
		c.cacheMu.RLock()
		if cached, ok := c.cache[key]; ok {
			if time.Since(cached.cachedAt) < c.cacheTTL {
				c.cacheMu.RUnlock()
				return cached.isCorrect, cached.confidence, cached.explanation, nil
			}
		}
		c.cacheMu.RUnlock()
	}

	req := SemanticRequest{
		Question:      question,
		CorrectAnswer: correctAnswer,
		UserAnswer:    userAnswer,
	}

	// Use pool to reduce allocations
	buf := c.bufferPool.Get().(*bytes.Buffer)
	buf.Reset()
	defer c.bufferPool.Put(buf)

	if err := json.NewEncoder(buf).Encode(req); err != nil {
		return false, 0, nil, err
	}

	reqHTTP, err := http.NewRequest("POST", c.BaseURL+"/api/v1/evaluate/semantic-check", buf)
	if err != nil {
		return false, 0, nil, err
	}

	resp, err := c.doWithResilience(ctx, reqHTTP)
	if err != nil {
		// On circuit breaker open, return degraded response
		if err == resilience.ErrCircuitOpen {
			return c.degradedSemanticCheck(question, correctAnswer, userAnswer)
		}
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

	// Cache the result
	if c.cacheEnabled {
		key := cacheKey(question, correctAnswer, userAnswer)
		c.cacheMu.Lock()
		c.cache[key] = &cachedResult{
			isCorrect:   result.IsCorrect,
			confidence:  result.Confidence,
			explanation: result.Explanation,
			cachedAt:    time.Now(),
		}
		c.cacheMu.Unlock()
	}

	return result.IsCorrect, result.Confidence, result.Explanation, nil
}

// degradedSemanticCheck provides fallback when AI is unavailable.
func (c *AIClient) degradedSemanticCheck(question, correctAnswer, userAnswer string) (bool, float64, map[string]string, error) {
	// Simple string match as fallback
	isCorrect := correctAnswer == userAnswer
	confidence := 0.0
	if isCorrect {
		confidence = 1.0
	}
	explanation := map[string]string{
		"note": "AI service unavailable, using exact match",
	}
	return isCorrect, confidence, explanation, nil
}

// Stats returns AI client statistics for observability.
type AIClientStats struct {
	Semaphore      concurrency.SemaphoreStats
	CircuitBreaker resilience.CircuitBreakerStats
	CacheSize      int
}

func (c *AIClient) Stats() AIClientStats {
	c.cacheMu.RLock()
	cacheSize := len(c.cache)
	c.cacheMu.RUnlock()

	return AIClientStats{
		Semaphore:      c.semaphore.Stats(),
		CircuitBreaker: c.circuitBreaker.Stats(),
		CacheSize:      cacheSize,
	}
}

// IsHealthy returns true if the AI service is available.
func (c *AIClient) IsHealthy() bool {
	return c.circuitBreaker.State() != resilience.StateOpen
}

// GetCircuitBreaker returns the circuit breaker instance.
func (c *AIClient) GetCircuitBreaker() *resilience.CircuitBreaker {
	return c.circuitBreaker
}
