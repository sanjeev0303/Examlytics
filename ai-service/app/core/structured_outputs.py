# This file is a shim for backward compatibility.
# The canonical schemas are now in app.schemas.structured_schemas

from app.schemas.structured_schemas import (
    QuestionOption,
    QuestionSchema as GeneratedQuestion,
    QuestionBatchSchema as ExamGenerationOutput,
    QuestionAnalysisSchema as QuestionAnalysis,
    WeakTopicSchema as WeakTopic,
    BehavioralInsightsSchema as BehavioralInsights,
    ExamEvaluationSchema as ExamEvaluationOutput,
)
from pydantic import BaseModel
from typing import List

# Keep TopicAnalysis exact structure for backward compatibility if imported elsewhere
class TopicAnalysis(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
