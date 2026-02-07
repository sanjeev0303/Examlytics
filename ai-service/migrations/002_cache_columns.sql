-- Migration: Create exam_sessions table with cache columns
-- Run this on your ai-service PostgreSQL database

CREATE TABLE IF NOT EXISTS exam_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    topic_id VARCHAR(255),
    type VARCHAR(50),
    total_questions INTEGER,
    status VARCHAR(50), -- PENDING, PROCESSING, READY, COMPLETED, FAILED
    score INTEGER DEFAULT 0,
    accuracy INTEGER DEFAULT 0,
    time_taken INTEGER DEFAULT 0,
    questions JSONB,
    user_responses JSONB,

    -- Cache Columns
    cache_hash VARCHAR(255),
    cached_analysis JSONB,

    job_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_id ON exam_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_cache_hash ON exam_sessions(cache_hash);
