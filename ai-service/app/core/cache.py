import os
import redis.asyncio as redis
from dotenv import load_dotenv

load_dotenv()

class RedisCache:
    _instance = None

    def __init__(self):
        self.redis = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = RedisCache()
        return cls._instance

    async def connect(self):
        if not self.redis:
            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
            # decode_responses=True ensures we get strings, not bytes
            self.redis = redis.from_url(redis_url, encoding="utf-8", decode_responses=True)
            print(f"✅ AI Service: Connected to Redis Cache at {redis_url}")

    async def close(self):
        if self.redis:
            await self.redis.close()
            self.redis = None

    async def get(self, key: str):
        if not self.redis:
            await self.connect()
        try:
            return await self.redis.get(key)
        except Exception as e:
            print(f"⚠️ Redis Cache Get Error: {e}")
            return None

    async def set(self, key: str, value: str, ttl: int = 3600):
        if not self.redis:
            await self.connect()
        try:
            await self.redis.set(key, value, ex=ttl)
        except Exception as e:
            print(f"⚠️ Redis Cache Set Error: {e}")

redis_cache = RedisCache.get_instance()
