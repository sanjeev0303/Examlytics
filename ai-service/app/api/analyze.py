from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services import reasoning
from app.services.analytics.predictive_output import PredictiveOutputService
from app.db import SessionLocal
from sqlalchemy.orm import Session
from uuid import UUID

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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

@router.get("/projections/{user_id}")
async def get_projections(user_id: str, db: Session = Depends(get_db)):
    service = PredictiveOutputService(db)
    try:
        uid = UUID(user_id)
    except ValueError:
        return {"error": "Invalid user ID format"}

    return service.get_performance_projections(uid)
