package worker

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/examlytics/server/internal/adapter/redis"
	"github.com/examlytics/server/internal/dto"
	"github.com/examlytics/server/internal/service"
	"github.com/examlytics/server/pkg/logger"
)

type ExamWorker struct {
	redisClient *redis.RedisClient
	examService service.ExamService
	stop        chan struct{}
}

func NewExamWorker(redisClient *redis.RedisClient, examService service.ExamService) *ExamWorker {
	return &ExamWorker{
		redisClient: redisClient,
		examService: examService,
		stop:        make(chan struct{}),
	}
}

func (w *ExamWorker) Start() {
	go func() {
		logger.Info("Starting Exam Worker...")
		for {
			select {
			case <-w.stop:
				return
			default:
				w.processNextJob()
			}
		}
	}()

	// Start Submission Worker
	go func() {
		logger.Info("Starting Submission Worker...")
		for {
			select {
			case <-w.stop:
				return
			default:
				w.processNextSubmissionJob()
			}
		}
	}()
}

func (w *ExamWorker) Stop() {
	close(w.stop)
}

func (w *ExamWorker) processNextJob() {
	// Blocking pop with 5 second timeout
	ctx := context.Background()
	val, err := w.redisClient.Dequeue(ctx, "queue:exam_generation", 5*time.Second)
	if err != nil {
		// Timeout or error, just continue
		if err.Error() != "redis: nil" {
			// Log typically if it's not just a timeout
		}
		return
	}

	var job dto.ExamGenerationJob
	if err := json.Unmarshal([]byte(val), &job); err != nil {
		logger.Error(err, "Failed to unmarshal job")
		return
	}

	w.updateStatus(ctx, job.JobID, dto.JobStatusProcessing, "", "")

	logger.Infof("Processing Exam Job: %s for User: %s", job.JobID, job.ClerkID)

	// Call strict internal generation logic
	// We need to verify if we can access the creation logic.
	// Since we are inside the same package structure (but different package), we need a public method on Service
	// that performs the logic but doesn't push to Redis.
	// We will assume `GenerateExamSync` exists on the interface or implementation.
	// For now, we cast to implementation or add to interface.
	// Let's add `GenerateExamSync` to the interface later.

	session, err := w.examService.GenerateExamSync(ctx, job.ClerkID, job.Request)
	if err != nil {
		if err.Error() == "user not found" {
			// Silently ignore jobs for deleted users
			logger.Warnf("Skipping job %s for missing user %s", job.JobID, job.ClerkID)
			w.updateStatus(ctx, job.JobID, dto.JobStatusFailed, "", "user not found")
			return
		}
		logger.Error(err, fmt.Sprintf("Job %s Failed", job.JobID))
		w.updateStatus(ctx, job.JobID, dto.JobStatusFailed, "", err.Error())
		return
	}

	logger.Infof("Job %s Completed. Session: %s", job.JobID, session.ID)
	w.updateStatus(ctx, job.JobID, dto.JobStatusCompleted, session.ID, "")
	logger.Infof("Job %s Completed. Session: %s", job.JobID, session.ID)
	w.updateStatus(ctx, job.JobID, dto.JobStatusCompleted, session.ID, "")
}

func (w *ExamWorker) processNextSubmissionJob() {
	ctx := context.Background()
	val, err := w.redisClient.Dequeue(ctx, "queue:exam_submission", 5*time.Second)
	if err != nil {
		return
	}

	var job dto.ExamSubmissionJob
	if err := json.Unmarshal([]byte(val), &job); err != nil {
		logger.Error(err, "Failed to unmarshal submission job")
		return
	}

	w.updateStatus(ctx, job.JobID, dto.JobStatusProcessing, "", "")
	logger.Infof("Processing Submission Job: %s", job.JobID)

	result, err := w.examService.SubmitExamSync(ctx, job.ClerkID, job.Request)
	if err != nil {
		logger.Error(err, fmt.Sprintf("Submission Job %s Failed", job.JobID))
		w.updateStatus(ctx, job.JobID, dto.JobStatusFailed, "", err.Error())
		return
	}

	// Store result for polling
	// We can store the full result in the status "Result" field if we add it,
	// OR store it in a separate key "result:{jobID}"
	// For now, let's assume the frontend will fetch the SESSION again using sessionID
	// But `Start` returns `SessionID`. `Submit` returns `ExamResultResponse` which contains `ImprovementRecommendation` etc.
	// The `ExamResultResponse` IS the session details mostly.
	// So pointing to `result.SessionID` in status is enough?
	// The frontend polls status, sees COMPLETED, then calls GetSession(sessionID).
	// `SubmitExamSync` returns `*dto.ExamResultResponse`.
	// We should probably save this result or rely on `GetSession` being refined to return result.
	// `GetExamSession` already returns `ExamSessionResponse` which includes score, etc.
	// So we just need to link the session ID.

	w.updateStatus(ctx, job.JobID, dto.JobStatusCompleted, result.SessionID, "")
}

func (w *ExamWorker) updateStatus(ctx context.Context, jobID, status, sessionID, errorMsg string) {
	s := dto.ExamGenerationStatus{
		JobID:     jobID,
		Status:    status,
		SessionID: sessionID,
		Error:     errorMsg,
	}

	bytes, _ := json.Marshal(s)
	// Expire status after 1 hour
	w.redisClient.Set(ctx, "job:"+jobID, bytes, 1*time.Hour)
}
