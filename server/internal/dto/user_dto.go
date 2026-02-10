package dto

import "github.com/examlytics/server/internal/domain"

type CreateUserRequest struct {
	ClerkID   string  `json:"clerkId"` // Added for internal use
	Email     string  `json:"email" binding:"required,email"`
	FirstName *string `json:"firstName"`
	LastName  *string `json:"lastName"`
	ImageURL  *string `json:"imageUrl"`
}

type UserResponse struct {
	ID        string      `json:"id"`
	Email     string      `json:"email"`
	FirstName *string     `json:"firstName"`
	LastName  *string     `json:"lastName"`
	Role      domain.Role `json:"role"`
}

type SyncUserRequest struct {
	Email     string  `json:"email"`
	FirstName *string `json:"firstName"`
	LastName  *string `json:"lastName"`
	ImageURL  *string `json:"imageUrl"`
}

type RoleResponse struct {
	Role string `json:"role"`
}

type OnboardingRequest struct {
	TargetGoal      string   `json:"targetGoal" binding:"required"`
	PreferredTopics []string `json:"preferredTopics" binding:"required"`
}

type AdminStatsResponse struct {
	TotalUsers     int64 `json:"totalUsers"`
	TotalExams     int64 `json:"totalExams"`
	TotalQuestions int64 `json:"totalQuestions"`
}
