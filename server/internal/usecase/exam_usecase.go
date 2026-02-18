package usecase

import (
	"context"
	"errors"
	"time"

	"github.com/examlytics/server/internal/domain"
	"github.com/google/uuid"
)

type ExamUseCase struct {
	examRepo domain.ExamRepository
	aiClient domain.AIProvider
}

func NewExamUseCase(examRepo domain.ExamRepository, aiClient domain.AIProvider) *ExamUseCase {
	return &ExamUseCase{
		examRepo: examRepo,
		aiClient: aiClient,
	}
}

func (uc *ExamUseCase) CreateExam(ctx context.Context, userID string, topic string, difficulty string, count int) (*domain.Exam, error) {
	// Call AI service to generate questions (mock or real)
	questions, err := uc.aiClient.GenerateQuestions(ctx, topic, count, difficulty)
	if err != nil {
		return nil, err
	}

	// Transform domain.Question to []*domain.Question if needed
	var qPtrs []*domain.Question
	for i := range questions {
		qPtrs = append(qPtrs, &questions[i])
	}

	exam := &domain.Exam{
		ID:         uuid.New().String(),
		UserID:     userID,
		Type:       "JOB",
		Difficulty: domain.Difficulty(difficulty),
		Status:     "PENDING",
		CreatedAt:  time.Now(),
		Questions:  qPtrs,
	}

	if err := uc.examRepo.Create(ctx, exam); err != nil {
		return nil, err
	}

	return exam, nil
}

func (uc *ExamUseCase) SubmitExam(ctx context.Context, examID string, responses []domain.Response) (*domain.ExamAttempt, error) {
	exam, err := uc.examRepo.GetByID(ctx, examID)
	if err != nil {
		return nil, err
	}

	if exam.Status == "COMPLETED" {
		return nil, errors.New("exam already submitted")
	}

	correctCount := 0
	score := 0.0

	// Basic grading logic
	for i, resp := range responses {
		for _, q := range exam.Questions {
			if q.ID == resp.QuestionID {
				if q.CorrectAnswer == resp.Answer {
					correctCount++
					responses[i].IsCorrect = true
				}
				break
			}
		}
	}

	if len(exam.Questions) > 0 {
		accuracy := float64(correctCount) / float64(len(exam.Questions))
		score = accuracy * 100
	}

	attempt := &domain.ExamAttempt{
		ID:        uuid.New().String(),
		ExamID:    examID,
		UserID:    exam.UserID,
		Responses: responses,
		Score:     score,
		Accuracy:  float64(correctCount) / float64(len(exam.Questions)),
		StartedAt: exam.CreatedAt,
		EndedAt:   time.Now(),
	}

	// Update exam status
	completedAt := time.Now()
	exam.Status = "COMPLETED"
	exam.CompletedAt = &completedAt
	exam.Score = score

	if err := uc.examRepo.Update(ctx, exam); err != nil {
		return nil, err
	}

	return attempt, nil
}
