.PHONY: build run dev test clean tidy docker-build docker-run migrate

# Binary name
BINARY_NAME=examlytics-server
BUILD_DIR=./bin

# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GORUN=$(GOCMD) run
GOTEST=$(GOCMD) test
GOCLEAN=$(GOCMD) clean
GOMOD=$(GOCMD) mod

# Build the binary
build:
	@echo "Building..."
	@mkdir -p $(BUILD_DIR)
	$(GOBUILD) -o $(BUILD_DIR)/$(BINARY_NAME) ./cmd/server

# Build for production (with optimizations)
build-prod:
	@echo "Building for production..."
	@mkdir -p $(BUILD_DIR)
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 $(GOBUILD) -ldflags="-w -s" -o $(BUILD_DIR)/$(BINARY_NAME) ./cmd/server

# Run the application
run: build
	@echo "Running..."
	./$(BUILD_DIR)/$(BINARY_NAME)

# Run in development mode with hot reload (requires air)
dev:
	@echo "Starting development server..."
	@if command -v air > /dev/null; then \
		air; \
	else \
		echo "Air not available, running directly with go run..."; \
		$(GORUN) ./cmd/server; \
	fi

# Run directly without building
run-direct:
	$(GORUN) ./cmd/server

# Run tests
test:
	@echo "Testing..."
	$(GOTEST) -v ./...

# Run tests with coverage
test-coverage:
	@echo "Testing with coverage..."
	$(GOTEST) -v -coverprofile=coverage.out ./...
	$(GOCMD) tool cover -html=coverage.out -o coverage.html

# Clean build files
clean:
	@echo "Cleaning..."
	$(GOCLEAN)
	rm -rf $(BUILD_DIR)
	rm -f coverage.out coverage.html

# Tidy dependencies
tidy:
	@echo "Tidying dependencies..."
	$(GOMOD) tidy

# Download dependencies
deps:
	@echo "Downloading dependencies..."
	$(GOMOD) download

# Verify dependencies
verify:
	@echo "Verifying dependencies..."
	$(GOMOD) verify

# Format code
fmt:
	@echo "Formatting code..."
	$(GOCMD) fmt ./...

# Lint code (requires golangci-lint)
lint:
	@echo "Linting..."
	@if command -v golangci-lint > /dev/null; then \
		golangci-lint run; \
	else \
		echo "Installing golangci-lint..."; \
		go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest; \
		golangci-lint run; \
	fi

# Docker commands
docker-build:
	@echo "Building Docker image..."
	docker build -t examlytics-server .

docker-run:
	@echo "Running Docker container..."
	docker run -p 8000:8000 --env-file .env examlytics-server

# Database migrations
migrate:
	@echo "Running migrations..."
	$(GORUN) ./cmd/server --migrate-only

# Generate swagger docs (requires swag)
swagger:
	@echo "Generating Swagger docs..."
	@if command -v swag > /dev/null; then \
		swag init -g cmd/server/main.go -o ./docs; \
	else \
		echo "Installing swag..."; \
		go install github.com/swaggo/swag/cmd/swag@latest; \
		swag init -g cmd/server/main.go -o ./docs; \
	fi

# Help
help:
	@echo "Available targets:"
	@echo "  build        - Build the binary"
	@echo "  build-prod   - Build optimized binary for production"
	@echo "  run          - Build and run the application"
	@echo "  dev          - Run with hot reload (requires air)"
	@echo "  run-direct   - Run without building"
	@echo "  test         - Run tests"
	@echo "  test-coverage- Run tests with coverage"
	@echo "  clean        - Clean build files"
	@echo "  tidy         - Tidy go.mod"
	@echo "  deps         - Download dependencies"
	@echo "  verify       - Verify dependencies"
	@echo "  fmt          - Format code"
	@echo "  lint         - Lint code"
	@echo "  docker-build - Build Docker image"
	@echo "  docker-run   - Run Docker container"
	@echo "  migrate      - Run database migrations"
	@echo "  swagger      - Generate Swagger docs"
