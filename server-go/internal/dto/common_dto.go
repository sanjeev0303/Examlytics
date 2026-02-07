package dto

// ErrorResponse represents a standard error response
type ErrorResponse struct {
	Error string `json:"error"`
}

// HealthResponse represents the health check response
type HealthResponse struct {
	Status    string `json:"status"`
	Timestamp string `json:"timestamp,omitempty"`
}
