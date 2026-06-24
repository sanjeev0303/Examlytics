#!/usr/bin/env python3
"""
Initialize Redis flags for AI service.
Run this after starting Redis to enable worker processing.
"""
import os
import redis
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "rediss://default:gQAAAAAAAR8VAAIgcDEwMDE1MTM2MDQ1NWI0MzRiYjkwMTBmMjc0MmFiYTNlYg@amazed-malamute-73493.upstash.io:6379")

def init_redis_flags():
    """Set required Redis flags for AI service operation"""
    try:
        r = redis.Redis.from_url(REDIS_URL, decode_responses=True)

        # Enable exam worker
        r.set("exam:worker:enabled", "true")
        print("✅ Set exam:worker:enabled = true")

        # Test connection
        r.ping()
        print("✅ Redis connection OK")

        print("\n🎉 Redis flags initialized successfully!")

    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nMake sure Redis is running and REDIS_URL is correct in .env")
        exit(1)

if __name__ == "__main__":
    init_redis_flags()
