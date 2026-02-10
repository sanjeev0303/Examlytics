package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/examlytics/server/internal/config"
	"github.com/examlytics/server/internal/database"
	"github.com/examlytics/server/internal/domain"
	"github.com/google/uuid"
)

func main() {
	fmt.Println("🌱 Seeding Load Test User...")

	// Load config
	cfg := config.Load()

	// Connect to database
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Check if load test user already exists
	var existingUser domain.User
	result := db.Where("clerk_id = ?", "load_test_user_bypass").First(&existingUser)

	if result.Error == nil {
		fmt.Println("✅ Load test user already exists:")
		fmt.Printf("   ID: %s\n", existingUser.ID)
		fmt.Printf("   Email: %s\n", existingUser.Email)
		fmt.Printf("   Clerk ID: %s\n", existingUser.ClerkID)
		os.Exit(0)
	}

	// Create load test user
	firstName := "Load"
	lastName := "Tester"
	imageURL := "https://example.com/avatar.jpg"

	user := domain.User{
		ID:        uuid.New().String(),
		ClerkID:   "load_test_user_bypass",
		Email:     "loadtest@examlytics.com",
		FirstName: &firstName,
		LastName:  &lastName,
		ImageURL:  &imageURL,
		Role:      domain.RoleUser,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := db.Create(&user).Error; err != nil {
		log.Fatalf("❌ Failed to create load test user: %v", err)
	}

	fmt.Println("✅ Successfully seeded load test user!")
	fmt.Printf("   ID: %s\n", user.ID)
	fmt.Printf("   Email: %s\n", user.Email)
	fmt.Printf("   Clerk ID: %s\n", user.ClerkID)
	fmt.Println("\n💡 Use Authorization header: Bearer LOAD_TEST_BYPASS_TOKEN")
}
