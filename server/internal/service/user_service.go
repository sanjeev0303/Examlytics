package service

import (
	"context"
	"errors"

	"github.com/examlytics/server/internal/domain"
	"github.com/examlytics/server/internal/dto"
	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

// UserService defines the interface for user business logic
type UserService interface {
	CreateUser(ctx context.Context, data *dto.CreateUserRequest) (*domain.User, error)
	Login(ctx context.Context, email, password string) (*domain.User, error)
	GetUserProfile(ctx context.Context, userID string) (*domain.User, error)
	GetUsers(ctx context.Context) ([]*domain.User, error)
	OnboardUser(ctx context.Context, userID string, req dto.OnboardingRequest) error
	GetAdminStats(ctx context.Context) (*dto.AdminStatsResponse, error)
	GetUserWeakTopics(ctx context.Context, userID string) ([]*domain.UserWeakTopic, error)
	GetUserAIContext(ctx context.Context, userID string) (*domain.UserAIContext, error)
}

// UserServiceImpl implements UserService
type UserServiceImpl struct {
	userRepo domain.UserRepository
	examRepo domain.ExamRepository
}

// NewUserService creates a new UserServiceImpl
func NewUserService(userRepo domain.UserRepository, examRepo domain.ExamRepository) UserService {
	return &UserServiceImpl{userRepo: userRepo, examRepo: examRepo}
}

// CreateUser creates a new user
func (s *UserServiceImpl) CreateUser(ctx context.Context, data *dto.CreateUserRequest) (*domain.User, error) {
	// Check if user already exists
	existingUser, _ := s.userRepo.GetByEmail(ctx, data.Email)
	if existingUser != nil {
		return nil, errors.New("user already exists")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(data.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &domain.User{
		Email:     data.Email,
		Password:  string(hashedPassword),
		FirstName: data.FirstName,
		LastName:  data.LastName,
		ImageURL:  data.ImageURL,
		Role:      domain.RoleUser,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

// Login authenticates a user
func (s *UserServiceImpl) Login(ctx context.Context, email, password string) (*domain.User, error) {
	user, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("invalid credentials")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	return user, nil
}

// GetUserProfile retrieves user profile by ID
func (s *UserServiceImpl) GetUserProfile(ctx context.Context, userID string) (*domain.User, error) {
	return s.userRepo.GetByID(ctx, userID)
}

// GetUsers retrieves all users
func (s *UserServiceImpl) GetUsers(ctx context.Context) ([]*domain.User, error) {
	return s.userRepo.FindAll(ctx)
}

// OnboardUser saves user preferences
func (s *UserServiceImpl) OnboardUser(ctx context.Context, userID string, req dto.OnboardingRequest) error {
	// Find user first
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("user not found")
	}

	prefs := &domain.UserPreference{
		UserID:    user.ID,
		Goal:      req.TargetGoal,
		ExamTypes: pq.StringArray(req.PreferredTopics), // Mapping topics to ExamTypes as requested in PRD
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

func (s *UserServiceImpl) GetUserWeakTopics(ctx context.Context, userID string) ([]*domain.UserWeakTopic, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
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
