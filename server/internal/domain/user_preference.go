package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

// UserPreference stores user onboarding choices
type UserPreference struct {
	ID        string         `json:"id" gorm:"type:uuid;primaryKey"`
	UserID    string         `json:"userId" gorm:"type:uuid;uniqueIndex;not null"`
	Goal      string         `json:"goal" gorm:"type:varchar(50)"`
	ExamTypes pq.StringArray `json:"examTypes" gorm:"type:text[]"` // Postgres array
	CreatedAt time.Time      `json:"createdAt" gorm:"column:created_at"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"column:updated_at"`
}

func (UserPreference) TableName() string {
	return "user_preferences"
}

func (up *UserPreference) BeforeCreate(tx *gorm.DB) error {
	if up.ID == "" {
		up.ID = uuid.New().String()
	}
	return nil
}
