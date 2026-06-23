from fastapi import APIRouter, Request
from sse_starlette.sse import EventSourceResponse
import asyncio
import json
import redis.asyncio as redis
import os

router = APIRouter()
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

@router.get("/v2/events/{session_id}")
async def stream_events(request: Request, session_id: str):
    """
    Subscribes to Redis pub/sub for the given session_id
    and yields Server-Sent Events (SSE).
    """
    async def event_generator():
        r = redis.from_url(REDIS_URL, decode_responses=True)
        pubsub = r.pubsub()
        channel = f"exam:stream:{session_id}"
        await pubsub.subscribe(channel)
        
        try:
            async for message in pubsub.listen():
                if await request.is_disconnected():
                    break
                    
                if message["type"] == "message":
                    data_str = message["data"]
                    try:
                        data = json.loads(data_str)
                        event_type = data.get("type", "message")
                        yield {
                            "event": event_type,
                            "data": json.dumps(data.get("data", {}))
                        }
                        
                        if event_type == "completed":
                            break
                    except json.JSONDecodeError:
                        yield {"data": data_str}
        finally:
            await pubsub.unsubscribe(channel)
            await r.close()
            
    return EventSourceResponse(event_generator())
