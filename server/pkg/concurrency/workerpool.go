package concurrency

import (
	"context"
	"sync"
	"sync/atomic"
	"time"
)

// Job represents a unit of work for the worker pool.
type Job func(ctx context.Context) error

// WorkerPool manages a fixed pool of goroutines for processing jobs.
type WorkerPool struct {
	workers    int
	jobQueue   chan jobWrapper
	wg         sync.WaitGroup
	ctx        context.Context
	cancel     context.CancelFunc
	running    int32
	processed  uint64
	failed     uint64
	queueDepth int32
}

type jobWrapper struct {
	job     Job
	ctx     context.Context
	errChan chan error
}

// NewWorkerPool creates a new worker pool with the specified number of workers
// and queue capacity.
func NewWorkerPool(workers, queueSize int) *WorkerPool {
	ctx, cancel := context.WithCancel(context.Background())
	wp := &WorkerPool{
		workers:  workers,
		jobQueue: make(chan jobWrapper, queueSize),
		ctx:      ctx,
		cancel:   cancel,
	}
	return wp
}

// Start begins processing jobs with the worker pool.
func (wp *WorkerPool) Start() {
	for i := 0; i < wp.workers; i++ {
		wp.wg.Add(1)
		go wp.worker()
	}
	atomic.StoreInt32(&wp.running, 1)
}

func (wp *WorkerPool) worker() {
	defer wp.wg.Done()

	for {
		select {
		case <-wp.ctx.Done():
			return
		case job, ok := <-wp.jobQueue:
			if !ok {
				return
			}
			atomic.AddInt32(&wp.queueDepth, -1)

			err := wp.executeJob(job)
			if err != nil {
				atomic.AddUint64(&wp.failed, 1)
			} else {
				atomic.AddUint64(&wp.processed, 1)
			}

			if job.errChan != nil {
				job.errChan <- err
				close(job.errChan)
			}
		}
	}
}

func (wp *WorkerPool) executeJob(jw jobWrapper) (err error) {
	defer func() {
		if r := recover(); r != nil {
			err = &PanicError{Value: r}
		}
	}()

	// Create merged context that respects both pool shutdown and job context
	ctx := jw.ctx
	if ctx == nil {
		ctx = wp.ctx
	}

	return jw.job(ctx)
}

// Submit enqueues a job for processing. Returns error if pool is stopped
// or queue is full.
func (wp *WorkerPool) Submit(ctx context.Context, job Job) error {
	if atomic.LoadInt32(&wp.running) == 0 {
		return ErrPoolStopped
	}

	jw := jobWrapper{
		job: job,
		ctx: ctx,
	}

	select {
	case wp.jobQueue <- jw:
		atomic.AddInt32(&wp.queueDepth, 1)
		return nil
	default:
		return ErrQueueFull
	}
}

// SubmitWait enqueues a job and waits for its completion.
func (wp *WorkerPool) SubmitWait(ctx context.Context, job Job) error {
	if atomic.LoadInt32(&wp.running) == 0 {
		return ErrPoolStopped
	}

	errChan := make(chan error, 1)
	jw := jobWrapper{
		job:     job,
		ctx:     ctx,
		errChan: errChan,
	}

	select {
	case wp.jobQueue <- jw:
		atomic.AddInt32(&wp.queueDepth, 1)
	case <-ctx.Done():
		return ctx.Err()
	default:
		return ErrQueueFull
	}

	select {
	case err := <-errChan:
		return err
	case <-ctx.Done():
		return ctx.Err()
	}
}

// Stop gracefully shuts down the worker pool.
func (wp *WorkerPool) Stop() {
	atomic.StoreInt32(&wp.running, 0)
	wp.cancel()
	close(wp.jobQueue)
	wp.wg.Wait()
}

// StopWithTimeout attempts graceful shutdown within timeout.
func (wp *WorkerPool) StopWithTimeout(timeout time.Duration) bool {
	atomic.StoreInt32(&wp.running, 0)
	wp.cancel()
	close(wp.jobQueue)

	done := make(chan struct{})
	go func() {
		wp.wg.Wait()
		close(done)
	}()

	select {
	case <-done:
		return true
	case <-time.After(timeout):
		return false
	}
}

// WorkerPoolStats contains pool statistics for observability.
type WorkerPoolStats struct {
	Workers    int
	QueueDepth int32
	Processed  uint64
	Failed     uint64
	Running    bool
}

// Stats returns current pool statistics.
func (wp *WorkerPool) Stats() WorkerPoolStats {
	return WorkerPoolStats{
		Workers:    wp.workers,
		QueueDepth: atomic.LoadInt32(&wp.queueDepth),
		Processed:  atomic.LoadUint64(&wp.processed),
		Failed:     atomic.LoadUint64(&wp.failed),
		Running:    atomic.LoadInt32(&wp.running) == 1,
	}
}

// PanicError wraps a panic value.
type PanicError struct {
	Value interface{}
}

func (e *PanicError) Error() string {
	return "worker panic recovered"
}
