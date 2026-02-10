package memory

import (
	"sync"
)

// BoundedBuffer is a fixed-size, thread-safe circular buffer.
// Oldest items are evicted when capacity is reached.
type BoundedBuffer[T any] struct {
	mu       sync.RWMutex
	items    []T
	capacity int
	head     int // Next write position
	count    int
}

// NewBoundedBuffer creates a bounded buffer with the given capacity.
func NewBoundedBuffer[T any](capacity int) *BoundedBuffer[T] {
	if capacity <= 0 {
		capacity = 100
	}
	return &BoundedBuffer[T]{
		items:    make([]T, capacity),
		capacity: capacity,
	}
}

// Push adds an item, evicting oldest if at capacity.
func (b *BoundedBuffer[T]) Push(item T) {
	b.mu.Lock()
	defer b.mu.Unlock()

	b.items[b.head] = item
	b.head = (b.head + 1) % b.capacity
	if b.count < b.capacity {
		b.count++
	}
}

// TryPush adds an item, returns false if at capacity (doesn't evict).
func (b *BoundedBuffer[T]) TryPush(item T) bool {
	b.mu.Lock()
	defer b.mu.Unlock()

	if b.count >= b.capacity {
		return false
	}

	b.items[b.head] = item
	b.head = (b.head + 1) % b.capacity
	b.count++
	return true
}

// Pop removes and returns the oldest item.
func (b *BoundedBuffer[T]) Pop() (T, bool) {
	b.mu.Lock()
	defer b.mu.Unlock()

	var zero T
	if b.count == 0 {
		return zero, false
	}

	// Calculate tail position
	tail := (b.head - b.count + b.capacity) % b.capacity
	item := b.items[tail]
	b.items[tail] = zero // Clear reference
	b.count--
	return item, true
}

// Len returns the current number of items.
func (b *BoundedBuffer[T]) Len() int {
	b.mu.RLock()
	defer b.mu.RUnlock()
	return b.count
}

// Cap returns the buffer capacity.
func (b *BoundedBuffer[T]) Cap() int {
	return b.capacity
}

// Drain removes and returns all items.
func (b *BoundedBuffer[T]) Drain() []T {
	b.mu.Lock()
	defer b.mu.Unlock()

	if b.count == 0 {
		return nil
	}

	result := make([]T, b.count)
	tail := (b.head - b.count + b.capacity) % b.capacity
	for i := 0; i < b.count; i++ {
		idx := (tail + i) % b.capacity
		result[i] = b.items[idx]
	}

	// Clear buffer
	var zero T
	for i := range b.items {
		b.items[i] = zero
	}
	b.head = 0
	b.count = 0

	return result
}

// Clear removes all items without returning them.
func (b *BoundedBuffer[T]) Clear() {
	b.mu.Lock()
	defer b.mu.Unlock()

	var zero T
	for i := range b.items {
		b.items[i] = zero
	}
	b.head = 0
	b.count = 0
}
