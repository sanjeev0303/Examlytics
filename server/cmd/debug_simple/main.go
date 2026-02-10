package main

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/examlytics/server/internal/domain"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env not found")
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is empty")
	}

	// Strip channel_binding if present to avoid hang
	dbURL = strings.ReplaceAll(dbURL, "&channel_binding=require", "")
	dbURL = strings.ReplaceAll(dbURL, "?channel_binding=require", "?")

	fmt.Println("Connecting to DB (simplified URL)...")

	db, err := gorm.Open(postgres.Open(dbURL), &gorm.Config{
		Logger: gormlogger.Default.LogMode(gormlogger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}
	fmt.Println("Connected!")

	// Test ListPublic logic
	var exams []*domain.Exam
	fmt.Println("Running Find...")
	if err := db.Where("is_public = ?", true).Find(&exams).Error; err != nil {
		log.Fatalf("\n❌ Query Failed: %v\n", err)
	}

	fmt.Printf("\n✅ Success! Found %d exams\n", len(exams))
	for _, e := range exams {
		cb := "nil"
		if e.CreatedBy != nil {
			cb = e.CreatedBy.String()
		}
		fmt.Printf(" - ID: %s, CreatedBy: %v\n", e.ID, cb)
	}
}
