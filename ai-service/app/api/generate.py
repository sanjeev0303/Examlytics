from fastapi import APIRouter
from app.schemas.analytics import BlueprintRequest, ExamBlueprintResponse, QuestionCriteria
from typing import List
import random

router = APIRouter()

@router.post("/generate-blueprint", response_model=ExamBlueprintResponse)
async def generate_blueprint(request: BlueprintRequest):
    criteria = []

    # Strategy 1: Improvement Exam (Focused on Weak Topics)
    if request.weak_topic_ids:
        # Distribute questions among weak topics
        num_topics = len(request.weak_topic_ids)
        base_count = request.num_questions // num_topics
        remainder = request.num_questions % num_topics

        for i, topic_id in enumerate(request.weak_topic_ids):
            count = base_count + (1 if i < remainder else 0)
            if count > 0:
                criteria.append(QuestionCriteria(
                    topic_id=topic_id,
                    difficulty="MEDIUM", # Lower difficulty to build confidence? Or Adaptive? Let's say MEDIUM for now.
                    count=count
                ))

    # Strategy 2: General/Standard Exam
    else:
        # Define topics based on exam type
        if request.exam_type == "JOB":
            type_topics = ["Arrays", "Strings", "Algorithms", "Data Structures"]
        elif request.exam_type == "CODING":
            type_topics = ["Algorithms", "Data Structures", "System Design"]
        elif request.exam_type == "APTITUDE":
            type_topics = ["Logical Reasoning", "Data Interpretation", "Quantitative Aptitude"]
        elif request.exam_type == "JEE":
            type_topics = ["Physics", "Chemistry", "Mathematics"]
        else:
            type_topics = ["Arrays", "Strings", "Logical Reasoning", "Data Interpretation"]  # Default

        questions_per_topic = request.num_questions // len(type_topics)
        remaining = request.num_questions % len(type_topics)

        for i, topic in enumerate(type_topics):
            count = questions_per_topic + (1 if i < remaining else 0)
            if count > 0:
                criteria.append(QuestionCriteria(
                    topic_id=topic,
                    difficulty=request.difficulty,
                    count=count
                ))

    return ExamBlueprintResponse(criteria=criteria)
