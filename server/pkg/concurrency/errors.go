package concurrency

import "errors"

// Package-level errors for concurrency primitives.
var (
	ErrPoolStopped = errors.New("worker pool is stopped")
	ErrQueueFull   = errors.New("job queue is full")
	ErrTimeout     = errors.New("operation timed out")
)
