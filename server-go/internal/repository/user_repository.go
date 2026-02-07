package repository

import (
	"context"
	"errors"

	"github.com/examlytics/server/internal/domain"
	"github.com/examlytics/server/internal/dto"
	"gorm.io/gorm"
)

// UserRepository defines interface for user data access
type UserRepository interface {
	Create(ctx context.Context, data *dto.CreateUserRequest) (*domain.User, error)
	FindAll(ctx context.Context) ([]*domain.User, error)
	FindByID(ctx context.Context, id string) (*domain.User, error)
	FindByClerkID(ctx context.Context, clerkID string) (*domain.User, error)
	FindByEmail(ctx context.Context, email string) (*domain.User, error)
	UpsertByClerkID(ctx context.Context, data *dto.CreateUserRequest) (*domain.User, error)
	Update(ctx context.Context, user *domain.User) (*domain.User, error)
	Delete(ctx context.Context, id string) error
	SavePreferences(ctx context.Context, prefs *domain.UserPreference) error
	GetPreferences(ctx context.Context, userID string) (*domain.UserPreference, error)
	CountUsers(ctx context.Context) (int64, error)
	FindAIContextByUserID(ctx context.Context, userID string) (*domain.UserAIContext, error)
	GetTopicAggregates(ctx context.Context, userID string) ([]*domain.UserTopicAggregate, error)
}

// PostgresUserRepository implements UserRepository for PostgreSQL
type PostgresUserRepository struct {
	db *gorm.DB
}

// NewPostgresUserRepository creates a new PostgresUserRepository
func NewPostgresUserRepository(db *gorm.DB) UserRepository {
	return &PostgresUserRepository{db: db}
}

// Create creates a new user in the database
func (r *PostgresUserRepository) Create(ctx context.Context, data *dto.CreateUserRequest) (*domain.User, error) {
	user := &domain.User{
		ClerkID:   data.ClerkID,
		Email:     data.Email,
		FirstName: data.FirstName,
		LastName:  data.LastName,
		ImageURL:  data.ImageURL,
		Role:      domain.RoleUser,
	}

	if err := r.db.WithContext(ctx).Create(user).Error; err != nil {
		return nil, err
	}

	return user, nil
}

// FindAll retrieves all users from the database
func (r *PostgresUserRepository) FindAll(ctx context.Context) ([]*domain.User, error) {
	var users []*domain.User
	if err := r.db.WithContext(ctx).Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

// FindByID retrieves a user by their ID
func (r *PostgresUserRepository) FindByID(ctx context.Context, id string) (*domain.User, error) {
	var user domain.User
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// FindByClerkID retrieves a user by their Clerk ID
func (r *PostgresUserRepository) FindByClerkID(ctx context.Context, clerkID string) (*domain.User, error) {
	var user domain.User
	if err := r.db.WithContext(ctx).Where("clerk_id = ?", clerkID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// FindByEmail retrieves a user by their email
func (r *PostgresUserRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	var user domain.User
	if err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// UpsertByClerkID creates or updates a user based on their Clerk ID
func (r *PostgresUserRepository) UpsertByClerkID(ctx context.Context, data *dto.CreateUserRequest) (*domain.User, error) {
	var user domain.User

	err := r.db.WithContext(ctx).Where("clerk_id = ?", data.ClerkID).First(&user).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		newUser := &domain.User{
			ClerkID:   data.ClerkID,
			Email:     data.Email,
			FirstName: data.FirstName,
			LastName:  data.LastName,
			ImageURL:  data.ImageURL,
			Role:      domain.RoleUser,
		}
		if err := r.db.WithContext(ctx).Create(newUser).Error; err != nil {
			return nil, err
		}
		return newUser, nil
	}

	if err != nil {
		return nil, err
	}

	user.Email = data.Email
	user.FirstName = data.FirstName
	user.LastName = data.LastName
	user.ImageURL = data.ImageURL

	if err := r.db.WithContext(ctx).Save(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

// Update updates an existing user
func (r *PostgresUserRepository) Update(ctx context.Context, user *domain.User) (*domain.User, error) {
	if err := r.db.WithContext(ctx).Save(user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

// Delete removes a user from the database
func (r *PostgresUserRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Where("id = ?", id).Delete(&domain.User{}).Error
}

// SavePreferences saves user onboarding preferences
func (r *PostgresUserRepository) SavePreferences(ctx context.Context, prefs *domain.UserPreference) error {
	// GORM Save will update if primary key exists, or insert if not.
	// But ID might be empty if new.
	// If UserID is unique, we should check availability first or use FirstOrCreate/Where logic.
	// Let's assume ID is provided or GORM handles UUID generation in BeforeCreate if ID empty.
	// If we want to upsert based on UserID:
	var existing domain.UserPreference
	err := r.db.Where("user_id = ?", prefs.UserID).First(&existing).Error
	if err == nil {
		// Update existing
		prefs.ID = existing.ID
		return r.db.Save(prefs).Error
	}
	// Create new
	return r.db.Create(prefs).Error
}

// GetPreferences retrieves user preferences
func (r *PostgresUserRepository) GetPreferences(ctx context.Context, userID string) (*domain.UserPreference, error) {
	var prefs domain.UserPreference
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).First(&prefs).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // Return nil if no preferences found
		}
		return nil, err
	}
	return &prefs, nil
}

// CountUsers returns the total count of users
func (r *PostgresUserRepository) CountUsers(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&domain.User{}).Count(&count).Error
	return count, err
}

// FindAIContextByUserID retrieves the AI context for a user
func (r *PostgresUserRepository) FindAIContextByUserID(ctx context.Context, userID string) (*domain.UserAIContext, error) {
	var context domain.UserAIContext
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).First(&context).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &context, nil
}

// GetTopicAggregates retrieves all topic aggregates for a user
func (r *PostgresUserRepository) GetTopicAggregates(ctx context.Context, userID string) ([]*domain.UserTopicAggregate, error) {
	var aggregates []*domain.UserTopicAggregate
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&aggregates).Error; err != nil {
		return nil, err
	}
	return aggregates, nil
}
