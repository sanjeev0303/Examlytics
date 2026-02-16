package dto

import "github.com/examlytics/server/internal/domain"

type CreateUserRequest struct {
	Email     string  `json:"email" binding:"required,email"`
	Password  string  `json:"password" binding:"required,min=8"`
	FirstName *string `json:"firstName"`
	LastName  *string `json:"lastName"`
	ImageURL  *string `json:"imageUrl"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type UserResponse struct {
	ID        string      `json:"id"`
	Email     string      `json:"email"`
	FirstName *string     `json:"firstName"`
	LastName  *string     `json:"lastName"`
	Role      domain.Role `json:"role"`
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

type AuthResponse struct {
	AccessToken  string        `json:"accessToken"`
	RefreshToken string        `json:"refreshToken"`
	User         *UserResponse `json:"user"`
}

type UpdateUserRequest struct {
	FirstName *string `json:"firstName"`
	LastName  *string `json:"lastName"`
	ImageURL  *string `json:"imageUrl"`
}
