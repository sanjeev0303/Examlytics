package main

import (
	"fmt"
	"log"
	"os"

	"github.com/examlytics/server/internal/config"
	"github.com/examlytics/server/internal/database"
	"github.com/examlytics/server/internal/domain"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		// Load .env file if it exists
		if _, err := os.Stat(".env"); err == nil {
			if err := godotenv.Load(); err != nil {
				log.Println("Error loading .env file")
			}
		}
	}

	cfg := config.Load()
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatal(err)
	}

	var questions []domain.Question
	// Fetch 5 questions including the Git ones if possible
	if err := db.Limit(10).Find(&questions).Error; err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Found %d questions\n", len(questions))
	for _, q := range questions {
		fmt.Printf("ID: %s\nText: %s\nCorrectAnswer: '%s'\nOptions: %v\n---\n", q.ID, q.Text, q.CorrectAnswer, q.Options)
	}
}
