package tests

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/examlytics/server/internal/domain"
	"github.com/examlytics/server/internal/dto"
	"github.com/examlytics/server/internal/middleware"
	"github.com/gin-gonic/gin"
)

// Manual Mock matching internal/service/UserService
type MockUserService struct {
	MockGetUserProfile func(ctx context.Context, userID string) (*domain.User, error)
	// Add other methods as needed by the interface, returning nil/zero values
}

func (m *MockUserService) CreateUser(ctx context.Context, data *dto.CreateUserRequest) (*domain.User, error) {
	return nil, nil
}
func (m *MockUserService) GetUsers(ctx context.Context) ([]*domain.User, error) {
	return nil, nil
}
func (m *MockUserService) Login(ctx context.Context, email, password string) (*domain.User, error) {
	return nil, nil
}
func (m *MockUserService) GetUserProfile(ctx context.Context, userID string) (*domain.User, error) {
	if m.MockGetUserProfile != nil {
		return m.MockGetUserProfile(ctx, userID)
	}
	return nil, nil
}
func (m *MockUserService) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	return nil, nil
}
func (m *MockUserService) UpdateUser(ctx context.Context, userID string, req dto.UpdateUserRequest) (*domain.User, error) {
	return nil, nil
}
func (m *MockUserService) GetUserWeakTopics(ctx context.Context, userID string) ([]*domain.UserWeakTopic, error) {
	return nil, nil
}
func (m *MockUserService) GetUserAIContext(ctx context.Context, userID string) (*domain.UserAIContext, error) {
	return nil, nil
}
func (m *MockUserService) GetAdminStats(ctx context.Context) (*dto.AdminStatsResponse, error) {
	return nil, nil
}
func (m *MockUserService) OnboardUser(ctx context.Context, userID string, req dto.OnboardingRequest) error {
	return nil
}

func TestRateLimiter(t *testing.T) {
	gin.SetMode(gin.TestMode)
	limiter := middleware.NewRateLimiter(60000, 2)

	r := gin.New()
	r.Use(limiter.Limit())
	r.GET("/test", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	w1 := httptest.NewRecorder()
	r.ServeHTTP(w1, httptest.NewRequest("GET", "/test", nil))
	if w1.Code != http.StatusOK {
		t.Errorf("Expected 200, got %d", w1.Code)
	}

	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, httptest.NewRequest("GET", "/test", nil))
	if w2.Code != http.StatusOK {
		t.Errorf("Expected 200, got %d", w2.Code)
	}

	w3 := httptest.NewRecorder()
	r.ServeHTTP(w3, httptest.NewRequest("GET", "/test", nil))
	if w3.Code != http.StatusTooManyRequests {
		t.Errorf("Expected 429, got %d", w3.Code)
	}
}

func TestRequireLogin(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := &MockUserService{}
	jwtAuth := middleware.NewJWTAuth(mockService)

	// Case 1: Unauthorized
	w1 := httptest.NewRecorder()
	c1, _ := gin.CreateTestContext(w1)
	c1.Request = httptest.NewRequest("GET", "/protected", nil)
	jwtAuth.RequireLogin()(c1)
	if w1.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401, got %d", w1.Code)
	}

	// Case 2: Authorized
	w2 := httptest.NewRecorder()
	c2, _ := gin.CreateTestContext(w2)
	c2.Request = httptest.NewRequest("GET", "/protected", nil)
	c2.Set("userID", "user_123")
	jwtAuth.RequireLogin()(c2)
	if w2.Code != http.StatusOK {
		t.Errorf("Expected 200 (Next called), got %d", w2.Code)
	}
}

func TestRequireAdmin(t *testing.T) {
	gin.SetMode(gin.TestMode)
	mockService := &MockUserService{}
	jwtAuth := middleware.NewJWTAuth(mockService)

	// Case 1: Not Admin
	w1 := httptest.NewRecorder()
	c1, _ := gin.CreateTestContext(w1)
	c1.Request = httptest.NewRequest("GET", "/admin", nil)
	c1.Set("userID", "user_normal")
	c1.Set("role", "USER")
	jwtAuth.RequireAdmin()(c1)
	if w1.Code != http.StatusForbidden {
		t.Errorf("Expected 403, got %d", w1.Code)
	}

	// Case 2: Admin
	w2 := httptest.NewRecorder()
	c2, _ := gin.CreateTestContext(w2)
	c2.Request = httptest.NewRequest("GET", "/admin", nil)
	c2.Set("userID", "admin_user")
	c2.Set("role", "ADMIN")
	jwtAuth.RequireAdmin()(c2)
	if w2.Code != http.StatusOK {
		t.Errorf("Expected 200, got %d", w2.Code)
	}
}
