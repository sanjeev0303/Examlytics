package concurrency

import (
	"context"
	"sync"
	"sync/atomic"
	"time"
)

// Semaphore provides weighted semaphore for admission control.
// Unlike golang.org/x/sync/semaphore, this tracks inflight count for metrics.
type Semaphore struct {
	max      int64
	current  int64
	waiting  int64
	mu       sync.Mutex
	cond     *sync.Cond
	closed   bool
	rejected uint64 // atomic counter for rejected requests
}

// NewSemaphore creates a new semaphore with the given max capacity.
func NewSemaphore(max int) *Semaphore {
	s := &Semaphore{
		max: int64(max),
	}
	s.cond = sync.NewCond(&s.mu)
	return s
}

// TryAcquire attempts to acquire without blocking.
// Returns true if acquired, false if at capacity.
func (s *Semaphore) TryAcquire() bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.closed {
		return false
	}

	if s.current >= s.max {
		atomic.AddUint64(&s.rejected, 1)
		return false
	}

	s.current++
	return true
}

// Acquire blocks until a slot is available or context is cancelled.
func (s *Semaphore) Acquire(ctx context.Context) error {
	s.mu.Lock()

	if s.closed {
		s.mu.Unlock()
		return context.Canceled
	}

	// Fast path: slot available
	if s.current < s.max {
		s.current++
		s.mu.Unlock()
		return nil
	}

	// Slow path: wait for slot
	s.waiting++
	defer func() { s.waiting-- }()

	// Create channel for context cancellation
	done := make(chan struct{})
	go func() {
		select {
		case <-ctx.Done():
			s.mu.Lock()
			s.cond.Broadcast()
			s.mu.Unlock()
		case <-done:
		}
	}()
	defer close(done)

	for s.current >= s.max && !s.closed {
		if ctx.Err() != nil {
			s.mu.Unlock()
			atomic.AddUint64(&s.rejected, 1)
			return ctx.Err()
		}
		s.cond.Wait()
	}

	if s.closed {
		s.mu.Unlock()
		return context.Canceled
	}

	s.current++
	s.mu.Unlock()
	return nil
}

// Release releases a held semaphore slot.
func (s *Semaphore) Release() {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.current > 0 {
		s.current--
		s.cond.Signal()
	}
}

// Close closes the semaphore, releasing all waiters.
func (s *Semaphore) Close() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.closed = true
	s.cond.Broadcast()
}

// Stats returns current semaphore statistics.
type SemaphoreStats struct {
	Max      int64
	Current  int64
	Waiting  int64
	Rejected uint64
}

func (s *Semaphore) Stats() SemaphoreStats {
	s.mu.Lock()
	defer s.mu.Unlock()
	return SemaphoreStats{
		Max:      s.max,
		Current:  s.current,
		Waiting:  s.waiting,
		Rejected: atomic.LoadUint64(&s.rejected),
	}
}

// AcquireWithTimeout is a convenience wrapper using deadline.
func (s *Semaphore) AcquireWithTimeout(timeout time.Duration) error {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()
	return s.Acquire(ctx)
}
