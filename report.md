# gRPC Service Communication Analysis & Verification Report

This report documents the structure, integration, verification, and data flow of the gRPC-based services in the Examlytics platform.

---

## 1. Service Analysis & Architecture

The system utilizes gRPC for high-performance, strongly-typed internal communication between the orchestrator/API gateway and the intelligence core.

| Service | Technology Stack | Role | gRPC Role | Source Code Paths |
| :--- | :--- | :--- | :--- | :--- |
| **`server`** | Golang | API Gateway / Web Server | Client | `server/internal/infrastructure/ai/` |
| **`ai-service`** | Python | Intelligence & Analytics Core | Server | `ai-service/app/grpc_server.py` |
| **`proto`** | Protocol Buffers (v3) | Contract / Schema Definition | Shared Schema | `proto/examlytics/v1/examlytics.proto` |

### Service Contracts (`proto`)
The gRPC contract defines the `ExamlyticsAI` service with four remote procedure calls:
*   `GenerateExam` (Unary): Generates an exam template/blueprint containing AI-generated question structures.
*   `AnalyzeExam` (Unary): Processes student answers to compute score, accuracy, and topic performance analysis.
*   `StreamExplanation` (Server Streaming): Explains correct/incorrect options for a question using streamed chunks for optimal client UX.
*   `PredictPerformance` (Unary): Applies Bayesian Knowledge Tracing (BKT) based on historical database records to predict future topic accuracy and failure risk.

---

## 2. Verification of gRPC Communication

To ensure that the services communicate correctly and securely, we verified the configuration, interceptors, and all four endpoints.

### Authentication & Interceptors
*   **Security Enforcement**: The Python gRPC server (`ai-service`) implements a `ServerInterceptor` (`AuthInterceptor`) that extracts the `authorization` metadata header and validates that it contains a `Bearer <token>`.
*   **Token Propagation**: The Go gRPC client (`server`) implements matching `UnaryClientInterceptor` and `StreamClientInterceptor` that automatically extract the JWT token from the Go `context` (context key: `"raw_token"`) and append it as `Bearer <token>` to the outgoing gRPC metadata.

### Verification Results
A dedicated test harness (`server/cmd/debug/main.go`) was run to execute and verify the gRPC pipeline under both unauthenticated and authenticated states:

1.  **Unauthenticated Access Rejecting**:
    *   *Result*: **PASSED**
    *   *Details*: Requesting without authorization metadata was successfully intercepted and rejected by the Python server with `rpc error: code = Unauthenticated desc = Missing authorization`.
2.  **GenerateExam Unary Call**:
    *   *Result*: **PASSED**
    *   *Details*: Successfully returned mock exam data containing questions categorized by topic.
3.  **AnalyzeExam Unary Call**:
    *   *Result*: **PASSED**
    *   *Details*: Successfully calculated accuracy and identified weak topics (e.g., `Calculus`).
4.  **StreamExplanation Server Streaming Call**:
    *   *Result*: **PASSED**
    *   *Details*: Streamed explanation chunks sequentially over the active channel and successfully closed the connection when finished.
5.  **PredictPerformance (Database-backed) Unary Call**:
    *   *Result*: **PASSED**
    *   *Details*:
        *   *First Run (Cold Start)*: Encountered a database connection warning because the serverless Neon PostgreSQL database (Singapore AWS region) takes 3-10 seconds to spin up from an idle state.
        *   *Subsequent Run (Warm Start)*: Successfully established connection, executed BKT scoring, and returned the predicted score and risk level (`Predicted Score: 0.00`, `Risk Level: HIGH` for the non-existent dummy test user UUID).

> [!IMPORTANT]
> **Issue Identified and Fixed during Verification**:
> The Python gRPC server (`ai-service/app/grpc_server.py`) initially started without calling `load_dotenv()`. This caused `os.getenv("DATABASE_URL")` to fall back to `localhost:5432`, breaking the database-backed `PredictPerformance` call.
> **Fix Applied**: Added `dotenv.load_dotenv()` to the initialization block of `grpc_server.py` to ensure env variables from `.env` are loaded properly.

---

## 3. Data Flow Diagrams

The following diagram illustrates how data flows between the services across different request paths.

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant GoServer as Go Server (API Gateway)
    participant Redis as Redis Cache
    participant PythonAI as Python AI Service
    participant Database as PostgreSQL DB

    %% GenerateExam Flow
    rect rgb(220, 240, 255)
        note right of Student: Scenario 1: Generate Exam Session
        Student->>GoServer: POST /exams/start (HTTP)
        GoServer->>GoServer: Retrieve or create Auth context with "raw_token"
        GoServer->>PythonAI: GenerateExam(GenerateExamRequest) [gRPC with Bearer Token]
        PythonAI->>PythonAI: Verify token in AuthInterceptor
        PythonAI->>PythonAI: Generate mock questions & exam metadata
        PythonAI-->>GoServer: GenerateExamResponse (exam_id, questions, time_limit)
        GoServer->>Database: Store generated exam session
        GoServer-->>Student: HTTP 200 (JSON Exam Data)
    end

    %% AnalyzeExam Flow
    rect rgb(230, 255, 230)
        note right of Student: Scenario 2: Submit & Analyze Exam
        Student->>GoServer: POST /exams/submit (HTTP with student answers)
        GoServer->>PythonAI: AnalyzeExam(AnalyzeExamRequest) [gRPC with Bearer Token]
        PythonAI->>PythonAI: Verify token in AuthInterceptor
        PythonAI->>PythonAI: Calculate score, accuracy, & identify weak topics
        PythonAI-->>GoServer: AnalyzeExamResponse (score, accuracy, topic_analysis)
        GoServer->>Database: Save exam attempt and score
        GoServer-->>Student: HTTP 200 (Score & Analysis summary)
    end

    %% StreamExplanation Flow
    rect rgb(255, 240, 220)
        note right of Student: Scenario 3: Stream Question Explanation
        Student->>GoServer: GET /exams/stream/:jobId (HTTP SSE/WebSocket)
        GoServer->>PythonAI: StreamExplanation(ExplanationRequest) [gRPC stream with Bearer Token]
        PythonAI->>PythonAI: Verify token in AuthInterceptor
        loop For each chunk of explanation text
            PythonAI-->>GoServer: ExplanationResponse (chunk)
            GoServer-->>Student: Stream Chunk (SSE / raw output)
        end
        PythonAI-->>GoServer: EOF (End of Stream)
    end

    %% PredictPerformance Flow
    rect rgb(240, 220, 255)
        note right of Student: Scenario 4: Predict Performance (BKT Engine)
        Student->>GoServer: GET /analytics/readiness-score (HTTP)
        GoServer->>PythonAI: PredictPerformance(PredictPerformanceRequest) [gRPC with Bearer Token]
        PythonAI->>PythonAI: Verify token in AuthInterceptor
        PythonAI->>Database: Query UserAIContext (topic_mastery, history)
        Database-->>PythonAI: UserAIContext record
        PythonAI->>PythonAI: Compute BKT (Bayesian Knowledge Tracing) projections
        PythonAI-->>GoServer: PredictPerformanceResponse (predicted_score, confidence_score, risk_level)
        GoServer-->>Student: HTTP 200 (Interview Readiness Stats)
    end
```
