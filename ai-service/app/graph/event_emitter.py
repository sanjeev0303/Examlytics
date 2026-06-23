import json
import redis
import os
from typing import Dict, Any

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

class GraphEventEmitter:
    """Publishes node events to Redis pub/sub for SSE forwarding."""
    
    def __init__(self):
        try:
            self.redis = redis.Redis.from_url(REDIS_URL, decode_responses=True)
            self.redis.ping()
        except Exception as e:
            print(f"⚠️ GraphEventEmitter: Redis connection failed ({e}). Events will not be emitted.")
            self.redis = None

    def emit(self, session_id: str, event_type: str, data: Dict[str, Any] = None):
        """Emit a generic event to the session's stream channel."""
        if not self.redis:
            return
            
        channel = f"exam:stream:{session_id}"
        payload = {
            "type": event_type,
            "data": data or {}
        }
        
        try:
            self.redis.publish(channel, json.dumps(payload))
        except Exception as e:
            print(f"Error emitting event {event_type} to {channel}: {e}")

    def emit_progress(self, session_id: str, node: str, status: str, progress: float):
        """Emit a progress update for a specific node."""
        self.emit(session_id, "progress", {
            "node": node,
            "status": status,
            "progress": progress
        })

emitter = GraphEventEmitter()
