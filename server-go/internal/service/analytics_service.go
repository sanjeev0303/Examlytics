package service

import (
	"context"
	"math"
	"time"

	"github.com/examlytics/server/internal/domain"
	"github.com/examlytics/server/internal/dto"
	"github.com/examlytics/server/internal/repository"
	"github.com/examlytics/server/pkg/logger"
)

// AnalyticsService provides analytics and learning intelligence features
type AnalyticsService interface {
	// Learning Curves
	GetLearningCurve(ctx context.Context, userID string) (*dto.LearningCurveResponse, error)
	GetTopicCurve(ctx context.Context, userID, topic string) (*dto.TopicCurveResponse, error)
	RecordSnapshot(ctx context.Context, snapshot *domain.LearningSnapshot) error

	// Interview Readiness
	GetInterviewReadiness(ctx context.Context, userID string) (*dto.InterviewReadinessResponse, error)
	RecalculateReadiness(ctx context.Context, userID string) error

	// Spaced Repetition
	GetDueTopics(ctx context.Context, userID string) (*dto.SpacedRepetitionResponse, error)
	UpdateTopicSchedule(ctx context.Context, userID, topic string, masteryScore float64) error

	// Question Calibration
	UpdateQuestionStats(ctx context.Context, questionText, topic, originalDifficulty string, isCorrect bool, confidence float64, timeSpent int) error
}

type analyticsServiceImpl struct {
	analyticsRepo repository.AnalyticsRepository
	examRepo      repository.ExamRepository
	userRepo      repository.UserRepository
}

func NewAnalyticsService(
	analyticsRepo repository.AnalyticsRepository,
	examRepo repository.ExamRepository,
	userRepo repository.UserRepository,
) AnalyticsService {
	return &analyticsServiceImpl{
		analyticsRepo: analyticsRepo,
		examRepo:      examRepo,
		userRepo:      userRepo,
	}
}

// GetLearningCurve returns time-series data for learning curve visualization
func (s *analyticsServiceImpl) GetLearningCurve(ctx context.Context, userID string) (*dto.LearningCurveResponse, error) {
	snapshots, err := s.analyticsRepo.GetUserSnapshots(ctx, userID, 30) // Last 30 entries
	if err != nil {
		return nil, err
	}

	// Reverse to chronological order
	for i, j := 0, len(snapshots)-1; i < j; i, j = i+1, j-1 {
		snapshots[i], snapshots[j] = snapshots[j], snapshots[i]
	}

	response := &dto.LearningCurveResponse{
		Labels: make([]string, len(snapshots)),
		Datasets: dto.LearningCurveDatasets{
			OverallScore: make([]float64, len(snapshots)),
			Accuracy:     make([]float64, len(snapshots)),
			Confidence:   make([]float64, len(snapshots)),
		},
	}

	for i, snap := range snapshots {
		response.Labels[i] = snap.Timestamp.Format("Jan 2")
		response.Datasets.OverallScore[i] = snap.OverallScore
		response.Datasets.Accuracy[i] = snap.Accuracy
		response.Datasets.Confidence[i] = snap.AvgConfidence
	}

	return response, nil
}

// GetTopicCurve returns mastery progression for a specific topic
func (s *analyticsServiceImpl) GetTopicCurve(ctx context.Context, userID, topic string) (*dto.TopicCurveResponse, error) {
	history, err := s.analyticsRepo.GetTopicHistory(ctx, userID, topic, 30)
	if err != nil {
		return nil, err
	}

	// Reverse to chronological order
	for i, j := 0, len(history)-1; i < j; i, j = i+1, j-1 {
		history[i], history[j] = history[j], history[i]
	}

	response := &dto.TopicCurveResponse{
		Topic:   topic,
		Labels:  make([]string, len(history)),
		Mastery: make([]float64, len(history)),
	}

	for i, h := range history {
		response.Labels[i] = h.Date.Format("Jan 2")
		response.Mastery[i] = h.MasteryScore
	}

	return response, nil
}

// RecordSnapshot saves a learning snapshot after exam completion
func (s *analyticsServiceImpl) RecordSnapshot(ctx context.Context, snapshot *domain.LearningSnapshot) error {
	return s.analyticsRepo.CreateSnapshot(ctx, snapshot)
}

// GetInterviewReadiness returns the current IRS for a user
func (s *analyticsServiceImpl) GetInterviewReadiness(ctx context.Context, userID string) (*dto.InterviewReadinessResponse, error) {
	readiness, err := s.analyticsRepo.GetInterviewReadiness(ctx, userID)
	if err != nil {
		return nil, err
	}

	if readiness == nil {
		// No data yet, return default
		return &dto.InterviewReadinessResponse{
			Score:          0,
			Status:         "Not Ready",
			Recommendation: "Complete some exams to get your interview readiness score.",
			Breakdown:      dto.IRSBreakdown{},
			LastCalculated: time.Time{},
		}, nil
	}

	return &dto.InterviewReadinessResponse{
		Score:          readiness.Score,
		Status:         readiness.Status,
		Recommendation: domain.GetReadinessRecommendation(readiness.Status),
		Breakdown: dto.IRSBreakdown{
			TopicMasteryAvg:  readiness.TopicMasteryAvg,
			ConsistencyScore: readiness.ConsistencyScore,
			ConfidenceScore:  readiness.ConfidenceScore,
			DifficultyFactor: readiness.DifficultyFactor,
			SpeedFactor:      readiness.SpeedFactor,
		},
		LastCalculated: readiness.LastCalculated,
	}, nil
}

// RecalculateReadiness computes and stores IRS for a user
// Formula: 40% topic mastery + 25% consistency + 15% confidence + 10% difficulty + 10% speed
func (s *analyticsServiceImpl) RecalculateReadiness(ctx context.Context, userID string) error {
	// 1. Get topic mastery average
	aggregates, err := s.userRepo.GetTopicAggregates(ctx, userID)
	if err != nil {
		logger.Warnf("Failed to get topic aggregates for IRS: %v", err)
	}

	var topicMasteryAvg, avgConfidence float64
	if len(aggregates) > 0 {
		var totalMastery, totalConfidence float64
		for _, agg := range aggregates {
			totalMastery += agg.MasteryScore
			totalConfidence += agg.AvgConfidence
		}
		topicMasteryAvg = totalMastery / float64(len(aggregates))
		avgConfidence = totalConfidence / float64(len(aggregates))
	}

	// 2. Get last 5 exams for consistency
	snapshots, err := s.analyticsRepo.GetUserSnapshots(ctx, userID, 5)
	if err != nil {
		logger.Warnf("Failed to get snapshots for IRS: %v", err)
	}

	var consistencyScore float64 = 50 // Default
	if len(snapshots) >= 2 {
		// Calculate standard deviation of scores
		var sum, sumSquares float64
		for _, snap := range snapshots {
			sum += snap.OverallScore
			sumSquares += snap.OverallScore * snap.OverallScore
		}
		mean := sum / float64(len(snapshots))
		variance := (sumSquares / float64(len(snapshots))) - (mean * mean)
		stdDev := math.Sqrt(variance)

		// Lower std dev = higher consistency
		// Map stdDev to 0-100 (stdDev of 0 = 100, stdDev of 30+ = 0)
		consistencyScore = math.Max(0, 100-(stdDev*3.33))
	}

	// 3. Difficulty factor (placeholder - needs session data with difficulty tracking)
	difficultyFactor := 50.0 // TODO: Calculate from hard questions answered correctly

	// 4. Speed factor (placeholder)
	speedFactor := 50.0 // TODO: Calculate from actual/expected time ratios

	// Calculate final IRS
	irs := 0.40*topicMasteryAvg +
		0.25*consistencyScore +
		0.15*(avgConfidence*100) +
		0.10*difficultyFactor +
		0.10*speedFactor

	status := domain.GetReadinessStatus(irs)

	readiness := &domain.InterviewReadiness{
		UserID:           userID,
		Score:            irs,
		Status:           status,
		TopicMasteryAvg:  topicMasteryAvg,
		ConsistencyScore: consistencyScore,
		ConfidenceScore:  avgConfidence * 100,
		DifficultyFactor: difficultyFactor,
		SpeedFactor:      speedFactor,
		LastCalculated:   time.Now(),
	}

	return s.analyticsRepo.UpsertInterviewReadiness(ctx, readiness)
}

// GetDueTopics returns topics due for spaced repetition review
func (s *analyticsServiceImpl) GetDueTopics(ctx context.Context, userID string) (*dto.SpacedRepetitionResponse, error) {
	schedules, err := s.analyticsRepo.GetDueTopics(ctx, userID)
	if err != nil {
		return nil, err
	}

	dueTopics := make([]dto.DueTopic, len(schedules))
	for i, sched := range schedules {
		daysSince := int(time.Since(sched.LastReviewDate).Hours() / 24)
		priority := "LOW"
		if sched.MasteryScore < 40 {
			priority = "HIGH"
		} else if sched.MasteryScore < 60 {
			priority = "MEDIUM"
		}

		dueTopics[i] = dto.DueTopic{
			Topic:         sched.Topic,
			MasteryScore:  sched.MasteryScore,
			DaysSinceLast: daysSince,
			Priority:      priority,
		}
	}

	recommendation := "Great! No topics due for review."
	if len(dueTopics) > 0 {
		recommendation = "Focus on high-priority topics first for optimal retention."
	}

	return &dto.SpacedRepetitionResponse{
		DueTopics:          dueTopics,
		TotalDue:           len(dueTopics),
		NextRecommendation: recommendation,
	}, nil
}

// UpdateTopicSchedule updates the spaced repetition schedule for a topic
func (s *analyticsServiceImpl) UpdateTopicSchedule(ctx context.Context, userID, topic string, masteryScore float64) error {
	schedule := &domain.UserTopicSchedule{
		UserID:       userID,
		Topic:        topic,
		MasteryScore: masteryScore,
	}
	schedule.CalculateNextReview()

	return s.analyticsRepo.UpsertTopicSchedule(ctx, schedule)
}

// UpdateQuestionStats updates calibration stats for a question
func (s *analyticsServiceImpl) UpdateQuestionStats(ctx context.Context, questionText, topic, originalDifficulty string, isCorrect bool, confidence float64, timeSpent int) error {
	hash := domain.HashQuestion(questionText)

	existing, err := s.analyticsRepo.GetQuestionStats(ctx, hash)
	if err != nil {
		return err
	}

	if existing == nil {
		existing = &domain.QuestionStats{
			QuestionHash:       hash,
			Topic:              topic,
			OriginalDifficulty: originalDifficulty,
			ExpectedTime:       60, // Default 60 seconds
		}
	}

	existing.AttemptCount++
	if isCorrect {
		existing.CorrectCount++
	}
	existing.TotalConfidence += confidence
	existing.TotalTimeSpent += float64(timeSpent)

	existing.CalibrateDifficulty()

	return s.analyticsRepo.UpsertQuestionStats(ctx, existing)
}
