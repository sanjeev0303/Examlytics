from fastapi import APIRouter, HTTPException
from app.schemas.exam_schemas import (
    ExamGenerateRequest, ExamGenerateResponse, QuestionItem,
    ExamSubmitRequest, ExamSubmitResponse,
    ExamAnalyzeRequest, ExamAnalyzeResponse, SummaryResult, TopicAnalysisItem, ImprovementItem
)
from app.db import SessionLocal
from app.models.db_models import ExamSession, UserAIContext
from app.services.context_service import get_user_context, update_context_after_exam
from app.core.llm import generate_exam_content, evaluate_exam_submission
from uuid import UUID, uuid4
import json
import asyncio

router = APIRouter()

# --- 1. Generate Exam ---

@router.post("/generate", response_model=ExamGenerateResponse)
async def generate_exam(request: ExamGenerateRequest):
    """
    Generate an exam using AI + UserAIContext.
    Smart Caching: Redis -> DB -> AI
    Cost Control: Daily Limits
    """
    from app.services.cache_service import CacheService
    from app.services.cost_tracker import tracker, COST_GENERATION

    db = SessionLocal()
    try:
        user_id = UUID(request.user_id)

        # 1. Cost Check
        if not tracker.check_limit(request.user_id, COST_GENERATION):
             # Hard stop for now, could downgrade to cached-only or simplified mode
             raise HTTPException(status_code=429, detail="Daily AI limit exceeded. Please upgrade limit.")

        # 2. Fetch user context & Calculate Cache Hash
        user_ctx = get_user_context(db, user_id)
        prompt_context = user_ctx.to_prompt_context() if user_ctx else {
            "user_level": "Beginner",
            "strong_topics": "None",
            "weak_topics": "None",
            "accuracy_history": "N/A",
            "avg_time": "N/A",
            "mistake_patterns": "None detected"
        }

        user_level = prompt_context.get("user_level", "Beginner")
        topics_str = ", ".join(request.topics) if request.topics else "General"

        # Custom fields for hash
        custom_params = []
        if request.language: custom_params.append(f"lang:{request.language}")
        if request.job_category: custom_params.append(f"job:{request.job_category}")
        if request.subjects: custom_params.append(f"subj:{'-'.join(sorted(request.subjects))}")

        custom_str = "|".join(custom_params)

        exam_hash = CacheService._generate_exam_hash(
            request.exam_type,
            "MEDIUM",
            topics_str + ("|" + custom_str if custom_str else ""),
            user_level
        )

        # 3. Cache Check
        cached_questions = CacheService.get_cached_exam(db, exam_hash)
        if cached_questions:
             # Create session from cache
             print("⚡ Reusing cached questions")
             exam_id = str(uuid4())
             session = ExamSession(
                id=exam_id,
                user_id=user_id,
                type=request.exam_type,
                topic_id=topics_str,
                total_questions=len(cached_questions),
                status="READY",
                questions=cached_questions,
                cache_hash=exam_hash
             )
             db.add(session)
             db.commit()

             return ExamGenerateResponse(
                examId=exam_id,
                questions=[QuestionItem(
                    id=q.get("id", f"Q{i+1}"),
                    text=q.get("question") or q.get("problem_statement", ""),
                    options=q.get("options", []),
                    type=q.get("type", "MCQ"),
                    difficulty=q.get("difficulty", "MEDIUM"),
                    topic=q.get("topic")
                ) for i, q in enumerate(cached_questions)],
                timeLimit=len(cached_questions) * 120
             )

        # 4. Generate via AI (Cache Miss)
        preferences = {
            "type": request.exam_type,
            "mode": request.mode,
            "question_count": request.question_count,
            "difficulty": "MEDIUM",
            "topic_id": topics_str,
            "language": request.language,
            "job_category": request.job_category,
            "subjects": request.subjects
        }

        from app.graph.builder import build_exam_generation_graph
        graph = build_exam_generation_graph()
        initial_state = {
            "session_id": str(uuid4()),
            "user_id": str(user_id),
            "thread_id": str(uuid4()),
            "exam_type": request.exam_type,
            "preferences": preferences,
            "retrieved_docs": [],
            "expanded_queries": [],
            "compressed_context": [],
            "generated_questions": [],
            "validated_questions": [],
            "difficulty_scores": [],
            "bloom_scores": [],
            "weak_topics": [],
            "recommendations": [],
            "events": [],
            "confidence_scores": [],
            "should_regenerate": False,
            "analytics": {},
            "metadata": {},
            "token_usage": {},
            "streaming_status": "started",
            "error": None,
            "retry_count": 0,
            "cache_hit": False,
            "cache_key": exam_hash
        }
        
        exam_id = initial_state["session_id"]
        
        # Create a placeholder session in DB
        session = ExamSession(
            id=exam_id,
            user_id=user_id,
            type=request.exam_type,
            topic_id=topics_str,
            total_questions=request.question_count,
            status="GENERATING",
            questions=[],
            cache_hash=exam_hash
        )
        db.add(session)
        db.commit()
        
        # Run graph in background
        async def run_graph_task():
            try:
                final_state = await graph.ainvoke(initial_state)
                questions_data = final_state.get("validated_questions", []) or final_state.get("generated_questions", [])
                
                # Update DB session
                db_bg = SessionLocal()
                try:
                    sess = db_bg.query(ExamSession).filter(ExamSession.id == exam_id).first()
                    if sess:
                        sess.questions = questions_data
                        sess.status = "READY"
                        db_bg.commit()
                finally:
                    db_bg.close()
                    
            except Exception as e:
                print(f"Graph execution failed: {e}")
                
        asyncio.create_task(run_graph_task())
        
        return ExamGenerateResponse(
            examId=exam_id,
            questions=[], # Questions will stream
            timeLimit=request.question_count * 120
        )

    finally:
        db.close()

# --- 2. Submit Exam ---

@router.post("/submit", response_model=ExamSubmitResponse)
async def submit_exam(request: ExamSubmitRequest):
    """
    Store user responses for later evaluation.
    """
    db = SessionLocal()
    try:
        session = db.query(ExamSession).filter(ExamSession.id == request.exam_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Exam session not found")

        # Store responses in session
        session.user_responses = [r.model_dump(by_alias=True) for r in request.responses]
        session.status = "SUBMITTED"
        db.commit()

        return ExamSubmitResponse(success=True, message="Exam submitted successfully")

    finally:
        db.close()

# --- 3. Analyze Exam ---

@router.post("/analyze", response_model=ExamAnalyzeResponse)
async def analyze_exam(request: ExamAnalyzeRequest):
    """
    Run AI evaluation and return analytics + improvement plan.
    Includes Caching & Cost Tracking.
    """
    from app.services.cache_service import CacheService
    from app.services.cost_tracker import tracker, COST_ANALYTICS

    db = SessionLocal()
    try:
        # Check Cache First
        cached_result = CacheService.get_cached_analytics(request.exam_id, request.user_id)

        # If not in Redis, check DB column (fallback)
        session = db.query(ExamSession).filter(ExamSession.id == request.exam_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Exam session not found")

        if not cached_result and session.cached_analysis:
             print("🐢 Cache Hit (DB): Analytics")
             cached_result = session.cached_analysis
             # Re-populate Redis
             CacheService.cache_analytics(request.exam_id, request.user_id, cached_result)

        if cached_result:
             # Return cached result (mapped to response model)
             ai_result = cached_result
             score = session.score
             accuracy = session.accuracy / 100.0 if session.accuracy else 0
             # Reconstruct response logic below...
        else:
             # Cost Check
             if not tracker.check_limit(request.user_id, COST_ANALYTICS):
                 raise HTTPException(status_code=429, detail="Daily AI limit exceeded.")

             questions = session.questions or []
             responses = getattr(session, 'user_responses', []) or []

             # Build submission data for AI
             submission_data = {
                 "session_id": request.exam_id,
                 "questions": questions,
                 "responses": responses
             }

             # Run AI evaluation
             ai_result = await evaluate_exam_submission(submission_data)

             if not ai_result:
                 raise HTTPException(status_code=500, detail="AI evaluation failed")

             # Track Cost
             tracker.track_usage(request.user_id, COST_ANALYTICS)

             # Cache Result
             CacheService.cache_analytics(request.exam_id, request.user_id, ai_result)
             session.cached_analysis = ai_result # DB Fallback

        # Calculate score (re-run logic or use session if cached)
        # Note: If cached, session score is already set. If new, we calculate.

        if not cached_result:
            total = len(session.questions or [])
            correct = ai_result.get("correct_count", 0)
            score = int((correct / total) * 100) if total > 0 else 0
            accuracy = correct / total if total > 0 else 0
        else:
            score = session.score
            accuracy = float(session.accuracy) / 100.0

        # ... (rest of logic map to response)

        # Build topic analysis
        topic_analysis = {}
        weak_topics = []
        improvement_plan = {}

        for topic_data in ai_result.get("topic_analysis", []):
            topic_name = topic_data.get("topic", "Unknown")
            topic_acc = topic_data.get("accuracy", 0)
            status = "Weak" if topic_acc < 60 else ("Strong" if topic_acc >= 80 else "Average")

            topic_analysis[topic_name] = TopicAnalysisItem(accuracy=topic_acc, status=status)

            if status == "Weak":
                weak_topics.append(topic_name)
                improvement_plan[topic_name] = ImprovementItem(
                    strategy=topic_data.get("strategy", f"Focus on {topic_name} fundamentals"),
                    practiceDays=topic_data.get("practice_days", 5)
                )

        # Update user context
        topic_scores = {t: d.accuracy for t, d in topic_analysis.items()}
        update_context_after_exam(db, UUID(request.user_id), request.exam_id, score, topic_scores)

        # Update session
        session.score = score
        session.accuracy = int(accuracy * 100)
        session.status = "COMPLETED"
        db.commit()

        return ExamAnalyzeResponse(
            summary=SummaryResult(
                score=score,
                accuracy=accuracy,
                estimatedPercentile=ai_result.get("percentile", 50)
            ),
            topicAnalysis=topic_analysis,
            weakTopics=weak_topics,
            improvementPlan=improvement_plan
        )

    finally:
        db.close()
