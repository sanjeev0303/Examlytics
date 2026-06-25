from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Any, Optional

# --- Phase A: Canonical Structured Schemas ---

class QuestionOption(BaseModel):
    text: str = Field(description="The text of the option")
    is_correct: bool = Field(description="Whether this option is the correct answer")

class BloomTaxonomySchema(BaseModel):
    level: str = Field(description="Bloom's taxonomy level (e.g., Knowledge, Comprehension, Application, Analysis, Synthesis, Evaluation)")
    reasoning: str = Field(description="Why this question belongs to this level")

class DifficultyScoreSchema(BaseModel):
    difficulty_label: str = Field(description="Easy, Medium, or Hard")
    score: float = Field(description="A numeric difficulty score from 0.0 (easiest) to 1.0 (hardest)")
    reasoning: str = Field(description="Why this question is rated this difficulty")

class QuestionSchema(BaseModel):
    id: str = Field(description="Unique identifier for the question")
    type: str = Field(description="Question type: MCQ, SUBJECTIVE, etc.")
    question: str = Field(description="The actual question text")
    options: List[str] = Field(default_factory=list, description="List of possible options (strings)")
    correct_answer: str = Field(description="The correct answer text exactly matching one of the options")
    explanation: str = Field(description="Detailed explanation of the correct answer")
    difficulty: str = Field(description="Easy, Medium, Hard")
    topic: str = Field(description="The main topic this question tests")
    bloom_taxonomy: Optional[BloomTaxonomySchema] = None
    difficulty_score: Optional[DifficultyScoreSchema] = None

    @field_validator("options", mode="before")
    @classmethod
    def convert_options_to_list(cls, v):
        if isinstance(v, str):
            return [opt.strip() for opt in v.split(",") if opt.strip()]
        return v

class QuestionBatchSchema(BaseModel):
    questions: List[QuestionSchema] = Field(description="A list of generated questions")

class ValidationSchema(BaseModel):
    question_id: str = Field(description="The ID of the question being validated")
    is_valid: bool = Field(description="Whether the question is valid and well-formed")
    confidence: float = Field(description="Confidence score in the validation from 0.0 to 1.0")
    issues: List[str] = Field(default_factory=list, description="List of issues found, if any")
    corrected_question: Optional[QuestionSchema] = Field(default=None, description="The corrected question if issues were fixable")

    @field_validator("issues", mode="before")
    @classmethod
    def convert_issues_to_list(cls, v):
        if isinstance(v, str):
            return [v] if v.strip() else []
        return v

    @field_validator("corrected_question", mode="before")
    @classmethod
    def handle_empty_correction(cls, v):
        if isinstance(v, dict) and not v:
            return None
        return v


class WeakTopicSchema(BaseModel):
    topic_id: str = Field(description="Identifier for the topic")
    topic_name: str = Field(description="Name of the topic")
    accuracy: float = Field(description="User's accuracy in this topic from 0.0 to 1.0")
    severity: str = Field(description="Severity of the weakness: HIGH, MEDIUM, LOW")
    reason: str = Field(description="Reasoning for this weakness classification")

class RecommendationSchema(BaseModel):
    strategy: str = Field(description="The suggested strategy to improve")
    practice_days: int = Field(description="Recommended number of days to practice this strategy")
    focus_topics: List[str] = Field(description="Topics to focus on")

class AnalyticsSchema(BaseModel):
    strengths: List[str] = Field(description="Identified strong topics")
    weaknesses: List[str] = Field(description="Identified weak topics")
    weak_topics_details: List[WeakTopicSchema] = Field(default_factory=list, description="Detailed analysis of weak topics")
    recommendations: List[RecommendationSchema] = Field(default_factory=list, description="Improvement recommendations")

class ExamSchema(BaseModel):
    exam_id: str = Field(description="Unique identifier for the exam")
    questions: List[QuestionSchema] = Field(description="Questions in the exam")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Any additional metadata for the exam")

class QuestionAnalysisSchema(BaseModel):
    question_id: str = Field(description="The ID of the evaluated question")
    is_correct: bool = Field(description="Whether the user answered correctly")
    score: int = Field(description="Score awarded for the answer")
    reasoning: str = Field(description="Reasoning for the score")
    ideal_time: int = Field(description="Estimated ideal time in seconds to answer this question")

class BehavioralInsightsSchema(BaseModel):
    consistency_score: float = Field(description="User's consistency across similar questions (0.0 to 1.0)")
    guessing_probability: str = Field(description="Likelihood of guessing: HIGH, MEDIUM, LOW")
    conceptual_clarity: str = Field(description="Assessment of conceptual clarity: EXCELLENT, GOOD, POOR")

class ExamEvaluationSchema(BaseModel):
    correct_count: int = Field(description="Number of questions answered correctly")
    percentile: int = Field(description="Estimated percentile score (0-100)")
    exam_summary: Dict[str, Any] = Field(default_factory=dict, description="Overall summary metrics")
    question_analysis: List[QuestionAnalysisSchema] = Field(description="Per-question analysis")
    topic_analysis: List[Dict[str, Any]] = Field(description="Analysis aggregated by topic, requires 'topic', 'accuracy', 'strategy', 'practice_days'")
    behavioral_insights: BehavioralInsightsSchema = Field(description="Insights on user behavior")
    weak_topics: List[WeakTopicSchema] = Field(default_factory=list, description="Detailed weak topic breakdown")
    improvement_recommendation: str = Field(description="High-level recommendation paragraph")

class SemanticCheckSchema(BaseModel):
    is_semantically_correct: bool = Field(description="Whether the user's answer means the same thing as the correct answer")
    confidence: float = Field(description="Confidence in the semantic check from 0.0 to 1.0")
    reasoning: str = Field(description="Explanation of why it is or isn't semantically correct")
