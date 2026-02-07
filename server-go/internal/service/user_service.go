package service

import (
	"context"
	"errors"

	"github.com/examlytics/server/internal/domain"
	"github.com/examlytics/server/internal/dto"
	"github.com/examlytics/server/internal/repository"
)

// UserService defines the interface for user business logic
type UserService interface {
	CreateUser(ctx context.Context, data *dto.CreateUserRequest) (*domain.User, error)
	GetUsers(ctx context.Context) ([]*domain.User, error)
	GetUserByClerkID(ctx context.Context, clerkID string) (*domain.User, error)
	GetUserRoleByClerkID(ctx context.Context, clerkID string) (*string, error)
	SyncClerkUser(ctx context.Context, data *dto.CreateUserRequest) (*domain.User, error)
	OnboardUser(ctx context.Context, clerkID string, req dto.OnboardingRequest) error
	GetAdminStats(ctx context.Context) (*dto.AdminStatsResponse, error)
	GetUserWeakTopics(ctx context.Context, clerkID string) ([]*domain.UserWeakTopic, error)
	GetUserAIContext(ctx context.Context, userID string) (*domain.UserAIContext, error)
}

// UserServiceImpl implements UserService
type UserServiceImpl struct {
	userRepo repository.UserRepository
	examRepo repository.ExamRepository
}

// NewUserService creates a new UserServiceImpl (updated signature to include examRepo)
func NewUserService(userRepo repository.UserRepository, examRepo repository.ExamRepository) UserService {
	return &UserServiceImpl{userRepo: userRepo, examRepo: examRepo}
}

// CreateUser creates a new user
func (s *UserServiceImpl) CreateUser(ctx context.Context, data *dto.CreateUserRequest) (*domain.User, error) {
	return s.userRepo.Create(ctx, data)
}

// GetUsers retrieves all users
func (s *UserServiceImpl) GetUsers(ctx context.Context) ([]*domain.User, error) {
	return s.userRepo.FindAll(ctx)
}

// GetUserByClerkID retrieves a user by their Clerk ID
func (s *UserServiceImpl) GetUserByClerkID(ctx context.Context, clerkID string) (*domain.User, error) {
	return s.userRepo.FindByClerkID(ctx, clerkID)
}

// GetUserRoleByClerkID retrieves just the role for a user by Clerk ID
func (s *UserServiceImpl) GetUserRoleByClerkID(ctx context.Context, clerkID string) (*string, error) {
	user, err := s.userRepo.FindByClerkID(ctx, clerkID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, nil
	}
	role := string(user.Role)
	return &role, nil
}

func (s *UserServiceImpl) SyncClerkUser(ctx context.Context, data *dto.CreateUserRequest) (*domain.User, error) {
	return s.userRepo.UpsertByClerkID(ctx, data)
}

// OnboardUser saves user preferences
func (s *UserServiceImpl) OnboardUser(ctx context.Context, clerkID string, req dto.OnboardingRequest) error {
	// Find user first
	user, err := s.userRepo.FindByClerkID(ctx, clerkID)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("user not found")
	}

	prefs := &domain.UserPreference{
		UserID:    user.ID,
		Goal:      req.TargetGoal,
		ExamTypes: req.PreferredTopics, // Mapping topics to ExamTypes as requested in PRD
	}

	return s.userRepo.SavePreferences(ctx, prefs)
}

func (s *UserServiceImpl) GetAdminStats(ctx context.Context) (*dto.AdminStatsResponse, error) {
	userCount, err := s.userRepo.CountUsers(ctx)
	if err != nil {
		return nil, err
	}

	examCount, err := s.examRepo.CountExams(ctx)
	if err != nil {
		return nil, err
	}

	questionCount, err := s.examRepo.CountQuestions(ctx)
	if err != nil {
		return nil, err
	}

	return &dto.AdminStatsResponse{
		TotalUsers:     userCount,
		TotalExams:     examCount,
		TotalQuestions: questionCount,
	}, nil
}

func (s *UserServiceImpl) GetUserWeakTopics(ctx context.Context, clerkID string) ([]*domain.UserWeakTopic, error) {
	user, err := s.userRepo.FindByClerkID(ctx, clerkID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("user not found")
	}

	return s.examRepo.GetUserWeakTopics(ctx, user.ID)
}

func (s *UserServiceImpl) GetUserAIContext(ctx context.Context, userID string) (*domain.UserAIContext, error) {
	return s.userRepo.FindAIContextByUserID(ctx, userID)
}
