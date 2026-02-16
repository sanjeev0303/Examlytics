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

	logger.Infof("Processing Exam Job: %s for User: %s", job.JobID, job.UserID)

	// Call strict internal generation logic
	session, err := w.examService.GenerateExamSync(ctx, job.UserID, job.Request)
	if err != nil {
		if err.Error() == "user not found" {
			// Silently ignore jobs for deleted users
			logger.Warnf("Skipping job %s for missing user %s", job.JobID, job.UserID)
			w.updateStatus(ctx, job.JobID, dto.JobStatusFailed, "", "user not found")
			return
		}
		logger.Error(err, fmt.Sprintf("Job %s Failed", job.JobID))
		w.updateStatus(ctx, job.JobID, dto.JobStatusFailed, "", err.Error())
		return
	}

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

	result, err := w.examService.SubmitExamSync(ctx, job.UserID, job.Request)
	if err != nil {
		logger.Error(err, fmt.Sprintf("Submission Job %s Failed", job.JobID))
		w.updateStatus(ctx, job.JobID, dto.JobStatusFailed, "", err.Error())
		return
	}

	// Store result for polling
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
