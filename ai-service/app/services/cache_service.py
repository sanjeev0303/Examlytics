import os
import json
import hashlib
from typing import Optional, Any, Dict
from datetime import timedelta
import redis
from sqlalchemy.orm import Session
from app.models.db_models import ExamSession

# Redis Configuration
REDIS_URL = os.getenv("REDIS_URL", "rediss://default:gQAAAAAAAR8VAAIgcDEwMDE1MTM2MDQ1NWI0MzRiYjkwMTBmMjc0MmFiYTNlYg@amazed-malamute-73493.upstash.io:6379")
redis_client = None

try:
    redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
    redis_client.ping()
    print("✅ Cache Service: Redis connected")
except Exception as e:
    print(f"⚠️ Cache Service: Redis connection failed ({e}). Using DB fallback.")
    redis_client = None

# TTL Configuration (in seconds)
TTL_EXAM = 3600  # 1 hour
TTL_ANALYTICS = 86400  # 24 hours
TTL_MASTERY = 600  # 10 minutes

class CacheService:
    @staticmethod
    def _generate_exam_hash(exam_type: str, difficulty: str, topics: str, user_level: str) -> str:
        """Generates deterministic hash for exam deduplication."""
        raw = f"{exam_type}:{difficulty}:{topics}:{user_level}"
        return hashlib.md5(raw.encode()).hexdigest()

    @staticmethod
    def get_cached_exam(db: Session, exam_hash: str) -> Optional[list]:
        """
        Tries to fetch generated exam questions from cache.
        1. Redis (dedup key)
        2. DB (cache_hash)
        """
        # 1. Redis Check
        if redis_client:
            cached = redis_client.get(f"exam_hash:{exam_hash}")
            if cached:
                print("⚡ Cache Hit (Redis): Exam")
                return json.loads(cached)

        # 2. DB Fallback
        # Look for any recent exam with same hash
        record = db.query(ExamSession).filter(
            ExamSession.cache_hash == exam_hash
        ).order_by(ExamSession.created_at.desc()).first()

        if record and record.questions:
            print("🐢 Cache Hit (DB): Exam")
            # Populate Redis for next time
            if redis_client:
                redis_client.setex(f"exam_hash:{exam_hash}", TTL_EXAM, json.dumps(record.questions))
            return record.questions

        return None

    @staticmethod
    def cache_exam(db: Session, exam_id: str, exam_hash: str, questions: list):
        """
        Caches generated exam.
        1. Redis
        2. DB (via cache_hash column update)
        """
        if redis_client:
            redis_client.setex(f"exam_hash:{exam_hash}", TTL_EXAM, json.dumps(questions))
            redis_client.setex(f"exam:{exam_id}", TTL_EXAM, json.dumps(questions))

        # DB update happens in the caller usually, but we ensure cache_hash is set
        # This explicit method might be used if we wanted to set it on a side-table
        pass

    @staticmethod
    def get_cached_analytics(exam_id: str, user_id: str) -> Optional[dict]:
        """
        Fetches cached analytics result.
        1. Redis only (DB fallback via re-computation is acceptable or column check)
        """
        if redis_client:
            key = f"analytics:{exam_id}:{user_id}"
            cached = redis_client.get(key)
            if cached:
                print("⚡ Cache Hit (Redis): Analytics")
                return json.loads(cached)
        return None

    @staticmethod
    def cache_analytics(exam_id: str, user_id: str, data: dict):
        if redis_client:
            key = f"analytics:{exam_id}:{user_id}"
            redis_client.setex(key, TTL_ANALYTICS, json.dumps(data))
