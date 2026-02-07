import asyncio
import json
import os
import redis.asyncio as redis
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

async def listen_to_redis():
    try:
        r = redis.from_url(REDIS_URL)
        pubsub = r.pubsub()
        await pubsub.subscribe("exam.submitted")

        print(f"✅ AI Service: Listening to Redis channel 'exam.submitted' on {REDIS_URL}")

        async for message in pubsub.listen():
            if message["type"] == "message":
                data = message["data"]
                print(f"📩 AI Service: Received event: {data}")
                # Placeholder for logic: Update User Weakness Profile / Update Global Difficulty Stats
                try:
                    event = json.loads(data)
                    user_id = event.get('user_id')
                    score = event.get('score')
                    print(f"🧠 AI Service: Analyzing long-term stats for user {user_id} with score {score}")
                except Exception as e:
                    print(f"❌ AI Service: Error processing message: {e}")
    except Exception as e:
        print(f"❌ AI Service: Redis connection failed: {e}")
