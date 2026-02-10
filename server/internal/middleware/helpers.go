package middleware

import (
	"bytes"
	"io"
)

// bodyReader wraps a byte slice to implement io.ReadCloser
type bodyReader struct {
	*bytes.Reader
}

// Close implements io.Closer
func (br *bodyReader) Close() error {
	return nil
}

// newBodyReader creates a new bodyReader from bytes
func newBodyReader(body []byte) io.ReadCloser {
	return &bodyReader{Reader: bytes.NewReader(body)}
}
