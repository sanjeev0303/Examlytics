package domain

import (
	"time"
)

// UserAIContext stores per-user adaptive AI context as JSONB
// Used for topic prioritization, difficulty tuning, and question style
type UserAIContext struct {
	UserID      string    `json:"userId" gorm:"type:uuid;primaryKey"`
	ContextData []byte    `json:"contextData" gorm:"type:jsonb;not null;default:'{}'"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (UserAIContext) TableName() string {
	return "user_ai_contexts"
}
