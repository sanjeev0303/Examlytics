from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.services import reasoning

router = APIRouter()

class AnalysisRequest(BaseModel):
    examType: str
    difficulty: str
    topicStats: List[reasoning.TopicStats]

@router.post("/performance", response_model=reasoning.AnalysisResult)
async def analyze_performance(request: AnalysisRequest):
    return reasoning.analyze_performance(
        exam_type=request.examType,
        difficulty=request.difficulty,
        topic_stats=request.topicStats
    )
