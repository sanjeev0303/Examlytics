-- Migration: Create user_ai_contexts table
-- Run this on your ai-service PostgreSQL database

CREATE TABLE IF NOT EXISTS user_ai_contexts (
    user_id UUID PRIMARY KEY,
    context_data JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster JSONB queries on topic mastery
CREATE INDEX IF NOT EXISTS idx_user_ai_contexts_topic_mastery
ON user_ai_contexts USING GIN ((context_data -> 'topicMastery'));

COMMENT ON TABLE user_ai_contexts IS 'Per-user adaptive AI context for exam generation';

-- Add user_responses column to exam_sessions
ALTER TABLE exam_sessions ADD COLUMN IF NOT EXISTS user_responses JSONB;
