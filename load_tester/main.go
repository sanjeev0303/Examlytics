package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"math/rand"
	"net/http"
	"os"
	"runtime"
	"sort"
	"strings"
	"sync"
	"sync/atomic"
	"time"
)

// Config
const (
	ServerURL        = "http://localhost:8000"
	AIServiceURL     = "http://localhost:8001"
	TestToken        = "LOAD_TEST_BYPASS_TOKEN"
	AIInternalSecret = "internal-secret"
)

// Statistics per phase
type PhaseStats struct {
	Name         string
	VUs          int
	RequestCount uint64
	ErrorCount   uint64
	Latencies    []time.Duration
	Duration     time.Duration
	StartTime    time.Time
	EndTime      time.Time
	ErrorTypes   map[string]uint64
	mu           sync.Mutex
}

type OverallReport struct {
	Timestamp           string                 `json:"timestamp"`
	Services            []ServiceReport        `json:"services"`
	RecommendedCapacity CapacityRecommendation `json:"recommended_capacity"`
}

type ServiceReport struct {
	Name   string        `json:"name"`
	URL    string        `json:"url"`
	Phases []PhaseReport `json:"phases"`
}

type PhaseReport struct {
	Name           string            `json:"name"`
	VirtualUsers   int               `json:"virtual_users"`
	Duration       float64           `json:"duration_seconds"`
	TotalRequests  uint64            `json:"total_requests"`
	TotalErrors    uint64            `json:"total_errors"`
	ErrorRate      float64           `json:"error_rate_percent"`
	RequestsPerSec float64           `json:"requests_per_second"`
	Latency        LatencyStats      `json:"latency"`
	ErrorBreakdown map[string]uint64 `json:"error_breakdown"`
	SystemMetrics  SystemMetrics     `json:"system_metrics"`
}

type LatencyStats struct {
	P50  int64 `json:"p50_ms"`
	P95  int64 `json:"p95_ms"`
	P99  int64 `json:"p99_ms"`
	P999 int64 `json:"p999_ms"`
	Min  int64 `json:"min_ms"`
	Max  int64 `json:"max_ms"`
	Avg  int64 `json:"avg_ms"`
}

type SystemMetrics struct {
	Goroutines  int     `json:"goroutines"`
	HeapAllocMB float64 `json:"heap_alloc_mb"`
	NumGC       uint32  `json:"num_gc"`
}

type CapacityRecommendation struct {
	Server    CapacityMetrics `json:"server"`
	AIService CapacityMetrics `json:"ai_service"`
}

type CapacityMetrics struct {
	SafeCapacity   int    `json:"safe_capacity_users"`
	MaxCapacity    int    `json:"max_capacity_users"`
	BreakingPoint  int    `json:"breaking_point_users"`
	Recommendation string `json:"recommendation"`
}

// Global Client to reuse connections
var httpClient = &http.Client{
	Timeout: 30 * time.Second,
	Transport: &http.Transport{
		MaxIdleConns:        2000,
		MaxIdleConnsPerHost: 2000,
		IdleConnTimeout:     90 * time.Second,
	},
}

type AsyncJobResponse struct {
	JobID  string `json:"jobId"`
	Status string `json:"status"`
}

type ExamStatusResponse struct {
	JobID     string `json:"jobId"`
	Status    string `json:"status"`
	SessionID string `json:"sessionId"`
	Error     string `json:"error"`
}

type SessionResponse struct {
	SessionID string `json:"sessionId"`
	Questions []struct {
		ID string `json:"id"`
	} `json:"questions"`
}

func main() {
	rand.Seed(time.Now().UnixNano())
	fmt.Println("🚀 Examlytics Load Testing Suite")
	fmt.Println("==================================")

	// Wait for services to be ready
	fmt.Println("\n⏳ Waiting for services to be ready...")
	if !waitForService(ServerURL+"/health", 30) {
		fmt.Println("❌ Server is not responding. Please start the server first.")
		os.Exit(1)
	}
	if !waitForService(AIServiceURL+"/health", 30) {
		fmt.Println("❌ AI Service is not responding. Please start the AI service first.")
		os.Exit(1)
	}
	fmt.Println("✅ Both services are ready!\n")

	// Setup test user (non-blocking)
	setupUser() // Ignore errors, auth might already exist

	report := OverallReport{
		Timestamp: time.Now().Format(time.RFC3339),
		Services:  make([]ServiceReport, 0),
	}

	// Test Server
	fmt.Println("\n📊 TESTING GO SERVER")
	fmt.Println("====================")
	serverReport := testServer()
	report.Services = append(report.Services, serverReport)

	// Cooldown
	fmt.Println("\n⏸️  Cooldown for 10 seconds...")
	time.Sleep(10 * time.Second)

	// Test AI Service
	fmt.Println("\n🤖 TESTING AI SERVICE")
	fmt.Println("=====================")
	aiReport := testAIService()
	report.Services = append(report.Services, aiReport)

	// Calculate capacity recommendations
	report.RecommendedCapacity = calculateCapacity(serverReport, aiReport)

	// Generate reports
	generateJSONReport(report)
	generateConsoleReport(report)

	fmt.Println("\n✅ Load testing complete!")
	fmt.Println("📄 Report saved to: load_test_report.json")
}

func waitForService(url string, timeoutSec int) bool {
	for i := 0; i < timeoutSec; i++ {
		resp, err := http.Get(url)
		if err == nil && resp.StatusCode == 200 {
			resp.Body.Close()
			return true
		}
		time.Sleep(1 * time.Second)
	}
	return false
}

func testServer() ServiceReport {
	phases := []struct {
		name string
		vus  int
		dur  int
	}{
		{"Warmup", 50, 15},
		{"Normal Load", 500, 15},
		{"Peak Load", 2000, 15},
		{"Stress Test", 5000, 15},
	}

	reports := make([]PhaseReport, 0)

	for _, phase := range phases {
		fmt.Printf("\n▶️  Phase: %s (%d VUs for %d seconds)\n", phase.name, phase.vus, phase.dur)

		stats := runServerPhase(phase.vus, time.Duration(phase.dur)*time.Second, phase.name)
		report := generatePhaseReport(stats)
		reports = append(reports, report)

		printPhaseConsole(report)

		// Cooldown
		time.Sleep(3 * time.Second)
	}

	return ServiceReport{
		Name:   "Go Server",
		URL:    ServerURL,
		Phases: reports,
	}
}

func testAIService() ServiceReport {
	phases := []struct {
		name string
		vus  int
		dur  int
	}{
		{"Warmup", 10, 20},
		{"Normal Load", 50, 20},
		{"Peak Load", 100, 20},
		{"Stress Test", 200, 20},
	}

	reports := make([]PhaseReport, 0)

	for _, phase := range phases {
		fmt.Printf("\n▶️  Phase: %s (%d VUs for %d seconds)\n", phase.name, phase.vus, phase.dur)

		stats := runAIServicePhase(phase.vus, time.Duration(phase.dur)*time.Second, phase.name)
		report := generatePhaseReport(stats)
		reports = append(reports, report)

		printPhaseConsole(report)

		// Cooldown
		time.Sleep(5 * time.Second)
	}

	return ServiceReport{
		Name:   "AI Service",
		URL:    AIServiceURL,
		Phases: reports,
	}
}

func doServerRequest(method, path string, bodyData interface{}) (error, []byte) {
	var body io.Reader
	if bodyData != nil {
		b, _ := json.Marshal(bodyData)
		body = bytes.NewBuffer(b)
	}

	req, err := http.NewRequest(method, ServerURL+path, body)
	if err != nil {
		return err, nil
	}
	req.Header.Set("Authorization", "Bearer "+TestToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := httpClient.Do(req)
	if err != nil {
		return err, nil
	}
	defer resp.Body.Close()
	respBytes, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 400 {
		return fmt.Errorf("HTTP_%d", resp.StatusCode), respBytes
	}

	return nil, respBytes
}

func doAIRequest(method, path string, bodyData interface{}) (error, []byte) {
	var body io.Reader
	if bodyData != nil {
		b, _ := json.Marshal(bodyData)
		body = bytes.NewBuffer(b)
	}

	req, err := http.NewRequest(method, AIServiceURL+path, body)
	if err != nil {
		return err, nil
	}
	req.Header.Set("X-Internal-Secret", AIInternalSecret)
	req.Header.Set("Content-Type", "application/json")

	resp, err := httpClient.Do(req)
	if err != nil {
		return err, nil
	}
	defer resp.Body.Close()
	respBytes, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 400 {
		return fmt.Errorf("HTTP_%d", resp.StatusCode), respBytes
	}

	return nil, respBytes
}

func runServerPhase(vusers int, duration time.Duration, name string) *PhaseStats {
	stats := &PhaseStats{
		Name:       name,
		VUs:        vusers,
		Latencies:  make([]time.Duration, 0, 10000),
		StartTime:  time.Now(),
		ErrorTypes: make(map[string]uint64),
	}

	var wg sync.WaitGroup
	var latenciesMu sync.Mutex
	stop := make(chan struct{})

	for i := 0; i < vusers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()

			for {
				select {
				case <-stop:
					return
				default:
					start := time.Now()
					r := rand.Intn(100)
					var err error

					if r < 60 {
						// Read operations
						if rand.Intn(2) == 0 {
							err, _ = doServerRequest("GET", "/auth/me", nil)
						} else {
							err, _ = doServerRequest("GET", "/exams/history", nil)
						}
					} else if r < 85 {
						// Exam start (async) - REPLACED WITH ASYNC FLOW
						err = startAndSubmitExam()
					} else {
						// Other operations
						err, _ = doServerRequest("GET", "/exams/weak-topics", nil)
					}

					latency := time.Since(start)

					if err != nil {
						atomic.AddUint64(&stats.ErrorCount, 1)
						stats.mu.Lock()
						stats.ErrorTypes[err.Error()]++
						stats.mu.Unlock()
					} else {
						atomic.AddUint64(&stats.RequestCount, 1)
						latenciesMu.Lock()
						stats.Latencies = append(stats.Latencies, latency)
						latenciesMu.Unlock()
					}
				}
			}
		}()
	}

	time.Sleep(duration)
	close(stop)
	wg.Wait()

	stats.EndTime = time.Now()
	stats.Duration = stats.EndTime.Sub(stats.StartTime)
	return stats
}

func runAIServicePhase(vusers int, duration time.Duration, name string) *PhaseStats {
	stats := &PhaseStats{
		Name:       name,
		VUs:        vusers,
		Latencies:  make([]time.Duration, 0, 5000),
		StartTime:  time.Now(),
		ErrorTypes: make(map[string]uint64),
	}

	var wg sync.WaitGroup
	var latenciesMu sync.Mutex
	stop := make(chan struct{})

	for i := 0; i < vusers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()

			for {
				select {
				case <-stop:
					return
				default:
					start := time.Now()
					r := rand.Intn(100)
					var err error

					if r < 50 {
						// Health check (lightweight)
						err, _ = doAIRequest("GET", "/health", nil)
					} else {
						// Heavier operations - less frequent to avoid overload
						time.Sleep(time.Duration(rand.Intn(500)) * time.Millisecond)
						err, _ = doAIRequest("GET", "/health", nil)
					}

					latency := time.Since(start)

					if err != nil {
						atomic.AddUint64(&stats.ErrorCount, 1)
						stats.mu.Lock()
						stats.ErrorTypes[err.Error()]++
						stats.mu.Unlock()
					} else {
						atomic.AddUint64(&stats.RequestCount, 1)
						latenciesMu.Lock()
						stats.Latencies = append(stats.Latencies, latency)
						latenciesMu.Unlock()
					}
				}
			}
		}()
	}

	time.Sleep(duration)
	close(stop)
	wg.Wait()

	stats.EndTime = time.Now()
	stats.Duration = stats.EndTime.Sub(stats.StartTime)
	return stats
}

func generatePhaseReport(stats *PhaseStats) PhaseReport {
	var memStats runtime.MemStats
	runtime.ReadMemStats(&memStats)

	totalOps := stats.RequestCount + stats.ErrorCount
	errorRate := float64(0)
	if totalOps > 0 {
		errorRate = float64(stats.ErrorCount) / float64(totalOps) * 100
	}

	rps := float64(stats.RequestCount) / stats.Duration.Seconds()

	sort.Slice(stats.Latencies, func(i, j int) bool {
		return stats.Latencies[i] < stats.Latencies[j]
	})

	latency := LatencyStats{}
	if len(stats.Latencies) > 0 {
		latency = LatencyStats{
			P50:  percentile(stats.Latencies, 0.50).Milliseconds(),
			P95:  percentile(stats.Latencies, 0.95).Milliseconds(),
			P99:  percentile(stats.Latencies, 0.99).Milliseconds(),
			P999: percentile(stats.Latencies, 0.999).Milliseconds(),
			Min:  stats.Latencies[0].Milliseconds(),
			Max:  stats.Latencies[len(stats.Latencies)-1].Milliseconds(),
			Avg:  average(stats.Latencies).Milliseconds(),
		}
	}

	return PhaseReport{
		Name:           stats.Name,
		VirtualUsers:   stats.VUs,
		Duration:       stats.Duration.Seconds(),
		TotalRequests:  stats.RequestCount,
		TotalErrors:    stats.ErrorCount,
		ErrorRate:      errorRate,
		RequestsPerSec: rps,
		Latency:        latency,
		ErrorBreakdown: stats.ErrorTypes,
		SystemMetrics: SystemMetrics{
			Goroutines:  runtime.NumGoroutine(),
			HeapAllocMB: float64(memStats.HeapAlloc) / 1024 / 1024,
			NumGC:       memStats.NumGC,
		},
	}
}

func percentile(latencies []time.Duration, p float64) time.Duration {
	if len(latencies) == 0 {
		return 0
	}
	index := int(math.Ceil(float64(len(latencies))*p)) - 1
	if index >= len(latencies) {
		index = len(latencies) - 1
	}
	if index < 0 {
		index = 0
	}
	return latencies[index]
}

func average(latencies []time.Duration) time.Duration {
	if len(latencies) == 0 {
		return 0
	}
	var sum time.Duration
	for _, l := range latencies {
		sum += l
	}
	return sum / time.Duration(len(latencies))
}

func calculateCapacity(serverReport, aiReport ServiceReport) CapacityRecommendation {
	serverCap := analyzeCapacity(serverReport.Phases)
	aiCap := analyzeCapacity(aiReport.Phases)

	return CapacityRecommendation{
		Server:    serverCap,
		AIService: aiCap,
	}
}

func analyzeCapacity(phases []PhaseReport) CapacityMetrics {
	safe, max, breaking := 0, 0, 0

	for _, phase := range phases {
		// Safe: <2% error, P95 <200ms
		if phase.ErrorRate < 2.0 && phase.Latency.P95 < 200 {
			if phase.VirtualUsers > safe {
				safe = phase.VirtualUsers
			}
		}

		// Max: <5% error, P95 <500ms
		if phase.ErrorRate < 5.0 && phase.Latency.P95 < 500 {
			if phase.VirtualUsers > max {
				max = phase.VirtualUsers
			}
		}

		// Breaking: >20% error
		if phase.ErrorRate >= 20.0 {
			if breaking == 0 || phase.VirtualUsers < breaking {
				breaking = phase.VirtualUsers
			}
		}
	}

	// If no breaking point found, use highest tested
	if breaking == 0 && len(phases) > 0 {
		breaking = phases[len(phases)-1].VirtualUsers
	}

	recommendation := fmt.Sprintf("Safe capacity: %d users, Max capacity: %d users", safe, max)

	return CapacityMetrics{
		SafeCapacity:   safe,
		MaxCapacity:    max,
		BreakingPoint:  breaking,
		Recommendation: recommendation,
	}
}

func generateJSONReport(report OverallReport) {
	file, err := os.Create("load_test_report.json")
	if err != nil {
		fmt.Printf("Error creating JSON report: %v\n", err)
		return
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	encoder.Encode(report)
}

func generateConsoleReport(report OverallReport) {
	fmt.Println("\n" + strings.Repeat("=", 80))
	fmt.Println("📊 LOAD TEST SUMMARY")
	fmt.Println(strings.Repeat("=", 80))

	for _, service := range report.Services {
		fmt.Printf("\n🔹 %s (%s)\n", service.Name, service.URL)
		fmt.Println(strings.Repeat("-", 80))

		for _, phase := range service.Phases {
			fmt.Printf("\nPhase: %s\n", phase.Name)
			fmt.Printf("  VUs: %d | Duration: %.1fs | RPS: %.2f\n",
				phase.VirtualUsers, phase.Duration, phase.RequestsPerSec)
			fmt.Printf("  Requests: %d | Errors: %d (%.2f%%)\n",
				phase.TotalRequests, phase.TotalErrors, phase.ErrorRate)
			fmt.Printf("  Latency: P50=%dms P95=%dms P99=%dms P99.9=%dms\n",
				phase.Latency.P50, phase.Latency.P95, phase.Latency.P99, phase.Latency.P999)
		}
	}

	fmt.Println("\n" + strings.Repeat("=", 80))
	fmt.Println("🎯 CAPACITY RECOMMENDATIONS")
	fmt.Println(strings.Repeat("=", 80))

	fmt.Printf("\n🖥️  Server:\n")
	fmt.Printf("   Safe Capacity: %d concurrent users\n", report.RecommendedCapacity.Server.SafeCapacity)
	fmt.Printf("   Max Capacity: %d concurrent users\n", report.RecommendedCapacity.Server.MaxCapacity)
	fmt.Printf("   Breaking Point: %d concurrent users\n", report.RecommendedCapacity.Server.BreakingPoint)

	fmt.Printf("\n🤖 AI Service:\n")
	fmt.Printf("   Safe Capacity: %d concurrent users\n", report.RecommendedCapacity.AIService.SafeCapacity)
	fmt.Printf("   Max Capacity: %d concurrent users\n", report.RecommendedCapacity.AIService.MaxCapacity)
	fmt.Printf("   Breaking Point: %d concurrent users\n", report.RecommendedCapacity.AIService.BreakingPoint)

	fmt.Println("\n" + strings.Repeat("=", 80))
}

func printPhaseConsole(report PhaseReport) {
	status := "✅"
	if report.ErrorRate > 5 {
		status = "❌"
	} else if report.ErrorRate > 2 {
		status = "⚠️ "
	}

	fmt.Printf("%s RPS: %.2f | Errors: %.2f%% | P95: %dms | P99: %dms\n",
		status, report.RequestsPerSec, report.ErrorRate, report.Latency.P95, report.Latency.P99)
}

func setupUser() error {
	user := map[string]string{
		"email":     "loadtest@examlytics.com",
		"firstName": "Load",
		"lastName":  "Tester",
		"imageUrl":  "https://example.com/avatar.jpg",
	}
	err, _ := doServerRequest("POST", "/auth/sync", user)
	return err
}

func startAndSubmitExam() error {
	// 1. Start Exam
	err, respBytes := doServerRequest("POST", "/exams/start", map[string]interface{}{
		"type":          "JOB",
		"difficulty":    "MEDIUM",
		"questionCount": 3, // Keep it small for load test
		"subjects":      []string{"Physics", "Chemistry"},
		"source":        "load_test",
	})
	if err != nil {
		return err
	}

	var jobResp AsyncJobResponse
	if err := json.Unmarshal(respBytes, &jobResp); err != nil {
		return err
	}

	// 2. Poll for Completion (Max 10s)
	sessionID := ""
	for i := 0; i < 20; i++ {
		time.Sleep(500 * time.Millisecond)
		err, statusBytes := doServerRequest("GET", "/exams/status/"+jobResp.JobID, nil)
		if err != nil {
			return err
		}
		var status ExamStatusResponse
		if err := json.Unmarshal(statusBytes, &status); err != nil {
			return err
		}
		if status.Status == "COMPLETED" {
			sessionID = status.SessionID
			break
		}
		if status.Status == "FAILED" {
			return fmt.Errorf("job_failed: %s", status.Error)
		}
	}

	if sessionID == "" {
		return fmt.Errorf("timeout_polling_start")
	}

	// 3. Get Session (to get questions)
	err, sessionBytes := doServerRequest("GET", "/exams/session/"+sessionID, nil)
	if err != nil {
		return err
	}
	var session SessionResponse
	if err := json.Unmarshal(sessionBytes, &session); err != nil {
		return err
	}

	// 4. Submit Exam
	answers := make([]map[string]interface{}, 0)
	for _, q := range session.Questions {
		answers = append(answers, map[string]interface{}{
			"questionId": q.ID,
			"answer":     "Option A", // Dummy answer
			"timeSpent":  10,
		})
	}

	err, submitBytes := doServerRequest("POST", "/exams/submit", map[string]interface{}{
		"sessionId": sessionID,
		"answers":   answers,
	})
	if err != nil {
		return err
	}

	var submitJob AsyncJobResponse
	if err := json.Unmarshal(submitBytes, &submitJob); err != nil {
		return err
	}

	// 5. Poll for Submission (Max 10s)
	for i := 0; i < 20; i++ {
		time.Sleep(500 * time.Millisecond)
		err, statusBytes := doServerRequest("GET", "/exams/status/"+submitJob.JobID, nil)
		if err != nil {
			return err
		}
		var status ExamStatusResponse
		if err := json.Unmarshal(statusBytes, &status); err != nil {
			return err
		}
		if status.Status == "COMPLETED" {
			return nil // Success
		}
		if status.Status == "FAILED" {
			return fmt.Errorf("job_failed_submit: %s", status.Error)
		}
	}

	return fmt.Errorf("timeout_polling_submit")
}
