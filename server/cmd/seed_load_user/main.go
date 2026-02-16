package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/examlytics/server/internal/config"
	"github.com/examlytics/server/internal/database"
	"github.com/examlytics/server/internal/domain"
	"github.com/examlytics/server/pkg/utils"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
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
	result := db.Where("email = ?", "loadtest@examlytics.com").First(&existingUser)

	if result.Error == nil {
		fmt.Println("✅ Load test user already exists:")
		fmt.Printf("   ID: %s\n", existingUser.ID)
		fmt.Printf("   Email: %s\n", existingUser.Email)

		// Generate token for existing user
		token, _ := utils.GenerateAccessToken(&existingUser)
		fmt.Printf("   JWT Token: %s\n", token)
		os.Exit(0)
	}

	// Create load test user
	firstName := "Load"
	lastName := "Tester"
	imageURL := "https://example.com/avatar.jpg"

	// Hash password
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("LoadTest@123"), bcrypt.DefaultCost)

	user := domain.User{
		ID:        uuid.New().String(),
		Email:     "loadtest@examlytics.com",
		Password:  string(hashedPassword),
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

	// Generate Token
	token, _ := utils.GenerateAccessToken(&user)

	fmt.Println("✅ Successfully seeded load test user!")
	fmt.Printf("   ID: %s\n", user.ID)
	fmt.Printf("   Email: %s\n", user.Email)
	fmt.Printf("   Password: LoadTest@123\n")
	fmt.Printf("   JWT Token: %s\n", token)
}
