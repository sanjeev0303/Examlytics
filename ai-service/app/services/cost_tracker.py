import os
import redis
from datetime import datetime, timedelta

# Usage Limits
LIMIT_FREE = 50   # 50 logic units (approx 3 exams)
LIMIT_PAID = 500  # 500 logic units

# Cost Weights
COST_GENERATION = 15 # Expensive
COST_EVALUATION = 5  # Moderate
COST_ANALYTICS = 10  # Moderate

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

class CostTracker:
    def __init__(self):
        try:
            self.redis = redis.Redis.from_url(REDIS_URL, decode_responses=True)
        except:
            self.redis = None

    def _get_key(self, user_id: str) -> str:
        today = datetime.utcnow().strftime("%Y-%m-%d")
        return f"ai:cost:{user_id}:{today}"

    def check_limit(self, user_id: str, cost: int) -> bool:
        """
        Checks if user has enough budget for operation.
        Returns True if allowed.
        """
        if not self.redis:
            return True # Fail open if Redis down

        key = self._get_key(user_id)
        current = int(self.redis.get(key) or 0)

        # User Tier Logic (Mock - assume everyone is Free for now unless tagged)
        limit = LIMIT_FREE

        if current + cost > limit:
            return False
        return True

    def track_usage(self, user_id: str, cost: int):
        """
        Increments usage counter.
        """
        if not self.redis:
            return

        key = self._get_key(user_id)
        pipe = self.redis.pipeline()
        pipe.incrby(key, cost)
        pipe.expire(key, 86400) # 24h TTL
        pipe.execute()

    def get_tier_allowance(self, user_id: str):
        # Placeholder for real tier check
        return "FREE"

tracker = CostTracker()
