package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Role represents user roles in the system
type Role string

const (
	RoleAdmin Role = "ADMIN"
	RoleUser  Role = "USER"
)

// User represents the user domain model
type User struct {
	ID         string          `json:"id" gorm:"type:uuid;primaryKey"`
	Email      string          `json:"email" gorm:"uniqueIndex;not null"`
	Password   string          `json:"-" gorm:"column:password;not null"`
	FirstName  *string         `json:"firstName,omitempty" gorm:"column:first_name"`
	LastName   *string         `json:"lastName,omitempty" gorm:"column:last_name"`
	ImageURL   *string         `json:"imageUrl,omitempty" gorm:"column:image_url"`
	Role       Role            `json:"role" gorm:"type:varchar(20);default:'USER'"`
	CreatedAt  time.Time       `json:"createdAt" gorm:"column:created_at"`
	UpdatedAt  time.Time       `json:"updatedAt" gorm:"column:updated_at"`
	Preference *UserPreference `json:"preference,omitempty" gorm:"foreignKey:UserID"`
}

// TableName specifies the table name for GORM
func (User) TableName() string {
	return "users"
}

// BeforeCreate hook to generate UUID before creating
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	return nil
}

// IsAdmin checks if the user has admin role
func (u *User) IsAdmin() bool {
	return u.Role == RoleAdmin
}

// FullName returns the user's full name
func (u *User) FullName() string {
	firstName := ""
	lastName := ""
	if u.FirstName != nil {
		firstName = *u.FirstName
	}
	if u.LastName != nil {
		lastName = *u.LastName
	}
	if firstName == "" && lastName == "" {
		return u.Email
	}
	return firstName + " " + lastName
}
