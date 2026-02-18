package main

import (
	"log"

	"github.com/examlytics/server/internal/domain"
	"github.com/examlytics/server/internal/infrastructure/ai"
	"github.com/examlytics/server/internal/usecase"
)

func main() {
	// ... (infrastructure skipped)
	// AI Service Client (gRPC)
	aiClient, err := ai.NewExamlyticsClient("localhost:50051")
	if err != nil {
		log.Fatalf("Failed to create AI client: %v", err)
	}
	defer aiClient.Close()

	aiAdapter := ai.NewAIAdapter(aiClient)

	// 2. Initialize Repositories
	// For now, using nil or mock since we haven't implemented Postgres repo yet
	var examRepo domain.ExamRepository

	// 3. Initialize Use Cases
	examUseCase := usecase.NewExamUseCase(examRepo, aiAdapter)

	// 4. Initialize Handlers (HTTP/gRPC)
	// server := http.NewServer(examUseCase)
	// server.Start(":8080")

	log.Println("Server structure ready. UseCase initialized:", examUseCase)
}
