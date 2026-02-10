package resilience

import (
	"context"
	"errors"
	"sync"
	"sync/atomic"
	"time"
)

// State represents the circuit breaker state.
type State int32

const (
	StateClosed   State = iota // Normal operation, requests flow through
	StateOpen                  // Failing, requests rejected immediately
	StateHalfOpen              // Testing if service has recovered
)

func (s State) String() string {
	switch s {
	case StateClosed:
		return "closed"
	case StateOpen:
		return "open"
	case StateHalfOpen:
		return "half-open"
	default:
		return "unknown"
	}
}

// CircuitBreaker implements the circuit breaker pattern to prevent
// cascading failures when calling external services.
type CircuitBreaker struct {
	name           string
	maxFailures    int32
	resetTimeout   time.Duration
	halfOpenMax    int32 // max concurrent requests in half-open
	state          int32 // atomic State
	failures       int32
	successes      int32 // consecutive successes in half-open
	lastFailure    int64 // unix nano
	halfOpenActive int32 // active half-open requests
	mu             sync.RWMutex

	// Metrics
	totalRequests uint64
	totalFailures uint64
	totalRejects  uint64
}

// CircuitBreakerConfig configures a circuit breaker.
type CircuitBreakerConfig struct {
	Name         string
	MaxFailures  int           // failures before opening (default: 5)
	ResetTimeout time.Duration // time before half-open (default: 30s)
	HalfOpenMax  int           // concurrent requests in half-open (default: 1)
}

// NewCircuitBreaker creates a new circuit breaker with the given config.
func NewCircuitBreaker(cfg CircuitBreakerConfig) *CircuitBreaker {
	if cfg.MaxFailures <= 0 {
		cfg.MaxFailures = 5
	}
	if cfg.ResetTimeout <= 0 {
		cfg.ResetTimeout = 30 * time.Second
	}
	if cfg.HalfOpenMax <= 0 {
		cfg.HalfOpenMax = 1
	}

	return &CircuitBreaker{
		name:         cfg.Name,
		maxFailures:  int32(cfg.MaxFailures),
		resetTimeout: cfg.ResetTimeout,
		halfOpenMax:  int32(cfg.HalfOpenMax),
		state:        int32(StateClosed),
	}
}

// Execute runs the given function through the circuit breaker.
// Returns ErrCircuitOpen if the circuit is open.
func (cb *CircuitBreaker) Execute(ctx context.Context, fn func(context.Context) error) error {
	if err := cb.beforeRequest(); err != nil {
		return err
	}

	// Execute the function
	err := fn(ctx)

	cb.afterRequest(err)
	return err
}

func (cb *CircuitBreaker) beforeRequest() error {
	atomic.AddUint64(&cb.totalRequests, 1)

	state := State(atomic.LoadInt32(&cb.state))

	switch state {
	case StateClosed:
		return nil

	case StateOpen:
		// Check if reset timeout has passed
		lastFail := atomic.LoadInt64(&cb.lastFailure)
		if time.Since(time.Unix(0, lastFail)) >= cb.resetTimeout {
			// Transition to half-open
			if atomic.CompareAndSwapInt32(&cb.state, int32(StateOpen), int32(StateHalfOpen)) {
				atomic.StoreInt32(&cb.failures, 0)
				atomic.StoreInt32(&cb.successes, 0)
				atomic.StoreInt32(&cb.halfOpenActive, 0)
			}
			return cb.beforeRequest() // Retry with new state
		}
		atomic.AddUint64(&cb.totalRejects, 1)
		return ErrCircuitOpen

	case StateHalfOpen:
		// Allow limited requests through
		active := atomic.AddInt32(&cb.halfOpenActive, 1)
		if active > cb.halfOpenMax {
			atomic.AddInt32(&cb.halfOpenActive, -1)
			atomic.AddUint64(&cb.totalRejects, 1)
			return ErrCircuitOpen
		}
		return nil

	default:
		return nil
	}
}

func (cb *CircuitBreaker) afterRequest(err error) {
	state := State(atomic.LoadInt32(&cb.state))

	if err != nil {
		atomic.AddUint64(&cb.totalFailures, 1)
		cb.recordFailure(state)
	} else {
		cb.recordSuccess(state)
	}

	// Decrement half-open active counter
	if state == StateHalfOpen {
		atomic.AddInt32(&cb.halfOpenActive, -1)
	}
}

func (cb *CircuitBreaker) recordFailure(state State) {
	atomic.StoreInt64(&cb.lastFailure, time.Now().UnixNano())

	switch state {
	case StateClosed:
		failures := atomic.AddInt32(&cb.failures, 1)
		if failures >= cb.maxFailures {
			atomic.CompareAndSwapInt32(&cb.state, int32(StateClosed), int32(StateOpen))
		}

	case StateHalfOpen:
		// Any failure in half-open → back to open
		atomic.CompareAndSwapInt32(&cb.state, int32(StateHalfOpen), int32(StateOpen))
	}
}

func (cb *CircuitBreaker) recordSuccess(state State) {
	switch state {
	case StateClosed:
		// Reset failure count on success
		atomic.StoreInt32(&cb.failures, 0)

	case StateHalfOpen:
		successes := atomic.AddInt32(&cb.successes, 1)
		// After enough successes, close the circuit
		if successes >= cb.halfOpenMax {
			atomic.CompareAndSwapInt32(&cb.state, int32(StateHalfOpen), int32(StateClosed))
			atomic.StoreInt32(&cb.failures, 0)
		}
	}
}

// State returns the current circuit state.
func (cb *CircuitBreaker) State() State {
	return State(atomic.LoadInt32(&cb.state))
}

// Reset forces the circuit breaker to closed state.
func (cb *CircuitBreaker) Reset() {
	atomic.StoreInt32(&cb.state, int32(StateClosed))
	atomic.StoreInt32(&cb.failures, 0)
	atomic.StoreInt32(&cb.successes, 0)
}

// CircuitBreakerStats contains metrics for observability.
type CircuitBreakerStats struct {
	Name          string
	State         string
	Failures      int32
	TotalRequests uint64
	TotalFailures uint64
	TotalRejects  uint64
}

// Stats returns current circuit breaker statistics.
func (cb *CircuitBreaker) Stats() CircuitBreakerStats {
	return CircuitBreakerStats{
		Name:          cb.name,
		State:         State(atomic.LoadInt32(&cb.state)).String(),
		Failures:      atomic.LoadInt32(&cb.failures),
		TotalRequests: atomic.LoadUint64(&cb.totalRequests),
		TotalFailures: atomic.LoadUint64(&cb.totalFailures),
		TotalRejects:  atomic.LoadUint64(&cb.totalRejects),
	}
}

// Errors
var (
	ErrCircuitOpen = errors.New("circuit breaker is open")
)
