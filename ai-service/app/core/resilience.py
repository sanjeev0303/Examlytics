
import os
import time
import json
import redis
import logging
from enum import Enum

# Configure Logger
logger = logging.getLogger("ai_resilience")
logger.setLevel(logging.INFO)

# Redis Setup (Reuse existing env var if possible, else default)
REDIS_URL = os.getenv("REDIS_URL", "rediss://default:gQAAAAAAAR8VAAIgcDEwMDE1MTM2MDQ1NWI0MzRiYjkwMTBmMjc0MmFiYTNlYg@amazed-malamute-73493.upstash.io:6379")
redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)

class CircuitState(Enum):
    CLOSED = "CLOSED"
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"

class AIResilienceManager:
    """
    Manages resilience patterns for AI Service:
    - Token Budget Guard
    - Circuit Breaker
    - Rate Limit Tracking
    """

    def __init__(self):
        # Configuration
        self.circuit_breaker_threshold = 3  # consecutive errors
        self.circuit_window = 600           # 10 minutes (seconds)

        # Token Budget (Daily) - Example: 1M tokens/day
        self.daily_token_limit = int(os.getenv("AI_DAILY_TOKEN_LIMIT", 1000000))
        self.token_safety_buffer = 1000  # Buffer to prevent exact exhaustion

    def _get_circuit_key(self, provider: str) -> str:
        return f"ai:{provider.lower()}:circuit_open_until"

    def _get_error_key(self, provider: str) -> str:
        return f"ai:{provider.lower()}:errors"

    def _get_token_usage_key(self, provider: str) -> str:
        # We track USAGE. Remaining = Limit - Usage.
        # This is robust against restarts.
        return f"ai:{provider.lower()}:tokens_usage:{time.strftime('%Y-%m-%d')}"

    def get_backoff_delay(self, attempt: int) -> float:
        # Exponential Backoff with Jitter.
        import random
        delay = min(60, (2 ** attempt))
        return delay + random.random()

    def check_circuit(self, provider: str) -> bool:
        """
        Returns True if call is allowed. Fails open on Redis errors.
        """
        key = self._get_circuit_key(provider)
        try:
            # Check if key exists (Circuit is OPEN)
            if redis_client.exists(key):
                logger.warning(f"🚫 Circuit Breaker OPEN for {provider}. Blocking calls.")
                return False
        except Exception as e:
            logger.error(f"⚠️ Redis error in check_circuit for {provider}: {e}")
        return True

    def can_execute(self, provider: str) -> bool:
        return self.check_circuit(provider)

    def record_failure(self, provider: str):
        self.record_error(provider, is_rate_limit=True)

    def reset_all_circuits(self):
        """
        Reset all circuits on service boot.
        This ensures clean state on startup.
        """
        providers = ["groq", "gemini", "mistral"]
        for provider in providers:
            try:
                redis_client.delete(self._get_circuit_key(provider))
                redis_client.delete(self._get_error_key(provider))
                logger.info(f"✅ Circuit RESET for {provider}")
            except Exception as e:
                logger.error(f"Failed to reset circuit for {provider}: {e}")

    def get_circuit_state(self, provider: str) -> str:
        """
        Returns the current circuit state: CLOSED or OPEN
        """
        key = self._get_circuit_key(provider)
        if redis_client.exists(key):
            return "OPEN"
        return "CLOSED"

    def record_success(self, provider: str):
        redis_client.delete(self._get_error_key(provider))
        logger.info(f"✅ {provider} success - error count reset")

    def record_error(self, provider: str, is_rate_limit: bool = True):
        """
        Record error. If threshold reached, Open Circuit.
        """
        try:
            if not is_rate_limit:
                return

            key_err = self._get_error_key(provider)
            errors = redis_client.incr(key_err)
            # 1 hour TTL for error count key itself, though logic resets on success
            redis_client.expire(key_err, 3600)

            logger.warning(f"⚠️ {provider} error count: {errors}/{self.circuit_breaker_threshold}")

            if errors >= self.circuit_breaker_threshold:
                logger.error(f"🔥 Circuit Breaker Triggered for {provider}! Opening for {self.circuit_window}s.")
                # Set circuit open key with TTL
                redis_client.setex(self._get_circuit_key(provider), self.circuit_window, "OPEN")
        except Exception as e:
            logger.error(f"Resilience Error: {e}")

    def is_retryable_error(self, error: Exception) -> bool:
        """
        Classify if error is retryable.
        ConnectionError, Timeout → retryable
        Invalid JSON → non-retryable
        """
        err_str = str(error).lower()

        # Retryable errors
        if "connection" in err_str or "timeout" in err_str or "timed out" in err_str:
            return True

        # Non-retryable errors
        if "json" in err_str or "parse" in err_str or "decode" in err_str:
            return False

        # Default to retryable for unknown errors
        return True

    def check_token_budget(self, provider: str, estimated_tokens: int) -> bool:
        """
        Returns True if budget allows for this provider.
        """
        key = self._get_token_usage_key(provider)
        used = int(redis_client.get(key) or 0)

        # Get Limit per provider (env var or default)
        # AI_GROQ_LIMIT, AI_GEMINI_LIMIT, etc.
        limit_env = f"AI_{provider.upper()}_LIMIT"
        limit = int(os.getenv(limit_env, self.daily_token_limit))

        remaining = limit - used
        if remaining < (estimated_tokens + self.token_safety_buffer):
            logger.warning(f"💰 Token Budget Exceeded for {provider}! Used: {used}/{limit}")
            return False
        return True

    def consume_tokens(self, provider: str, tokens: int):
        """
        Async increment token usage.
        """
        try:
            key = self._get_token_usage_key(provider)
            redis_client.incrby(key, tokens)
            redis_client.expire(key, 86400) # 24h
        except Exception as e:
            logger.error(f"Failed to record token usage: {e}")

    def get_all_stats(self) -> dict:
        """
        Returns stats for all providers: status, used tokens, limit, remaining.
        """
        providers = ["groq", "gemini", "mistral"]
        stats = {}
        for p in providers:
            usage_key = self._get_token_usage_key(p)
            used = int(redis_client.get(usage_key) or 0)

            limit_env = f"AI_{p.upper()}_LIMIT"
            limit = int(os.getenv(limit_env, self.daily_token_limit))

            stats[p] = {
                "status": self.get_circuit_state(p),
                "used": used,
                "limit": limit,
                "remaining": max(0, limit - used)
            }
        return stats

# Singleton
resilience_manager = AIResilienceManager()
