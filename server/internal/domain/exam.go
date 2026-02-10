package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Exam represents a pre-defined or generated exam template
type Exam struct {
	ID          string     `json:"id" gorm:"type:uuid;primaryKey"`
	Title       string     `json:"title" gorm:"not null"`
	Description string     `json:"description"`
	Duration    int        `json:"duration"` // In minutes
	Difficulty  Difficulty `json:"difficulty" gorm:"type:varchar(10)"`
	Type        string     `json:"type" gorm:"type:varchar(20)"` // JOB, CODING, etc.
	IsPublic    bool       `json:"isPublic" gorm:"default:false"`
	CreatedBy   *uuid.UUID `json:"createdBy" gorm:"type:uuid"` // Admin or User ID
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

func (Exam) TableName() string {
	return "exams"
}

func (e *Exam) BeforeCreate(tx *gorm.DB) error {
	if e.ID == "" {
		e.ID = uuid.New().String()
	}
	return nil
}

// ExamRepository defines methods to interact with exams
type ExamRepository interface {
	Create(exam *Exam) error
	FindByID(id string) (*Exam, error)
	ListPublic(limit, offset int, types []string) ([]*Exam, error)
	GetAttendedExamTypes(userID string) ([]string, error)
}
