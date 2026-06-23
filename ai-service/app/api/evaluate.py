from fastapi import APIRouter
from app.schemas.analytics import ExamAnalysisRequest, ExamAnalysisResponse, WeakTopic
from app.core.llm import generate_content_async
from collections import defaultdict
from pydantic import BaseModel
from typing import Dict
import json
import asyncio

router = APIRouter()

# --- Semantic Check Models ---
class SemanticRequest(BaseModel):
    question: str
    correctAnswer: str
    userAnswer: str

class SemanticResponse(BaseModel):
    isCorrect: bool
    confidence: float
    explanation: Dict[str, str]

# --- Helper: Semantic AI Evaluation ---
async def semantic_ai(payload: SemanticRequest) -> SemanticResponse:
    from langchain_core.prompts import ChatPromptTemplate
    from app.models.router import router
    from app.schemas.structured_schemas import SemanticCheckSchema
    
    llm = router.get_model("validation").with_structured_output(SemanticCheckSchema)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert technical interviewer. Decide whether the user's answer is semantically correct. Minor wording differences are allowed. If the core meaning matches, mark it correct. If partially correct, mark incorrect but with lower confidence (e.g. 0.5-0.7)."),
        ("user", f"Question:\n{payload.question}\n\nCorrect Answer:\n{payload.correctAnswer}\n\nUser Answer:\n{payload.userAnswer}")
    ])
    
    chain = prompt | llm
    try:
        res = await chain.ainvoke({})
        return SemanticResponse(
            isCorrect=res.is_semantically_correct,
            confidence=res.confidence,
            explanation={
                "whyUserAnswerIsWrong": res.reasoning if not res.is_semantically_correct else "",
                "whyCorrectAnswerIsRight": "It matches the core meaning." if res.is_semantically_correct else res.reasoning,
                "coreConcept": "N/A",
                "interviewTip": "N/A"
            }
        )
    except Exception as e:
        print(f"❌ Semantic AI Error: {e}")
        # Fallback to safe failure (Incorrect)
        return SemanticResponse(
            isCorrect=False,
            confidence=0.0,
            explanation={
                "whyUserAnswerIsWrong": "Analysis failed",
                "whyCorrectAnswerIsRight": "Please consult the correct answer.",
                "coreConcept": "N/A",
                "interviewTip": "N/A"
            }
        )

@router.post("/semantic-check", response_model=SemanticResponse)
async def semantic_check(payload: SemanticRequest):
    return await semantic_ai(payload)

TIMEOUT_SECONDS = 30  # Increased for LLM Operations

@router.post("/evaluate", response_model=ExamAnalysisResponse)
async def evaluate_submission(request: ExamAnalysisRequest):
    try:
        # Wait slightly less than the API timeout to allow for fallback
        api_timeout = TIMEOUT_SECONDS
        return await asyncio.wait_for(
            _process_evaluation(request),
            timeout=api_timeout
        )
    except asyncio.TimeoutError:
        print("⌛ AI Evaluation timed out. Falling back to deterministic logic.")
        # Create a mock valid response using only deterministic logic
        # We can simulate this by calling a fallback function or just letting the frontend handle it?
        # Better: Reuse the deterministic logic inside _process_evaluation by passing a flag or calling it directly.
        # But _process_evaluation is monolithic.
        # Let's refactor _process_evaluation to be cleaner?
        # For now, let's call a simplified version or just return the result of _process_evaluation_deterministic(request)
        return _process_evaluation_deterministic(request)
    except Exception as e:
         print(f"❌ Evaluation Error: {e}")
         return _process_evaluation_deterministic(request)

def _process_evaluation_deterministic(request: ExamAnalysisRequest) -> ExamAnalysisResponse:
    from app.schemas.analytics import WeakTopic
    from collections import defaultdict

    topic_stats = defaultdict(lambda: {"correct": 0, "total": 0, "total_time": 0})
    for res in request.results:
        topic_stats[res.topic_id]["total"] += 1
        topic_stats[res.topic_id]["total_time"] += res.time_spent
        if res.is_correct:
            topic_stats[res.topic_id]["correct"] += 1

    weak_topics = []
    strong_topics = []

    for topic_id, stats in topic_stats.items():
        if stats["total"] == 0:
            continue

        accuracy = (stats["correct"] / stats["total"]) * 100
        avg_time = stats["total_time"] / stats["total"]

        severity = None
        if accuracy < 40:
            severity = "HIGH"
        elif accuracy < 60:
            severity = "MEDIUM"
        elif avg_time > 120:
            severity = "LOW"

        if severity:
            weak_topics.append(WeakTopic(
                topic_id=topic_id,
                accuracy=round(accuracy, 2),
                avg_time_spent=round(avg_time, 2),
                severity=severity
            ))
        elif accuracy > 80:
            strong_topics.append(topic_id)

    # Sort weak topics
    severity_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    weak_topics.sort(key=lambda x: (severity_order.get(x.severity, 3), x.accuracy))

    return ExamAnalysisResponse(
        session_id=request.session_id,
        weak_topics=weak_topics,
        improvement_recommendation="Based on your performance, we recommend reviewing the weak topics listed.",
        strong_topics=strong_topics
    )

async def _process_evaluation(request: ExamAnalysisRequest) -> ExamAnalysisResponse:
    from app.core.llm import evaluate_exam_submission
    from app.db import SessionLocal
    from app.services.context_service import update_context_after_exam
    from uuid import UUID

    # Run AI Evaluation
    ai_result = await evaluate_exam_submission(request.dict())

    if ai_result:
        # Map AI result to Pydantic model
        weak_topics_list = []
        for wt in ai_result.get("weak_topics", []):
             # AI might return strings or dicts, handle simplification
             if isinstance(wt, str):
                 weak_topics_list.append(WeakTopic(topic_id=wt, accuracy=0, avg_time_spent=0, severity="MEDIUM"))
             elif isinstance(wt, dict):
                 # Ensure we map fields if names differ, though we aligned them
                 # AI returns topic_id, topic_name, accuracy, severity, reason
                 # Schema expects: topic_id (alias topic), topic_name, accuracy, avg_time_spent, reason, severity
                 wt_data = wt.copy()
                 if "topic_id" in wt_data:
                     wt_data["topic"] = wt_data.pop("topic_id") # Map to alias if needed by pydantic, or just pass as topic_id if allow_population_by_field_name is on.
                     # Actually, since we used Field(alias="topic"), we should pass "topic" as key OR enable allow_population_by_field_name config in Pydantic.
                     # Safest is to pass "topic"

                 weak_topics_list.append(WeakTopic(**wt_data))

        # Update User AI Context
        try:
            db = SessionLocal()
            request_data = request.dict()
            print(f"📝 Processing User ID: {request_data.get('user_id')} for Session: {request.session_id}")

            topic_scores = {res.topic_id: 100 if res.is_correct else 0 for res in request.results}
            score = int((sum(1 for r in request.results if r.is_correct) / len(request.results)) * 100) if request.results else 0

            uid_str = request_data.get("user_id")
            if uid_str:
                update_context_after_exam(db, UUID(uid_str), request.session_id, score, topic_scores)
            else:
                print("⚠️ User ID missing in request data, skipping context update.")

            db.close()
        except Exception as e:
            print(f"⚠️ Failed to update user context: {e}")

        return ExamAnalysisResponse(
            session_id=request.session_id,
            weak_topics=weak_topics_list,
            improvement_recommendation=ai_result.get("improvement_recommendation"),
            strong_topics=ai_result.get("strong_topics", [])
        )

    # Fallback to local logic
    print("⚠️ AI Evaluation failed, falling back to deterministic logic.")
    topic_stats = defaultdict(lambda: {"correct": 0, "total": 0, "total_time": 0})

    for res in request.results:
        topic_stats[res.topic_id]["total"] += 1
        topic_stats[res.topic_id]["total_time"] += res.time_spent
        if res.is_correct:
            topic_stats[res.topic_id]["correct"] += 1

    weak_topics = []
    strong_topics = []

    for topic_id, stats in topic_stats.items():
        if stats["total"] == 0:
            continue

        accuracy = (stats["correct"] / stats["total"]) * 100
        avg_time = stats["total_time"] / stats["total"]

        severity = None
        if accuracy < 40:
            severity = "HIGH"
        elif accuracy < 60:
            severity = "MEDIUM"
        elif avg_time > 120: # Taking too long (> 2 mins per question)
            severity = "LOW"

        if severity:
            weak_topics.append(WeakTopic(
                topic_id=topic_id,
                accuracy=round(accuracy, 2),
                avg_time_spent=round(avg_time, 2),
                severity=severity
            ))
        elif accuracy > 80:
            strong_topics.append(topic_id)

    # Sort weak topics: High severity first, then lowest accuracy
    severity_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    weak_topics.sort(key=lambda x: (severity_order.get(x.severity, 3), x.accuracy))

    # FAILSAFE: If score is low (< 70%) but no weak topics found (e.g. distributed mistakes),
    # force add the worst performing topics.
    total_score = sum(s["correct"] for s in topic_stats.values())
    total_q = sum(s["total"] for s in topic_stats.values())
    overall_acc = (total_score / total_q * 100) if total_q > 0 else 0

    if not weak_topics and overall_acc < 70:
        print("⚠️ Low score but no weak topics. Forcing topics.")
        # Find worst topics (accuracy < 70)
        sorted_stats = sorted(topic_stats.items(), key=lambda item: (item[1]["correct"] / item[1]["total"] if item[1]["total"] > 0 else 0))
        for topic_id, stats in sorted_stats:
            acc = (stats["correct"] / stats["total"] * 100) if stats["total"] > 0 else 0
            if acc < 70:
                weak_topics.append(WeakTopic(
                    topic_id=topic_id,
                    accuracy=round(acc, 2),
                    avg_time_spent=round(stats["total_time"] / stats["total"], 2) if stats["total"] else 0,
                    severity="HIGH" if acc < 40 else "MEDIUM"
                ))
        # Re-sort
        weak_topics.sort(key=lambda x: (severity_order.get(x.severity, 3), x.accuracy))

    recommendation = "Great job! Keep practicing."
    if weak_topics:
        primary_weakness = weak_topics[0]
        recommendation = f"Your performance in {primary_weakness.topic_id} needs improvement (Accuracy: {primary_weakness.accuracy}%). We recommend taking a focused exam on this topic."

    return ExamAnalysisResponse(
        session_id=request.session_id,
        weak_topics=weak_topics,
        improvement_recommendation=recommendation,
        strong_topics=strong_topics
    )
