from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from uuid import UUID

class ExamHistoryItem(BaseModel):
    exam_id: str = Field(..., alias="examId")
    score: int
    topics: Dict[str, float] = {}

    class Config:
        populate_by_name = True

class BehaviorMetrics(BaseModel):
    avg_time_per_question: int = Field(60, alias="avgTimePerQuestion")
    guess_rate: float = Field(0.0, alias="guessRate")

    class Config:
        populate_by_name = True

class UserAIContextSchema(BaseModel):
    user_id: str = Field(..., alias="userId")
    exam_history: List[ExamHistoryItem] = Field(default_factory=list, alias="examHistory")
    topic_mastery: Dict[str, float] = Field(default_factory=dict, alias="topicMastery")
    mistake_patterns: List[str] = Field(default_factory=list, alias="mistakePatterns")
    behavior_metrics: BehaviorMetrics = Field(default_factory=BehaviorMetrics, alias="behaviorMetrics")

    class Config:
        populate_by_name = True

    def to_prompt_context(self) -> dict:
        """Formats context for LLM prompt injection."""
        weak_topics = [t for t, m in self.topic_mastery.items() if m < 0.6]
        strong_topics = [t for t, m in self.topic_mastery.items() if m >= 0.8]

        return {
            "user_level": self._infer_level(),
            "strong_topics": ", ".join(strong_topics) if strong_topics else "None",
            "weak_topics": ", ".join(weak_topics) if weak_topics else "None",
            "accuracy_history": self._format_history(),
            "avg_time": f"{self.behavior_metrics.avg_time_per_question}s",
            "mistake_patterns": ", ".join(self.mistake_patterns) if self.mistake_patterns else "None detected"
        }

    def _infer_level(self) -> str:
        if not self.topic_mastery:
            return "Beginner"
        avg = sum(self.topic_mastery.values()) / len(self.topic_mastery)
        if avg >= 0.8:
            return "Advanced"
        elif avg >= 0.5:
            return "Intermediate"
        return "Beginner"

    def _format_history(self) -> str:
        if not self.exam_history:
            return "N/A"
        recent = self.exam_history[-3:]
        return ", ".join([f"{e.score}%" for e in recent])
