package main

import (
	"context"
	"fmt"
	"log"

	"github.com/examlytics/server/internal/infrastructure/ai"
	pb "github.com/examlytics/server/pkg/proto/examlytics/v1"
)

func main() {
	fmt.Println("=== Starting gRPC Client Verification ===")

	// 1. Initialize gRPC client
	client, err := ai.NewExamlyticsClient("localhost:50051")
	if err != nil {
		log.Fatalf("Failed to initialize gRPC client: %v", err)
	}
	defer client.Close()

	// 2. Test Unauthenticated Request
	fmt.Println("\n--- Testing Unauthenticated Request ---")
	unauthCtx := context.Background()
	_, err = client.GenerateExam(unauthCtx, "user-123", "Golang", 3)
	if err != nil {
		fmt.Printf("Received expected error: %v\n", err)
	} else {
		fmt.Println("❌ Error: Unauthenticated request unexpectedly succeeded!")
	}

	// 3. Test Authenticated Request (GenerateExam)
	fmt.Println("\n--- Testing Authenticated GenerateExam ---")
	authCtx := context.WithValue(context.Background(), "raw_token", "valid-test-token")
	resp, err := client.GenerateExam(authCtx, "user-123", "Golang", 3)
	if err != nil {
		fmt.Printf("❌ GenerateExam failed: %v\n", err)
	} else {
		fmt.Printf("✅ GenerateExam succeeded!\n")
		fmt.Printf("Exam ID: %s\n", resp.ExamId)
		fmt.Printf("Questions Count: %d\n", len(resp.Questions))
		for i, q := range resp.Questions {
			fmt.Printf("  Q%d: %s (Topic: %s)\n", i+1, q.Text, q.Topic)
		}
	}

	// 4. Test Authenticated Request (AnalyzeExam)
	fmt.Println("\n--- Testing Authenticated AnalyzeExam ---")
	responses := []*pb.ResponseItem{
		{QuestionId: "q-1", Answer: "Option A", TimeSpent: 15},
		{QuestionId: "q-2", Answer: "Option B", TimeSpent: 20},
	}
	analysisResp, err := client.AnalyzeExam(authCtx, "exam-123", "user-123", responses)
	if err != nil {
		fmt.Printf("❌ AnalyzeExam failed: %v\n", err)
	} else {
		fmt.Printf("✅ AnalyzeExam succeeded!\n")
		fmt.Printf("Score: %.2f\n", analysisResp.Score)
		fmt.Printf("Accuracy: %.2f\n", analysisResp.Accuracy)
		fmt.Printf("Weak Topics: %v\n", analysisResp.WeakTopics)
	}

	// 5. Test Authenticated Request (StreamExplanation)
	fmt.Println("\n--- Testing Authenticated StreamExplanation ---")
	ch, err := client.StreamExplanation(authCtx, "q-1")
	if err != nil {
		fmt.Printf("❌ StreamExplanation failed: %v\n", err)
	} else {
		fmt.Printf("✅ StreamExplanation started. Receiving stream:\n")
		for chunk := range ch {
			fmt.Print(chunk)
		}
		fmt.Println("\nStream ended.")
	}

	// 6. Test Authenticated Request (PredictPerformance)
	fmt.Println("\n--- Testing Authenticated PredictPerformance ---")
	// Using a dummy UUID for user_id to test the database lookup behavior
	predictResp, err := client.PredictPerformance(authCtx, "00000000-0000-0000-0000-000000000000")
	if err != nil {
		fmt.Printf("PredictPerformance result (expected database error / warning): %v\n", err)
	} else {
		fmt.Printf("✅ PredictPerformance succeeded!\n")
		fmt.Printf("Predicted Score: %.2f\n", predictResp.PredictedScore)
		fmt.Printf("Confidence: %.2f\n", predictResp.ConfidenceScore)
		fmt.Printf("Risk Level: %s\n", predictResp.RiskLevel)
	}
}
