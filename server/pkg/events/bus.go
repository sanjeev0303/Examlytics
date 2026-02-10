package events

import (
	"context"
	"sync"
	"sync/atomic"
	"time"
)

// EventType identifies different event categories.
type EventType string

const (
	EventExamStarted      EventType = "exam.started"
	EventExamSubmitted    EventType = "exam.submitted"
	EventQuestionAnswered EventType = "question.answered"
	EventTopicUpdated     EventType = "topic.updated"
	EventAnalyticsRun     EventType = "analytics.run"
)

// Event represents an analytics event.
type Event struct {
	Type      EventType
	UserID    string
	SessionID string
	Payload   map[string]interface{}
	Timestamp time.Time
}

// Handler processes events asynchronously.
type Handler func(ctx context.Context, event Event) error

// EventBus provides non-blocking event delivery.
type EventBus struct {
	handlers   map[EventType][]Handler
	mu         sync.RWMutex
	eventCh    chan Event
	bufferSize int
	workers    int
	wg         sync.WaitGroup
	ctx        context.Context
	cancel     context.CancelFunc
	running    int32

	// Metrics
	published uint64
	processed uint64
	dropped   uint64
}

// EventBusConfig configures the event bus.
type EventBusConfig struct {
	BufferSize int // Channel buffer size (default: 1000)
	Workers    int // Number of worker goroutines (default: 5)
}

// NewEventBus creates a new event bus.
func NewEventBus(cfg EventBusConfig) *EventBus {
	if cfg.BufferSize <= 0 {
		cfg.BufferSize = 1000
	}
	if cfg.Workers <= 0 {
		cfg.Workers = 5
	}

	ctx, cancel := context.WithCancel(context.Background())
	return &EventBus{
		handlers:   make(map[EventType][]Handler),
		eventCh:    make(chan Event, cfg.BufferSize),
		bufferSize: cfg.BufferSize,
		workers:    cfg.Workers,
		ctx:        ctx,
		cancel:     cancel,
	}
}

// Subscribe registers a handler for an event type.
func (eb *EventBus) Subscribe(eventType EventType, handler Handler) {
	eb.mu.Lock()
	defer eb.mu.Unlock()
	eb.handlers[eventType] = append(eb.handlers[eventType], handler)
}

// Start begins processing events.
func (eb *EventBus) Start() {
	if !atomic.CompareAndSwapInt32(&eb.running, 0, 1) {
		return // Already running
	}

	for i := 0; i < eb.workers; i++ {
		eb.wg.Add(1)
		go eb.worker(i)
	}
}

func (eb *EventBus) worker(id int) {
	defer eb.wg.Done()

	for {
		select {
		case <-eb.ctx.Done():
			return
		case event, ok := <-eb.eventCh:
			if !ok {
				return
			}
			eb.processEvent(event)
		}
	}
}

func (eb *EventBus) processEvent(event Event) {
	eb.mu.RLock()
	handlers := eb.handlers[event.Type]
	eb.mu.RUnlock()

	for _, handler := range handlers {
		func() {
			defer func() {
				if r := recover(); r != nil {
					// Log panic but continue processing
				}
			}()

			ctx, cancel := context.WithTimeout(eb.ctx, 10*time.Second)
			defer cancel()

			if err := handler(ctx, event); err != nil {
				// Log error but continue
			}
		}()
	}

	atomic.AddUint64(&eb.processed, 1)
}

// Publish sends an event non-blocking. Drops if buffer full.
func (eb *EventBus) Publish(event Event) bool {
	if atomic.LoadInt32(&eb.running) == 0 {
		return false
	}

	if event.Timestamp.IsZero() {
		event.Timestamp = time.Now()
	}

	select {
	case eb.eventCh <- event:
		atomic.AddUint64(&eb.published, 1)
		return true
	default:
		// Buffer full - drop event
		atomic.AddUint64(&eb.dropped, 1)
		return false
	}
}

// PublishAsync is an alias for Publish for clarity.
func (eb *EventBus) PublishAsync(eventType EventType, userID, sessionID string, payload map[string]interface{}) {
	eb.Publish(Event{
		Type:      eventType,
		UserID:    userID,
		SessionID: sessionID,
		Payload:   payload,
		Timestamp: time.Now(),
	})
}

// Stop gracefully shuts down the event bus.
func (eb *EventBus) Stop() {
	if !atomic.CompareAndSwapInt32(&eb.running, 1, 0) {
		return
	}

	eb.cancel()
	close(eb.eventCh)
	eb.wg.Wait()
}

// StopWithTimeout attempts graceful shutdown with timeout.
func (eb *EventBus) StopWithTimeout(timeout time.Duration) bool {
	if !atomic.CompareAndSwapInt32(&eb.running, 1, 0) {
		return true
	}

	eb.cancel()
	close(eb.eventCh)

	done := make(chan struct{})
	go func() {
		eb.wg.Wait()
		close(done)
	}()

	select {
	case <-done:
		return true
	case <-time.After(timeout):
		return false
	}
}

// Stats returns event bus metrics.
type EventBusStats struct {
	Published  uint64
	Processed  uint64
	Dropped    uint64
	QueueDepth int
	Running    bool
}

func (eb *EventBus) Stats() EventBusStats {
	return EventBusStats{
		Published:  atomic.LoadUint64(&eb.published),
		Processed:  atomic.LoadUint64(&eb.processed),
		Dropped:    atomic.LoadUint64(&eb.dropped),
		QueueDepth: len(eb.eventCh),
		Running:    atomic.LoadInt32(&eb.running) == 1,
	}
}
