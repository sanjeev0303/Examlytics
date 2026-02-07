from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class QuestionResult(BaseModel):
    question_id: str
    topic_id: str
    is_correct: bool
    time_spent: int # seconds
    difficulty: str

class ExamAnalysisRequest(BaseModel):
    session_id: str
    user_id: str
    total_questions: int
    results: List[QuestionResult]

class WeakTopic(BaseModel):
    topic_id: str = Field(alias="topic") # Alias for backwards compatibility if needed, but we want topic_id
    topic_name: Optional[str] = "Unknown"
    accuracy: float
    avg_time_spent: Optional[float] = 0.0
    reason: Optional[str] = None
    severity: str = "MEDIUM"

class ExamSummary(BaseModel):
    total_score: float
    accuracy: float
    time_analysis: Optional[str] = None

class QuestionAnalysis(BaseModel):
    question_id: str
    is_correct: bool
    score: float
    reasoning: Optional[str] = None
    ideal_time: Optional[int] = None

class TopicAnalysis(BaseModel):
    strengths: List[str] = []
    weaknesses: List[str] = []

class BehavioralInsights(BaseModel):
    consistency_score: Optional[float] = None
    guessing_probability: Optional[str] = None
    conceptual_clarity: Optional[str] = None

class ImprovementPlan(BaseModel):
    strategy: Optional[str] = None
    daily_plan: Optional[str] = None
    estimated_mastery_time: Optional[str] = None

class ExamAnalysisResponse(BaseModel):
    session_id: str
    exam_summary: Optional[ExamSummary] = None
    question_analysis: List[QuestionAnalysis] = []
    topic_analysis: Optional[TopicAnalysis] = None
    behavioral_insights: Optional[BehavioralInsights] = None
    weak_topics: List[WeakTopic] = []
    improvement_plan: Optional[ImprovementPlan] = None

    # Backwards compatibility fields
    improvement_recommendation: Optional[str] = None
    strong_topics: List[str] = []

class BlueprintRequest(BaseModel):
    weak_topic_ids: List[str] = []
    difficulty: Optional[str] = "MEDIUM"
    num_questions: int = 10
    exam_type: str = "JOB"

class QuestionCriteria(BaseModel):
    topic_id: str
    difficulty: str
    count: int

class ExamBlueprintResponse(BaseModel):
    criteria: List[QuestionCriteria]
