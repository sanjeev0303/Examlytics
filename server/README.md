# Examlytics Go Server

A high-performance Go server implementation following SOLID principles, replacing the Node.js/Express server.

## 🏗️ Architecture

This server follows **SOLID principles**:

- **S**ingle Responsibility: Each package has one reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Interfaces allow swapping implementations
- **I**nterface Segregation: Small, focused interfaces
- **D**ependency Inversion: Depend on abstractions, not concretions

### Project Structure

```
server-go/
├── cmd/
│   └── server/
│       └── main.go           # Application entry point
├── internal/
│   ├── config/               # Configuration loading
│   ├── database/             # Database connection & migrations
│   ├── domain/               # Domain models (entities)
│   ├── dto/                  # Data Transfer Objects
│   ├── handler/              # HTTP handlers (controllers)
│   ├── middleware/           # HTTP middleware
│   ├── repository/           # Data access layer
│   ├── router/               # Route definitions
│   └── service/              # Business logic layer
├── pkg/
│   └── logger/               # Shared logging utilities
├── .air.toml                 # Hot reload configuration
├── .env.example              # Environment variables template
├── Dockerfile                # Docker build configuration
├── Makefile                  # Build automation
└── go.mod                    # Go module definition
```

## 🚀 Getting Started

### Prerequisites

- Go 1.23+
- PostgreSQL database
- (Optional) Docker

### Installation

1. Clone the repository and navigate to the server directory:
   ```bash
   cd server-go
   ```

2. Copy the environment file and configure it:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. Download dependencies:
   ```bash
   make deps
   ```

4. Run the server:
   ```bash
   make run
   ```

### Development

For hot-reload during development:
```bash
make dev
```

### Building

```bash
# Development build
make build

# Production build (optimized)
make build-prod
```

### Docker

```bash
# Build image
make docker-build

# Run container
make docker-run
```

## 📡 API Endpoints

### Health Check
- `GET /health` - Server health status

### Users
- `GET /users` - Get all users
- `POST /users` - Create a new user

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user

## 🔒 Security Features

The server includes several security middlewares:

- **Access Filter**: IP and GeoIP-based blocking
- **Bot Detector**: Detects and blocks automated requests
- **Rate Limiter**: Limits requests per IP (100 requests/15 min)
- **WAF**: SQL injection and XSS protection
- **PII Detector**: Blocks requests containing sensitive data

## 🧪 Testing

```bash
# Run tests
make test

# Run tests with coverage
make test-coverage
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 8000 |
| `ENV` | Environment (development/production) | development |
| `LOG_LEVEL` | Logging level | info |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `GEOIP_DB_PATH` | Path to GeoIP database | ./data/GeoLite2-Country.mmdb |

## 📄 License

MIT
