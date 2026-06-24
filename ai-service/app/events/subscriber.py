import asyncio
import json
import os
import redis.asyncio as redis
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "rediss://default:gQAAAAAAAR8VAAIgcDEwMDE1MTM2MDQ1NWI0MzRiYjkwMTBmMjc0MmFiYTNlYg@amazed-malamute-73493.upstash.io:6379")

async def listen_to_redis():
    r = None
    pubsub = None
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
    except asyncio.CancelledError:
        print("🔄 AI Service: Redis listener shutting down gracefully...")
        raise
    except Exception as e:
        print(f"❌ AI Service: Redis connection failed: {e}")
    finally:
        if pubsub:
            await pubsub.unsubscribe("exam.submitted")
            await pubsub.close()
        if r:
            await r.close()
