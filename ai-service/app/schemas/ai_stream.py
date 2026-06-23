from pydantic import BaseModel, Field
from typing import Optional, Any, Literal
from datetime import datetime
import uuid

EventType = Literal[
    "started",
    "progress",
    "retrieval_started",
    "retrieval_completed",
    "question_generated",
    "question_validated",
    "difficulty_scored",
    "bloom_scored",
    "analytics_generated",
    "recommendations_generated",
    "completed",
    "error"
]

class AIStreamEvent(BaseModel):
    eventId: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sessionId: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    type: EventType
    node: str
    progress: float
    payload: Optional[Any] = None
    error: Optional[str] = None
