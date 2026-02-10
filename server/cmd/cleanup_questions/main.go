package main

import (
	"fmt"
	"log"

	"github.com/examlytics/server/internal/config"
	"github.com/examlytics/server/internal/database"
	"github.com/examlytics/server/internal/domain"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	cfg := config.Load()
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatal(err)
	}

	// Soft delete or hard delete? Gorm uses soft delete if DeletedAt is present.
	// domain.Question doesn't seem to have gorm.Model or DeletedAt.
	// Checking domain/question.go:
	/*
		type Question struct {
			ID            string         `json:"id" gorm:"type:uuid;primaryKey"`
			...
			CreatedAt     time.Time      `json:"createdAt"`
			UpdatedAt     time.Time      `json:"updatedAt"`
		}
	*/
	// typically no DeletedAt unless specified. So it's Hard Delete. Good.

	var count int64
	// Check for empty correct answer
	if err := db.Model(&domain.Question{}).Where("correct_answer = '' OR correct_answer IS NULL").Count(&count).Error; err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Found %d questions with empty correct answer\n", count)

	if count > 0 {
		if err := db.Where("correct_answer = '' OR correct_answer IS NULL").Delete(&domain.Question{}).Error; err != nil {
			log.Fatal(err)
		}
		fmt.Println("Deleted invalid questions.")
	} else {
		fmt.Println("No invalid questions found.")
	}

	// Also check for mismatch (CorrectAnswer not in Options)
	// This is harder to check in SQL/Gorm without raw query.
	// We'll iterate.
	var questions []domain.Question
	db.Find(&questions)
	mismatchCount := 0
	for _, q := range questions {
		if q.CorrectAnswer == "" {
			continue // Already deleted logic
		}
		found := false
		for _, opt := range q.Options {
			if opt == q.CorrectAnswer {
				found = true
				break
			}
		}
		if !found {
			fmt.Printf("Mismatch ID: %s. Correct: '%s' not in Options: %v\n", q.ID, q.CorrectAnswer, q.Options)
			db.Delete(&q) // Delete this one too
			mismatchCount++
		}
	}
	if mismatchCount > 0 {
		fmt.Printf("Deleted %d questions with option mismatch\n", mismatchCount)
	}
}
