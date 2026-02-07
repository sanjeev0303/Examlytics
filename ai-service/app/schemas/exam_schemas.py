from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from uuid import UUID

# --- Generate Exam ---

class DifficultyConfig(BaseModel):
    easy: int = 30
    medium: int = 50
    hard: int = 20

class ExamGenerateRequest(BaseModel):
    user_id: str = Field(..., alias="userId")
    exam_type: str = Field(..., alias="examType")
    mode: str = "Mixed"
    question_count: int = Field(15, alias="questionCount")
    difficulty: DifficultyConfig = Field(default_factory=DifficultyConfig)
    topics: List[str] = []

    class Config:
        populate_by_name = True

class QuestionItem(BaseModel):
    id: str
    text: str
    options: List[str] = []
    type: str = "MCQ"
    difficulty: str = "MEDIUM"
    topic: Optional[str] = None

class ExamGenerateResponse(BaseModel):
    exam_id: str = Field(..., alias="examId")
    questions: List[QuestionItem]
    time_limit: int = Field(1800, alias="timeLimit")

    class Config:
        populate_by_name = True

# --- Submit Exam ---

class ResponseItem(BaseModel):
    question_id: str = Field(..., alias="questionId")
    answer: str

    class Config:
        populate_by_name = True

class ExamSubmitRequest(BaseModel):
    exam_id: str = Field(..., alias="examId")
    user_id: str = Field(..., alias="userId")
    responses: List[ResponseItem]

    class Config:
        populate_by_name = True

class ExamSubmitResponse(BaseModel):
    success: bool = True
    message: str = "Exam submitted successfully"

# --- Analyze Exam ---

class ExamAnalyzeRequest(BaseModel):
    exam_id: str = Field(..., alias="examId")
    user_id: str = Field(..., alias="userId")

    class Config:
        populate_by_name = True

class SummaryResult(BaseModel):
    score: int
    accuracy: float
    estimated_percentile: int = Field(0, alias="estimatedPercentile")

    class Config:
        populate_by_name = True

class TopicAnalysisItem(BaseModel):
    accuracy: int
    status: str  # "Weak", "Strong", "Average"

class ImprovementItem(BaseModel):
    strategy: str
    practice_days: int = Field(5, alias="practiceDays")

    class Config:
        populate_by_name = True

class ExamAnalyzeResponse(BaseModel):
    summary: SummaryResult
    topic_analysis: Dict[str, TopicAnalysisItem] = Field(default_factory=dict, alias="topicAnalysis")
    weak_topics: List[str] = Field(default_factory=list, alias="weakTopics")
    improvement_plan: Dict[str, ImprovementItem] = Field(default_factory=dict, alias="improvementPlan")

    class Config:
        populate_by_name = True
