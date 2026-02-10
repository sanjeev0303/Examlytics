package memory

import (
	"bytes"
	"strings"
	"sync"
)

// BufferPool provides reusable byte buffers to reduce allocations.
var BufferPool = sync.Pool{
	New: func() interface{} {
		return bytes.NewBuffer(make([]byte, 0, 4096))
	},
}

// GetBuffer retrieves a buffer from the pool.
func GetBuffer() *bytes.Buffer {
	buf := BufferPool.Get().(*bytes.Buffer)
	buf.Reset()
	return buf
}

// PutBuffer returns a buffer to the pool.
func PutBuffer(buf *bytes.Buffer) {
	if buf.Cap() > 64*1024 {
		// Don't pool very large buffers
		return
	}
	BufferPool.Put(buf)
}

// ByteSlicePool provides reusable byte slices.
var ByteSlicePool = sync.Pool{
	New: func() interface{} {
		s := make([]byte, 0, 4096)
		return &s
	},
}

// GetByteSlice retrieves a byte slice from the pool.
func GetByteSlice() *[]byte {
	return ByteSlicePool.Get().(*[]byte)
}

// PutByteSlice returns a byte slice to the pool.
func PutByteSlice(b *[]byte) {
	if cap(*b) > 64*1024 {
		return
	}
	*b = (*b)[:0]
	ByteSlicePool.Put(b)
}

// StringBuilderPool provides reusable string builders.
var StringBuilderPool = sync.Pool{
	New: func() interface{} {
		return &stringBuilderWrapper{
			Builder: new(strings.Builder),
		}
	},
}

type stringBuilderWrapper struct {
	*strings.Builder
}

// GetStringBuilder retrieves a string builder from the pool.
func GetStringBuilder() *strings.Builder {
	w := StringBuilderPool.Get().(*stringBuilderWrapper)
	w.Reset()
	return w.Builder
}

// PutStringBuilder returns a string builder to the pool.
func PutStringBuilder(sb *strings.Builder) {
	if sb.Cap() > 64*1024 {
		return
	}
	StringBuilderPool.Put(&stringBuilderWrapper{Builder: sb})
}
