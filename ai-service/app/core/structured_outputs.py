from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class QuestionOption(BaseModel):
    text: str
    is_correct: bool

class GeneratedQuestion(BaseModel):
    id: str
    type: str = Field(description="MCQ or SUBJECTIVE")
    question: str
    options: List[str] = Field(default_factory=list)
    correct_answer: str
    explanation: str
    difficulty: str = Field(description="Easy, Medium, Hard")
    topic: str

class ExamGenerationOutput(BaseModel):
    questions: List[GeneratedQuestion]

class QuestionAnalysis(BaseModel):
    question_id: str
    is_correct: bool
    score: int
    reasoning: str
    ideal_time: int

class TopicAnalysis(BaseModel):
    strengths: List[str]
    weaknesses: List[str]

class WeakTopic(BaseModel):
    topic_id: str
    topic_name: str
    accuracy: float
    severity: str = Field(description="HIGH, MEDIUM, LOW")
    reason: str

class BehavioralInsights(BaseModel):
    consistency_score: float
    guessing_probability: str
    conceptual_clarity: str

class ExamEvaluationOutput(BaseModel):
    exam_summary: Dict[str, Any]
    question_analysis: List[QuestionAnalysis]
    topic_analysis: TopicAnalysis
    behavioral_insights: BehavioralInsights
    weak_topics: List[WeakTopic]
    improvement_recommendation: str
