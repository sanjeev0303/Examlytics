package ai

import (
	"context"
	"testing"

	"github.com/examlytics/server/internal/domain"
)

// To run: go test -bench . -benchmem internal/infrastructure/ai/ai_benchmark_test.go
// Note: Requires AI service running on localhost:8000 (REST) and localhost:50051 (gRPC)

func BenchmarkGenerateQuestions(b *testing.B) {
	ctx := context.Background()
	topic := "Golang Concurrency"
	count := 5
	difficulty := "MEDIUM"

	// Setup Providers
	grpcClient, _ := NewExamlyticsClient("localhost:50051")
	grpcProvider := NewAIAdapter(grpcClient)

	restProvider := NewRESTAIProvider("http://localhost:8000", "internal-secret")

	b.Run("gRPC", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			_, _ = grpcProvider.GenerateQuestions(ctx, topic, count, difficulty)
		}
	})

	b.Run("REST", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			_, _ = restProvider.GenerateQuestions(ctx, topic, count, difficulty)
		}
	})
}

func BenchmarkAnalyzePerformance(b *testing.B) {
	ctx := context.Background()
	attempt := &domain.ExamAttempt{
		ExamID: "test-exam-id",
		UserID: "test-user-id",
	}

	// Setup Providers
	grpcClient, _ := NewExamlyticsClient("localhost:50051")
	grpcProvider := NewAIAdapter(grpcClient)

	restProvider := NewRESTAIProvider("http://localhost:8000", "internal-secret")

	b.Run("gRPC", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			_, _ = grpcProvider.AnalyzePerformance(ctx, attempt)
		}
	})

	b.Run("REST", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			_, _ = restProvider.AnalyzePerformance(ctx, attempt)
		}
	})
}
