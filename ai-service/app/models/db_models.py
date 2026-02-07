from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.db import Base
import uuid
import datetime

class ExamSession(Base):
    __tablename__ = "exam_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), index=True)
    topic_id = Column(String) # Can be UUID or Name depending on usage
    type = Column(String)
    total_questions = Column(Integer)
    status = Column(String) # PENDING, PROCESSING, READY, COMPLETED, FAILED
    score = Column(Integer, default=0)
    accuracy = Column(Integer, default=0) # Added
    time_taken = Column(Integer, default=0) # Added

    questions = Column(JSONB) # To store the generated list of questions
    user_responses = Column(JSONB) # To store user answers

    # Caching Columns
    cache_hash = Column(String, index=True) # Deterministic hash for dedup
    cached_analysis = Column(JSONB) # Cached result of AI analysis

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    job_error = Column(Text, nullable=True)

class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    text = Column(Text, nullable=False)
    options = Column(JSONB, nullable=False) # List of strings
    correct_answer = Column(String, nullable=False)
    topic_id = Column(UUID(as_uuid=True), index=True)
    difficulty = Column(String)
    type = Column(String) # MCQ, etc.

class Topic(Base):
    __tablename__ = "topics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)

class UserWeakTopic(Base):
    __tablename__ = "user_weak_topics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), index=True)
    topic_id = Column(String)
    topic_name = Column(String)
    accuracy = Column(Integer) # or Float
    attempts = Column(Integer, default=0)
    status = Column(String) # WEAK, IMPROVING, RESOLVED
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class UserTopicAggregate(Base):
    __tablename__ = "user_topic_aggregates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), index=True)
    topic = Column(String) # Topic Key
    avg_accuracy = Column(Integer) # Float ideally
    avg_time = Column(Integer)
    total_attempts = Column(Integer)
    weak_score = Column(Integer)
    last_updated = Column(DateTime)

class UserAIContext(Base):
    """
    Stores per-user adaptive AI context as JSONB.
    Used for topic prioritization, difficulty tuning, and question style.
    """
    __tablename__ = "user_ai_contexts"

    user_id = Column(UUID(as_uuid=True), primary_key=True)
    context_data = Column(JSONB, nullable=False, default={})
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
