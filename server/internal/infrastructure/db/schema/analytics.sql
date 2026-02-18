-- Analytics Schema for Examlytics

CREATE SCHEMA IF NOT EXISTS analytics;

-- Track detailed question interactions
CREATE TABLE analytics.question_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    exam_id UUID NOT NULL,
    question_id UUID NOT NULL,
    topic_id VARCHAR(255) NOT NULL,

    is_correct BOOLEAN NOT NULL,
    time_taken_ms INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Metadata for deep analysis
    difficulty_level VARCHAR(50), -- EASY, MEDIUM, HARD
    cognitive_level VARCHAR(50)   -- RECALL, APPLICATION, ANALYSIS
);

-- Track topic mastery snapshot over time (Knowledge Tracing)
CREATE TABLE analytics.topic_mastery (
    user_id UUID NOT NULL,
    topic_id VARCHAR(255) NOT NULL,
    mastery_score FLOAT NOT NULL, -- Probability 0.0 to 1.0 (BKT)
    confidence_interval FLOAT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    PRIMARY KEY (user_id, topic_id)
);

-- Exam performance summary
CREATE TABLE analytics.exam_performance (
    exam_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    total_score FLOAT NOT NULL,
    max_possible_score FLOAT NOT NULL,
    percentile FLOAT,
    rank INTEGER,

    speed_score FLOAT, -- Derived metric
    accuracy_score FLOAT, -- Derived metric

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interactions_user_topic ON analytics.question_interactions(user_id, topic_id);
CREATE INDEX idx_interactions_exam ON analytics.question_interactions(exam_id);
