import asyncio
import json
import os
from dotenv import load_dotenv

load_dotenv()

import redis
import time
import random
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db import SessionLocal
from app.models.db_models import ExamSession, Question, Topic, UserWeakTopic
from app.schemas.analytics import BlueprintRequest, QuestionCriteria

# Redis Setup
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
r = redis.Redis.from_url(REDIS_URL)

QUEUE_NAME = "queue:exam_generation_v2"
QUEUE_SUBMISSION = "queue:exam_submission_v2"
QUEUE_DELAYED = "queue:exam_delayed" # Keep delayed same for now or change to v2 if needed

def validate_job(job: dict) -> tuple[bool, str]:
    """
    Validate job structure and origin.
    Returns: (is_valid, reason)
    """
    # Check required fields
    required_fields = ["jobId", "userId", "source", "createdAt"]
    for field in required_fields:
        if field not in job:
            return False, f"Missing required field: {field}"

    # Validate source is from client
    allowed_sources = ["client", "load_test"]
    if job.get("source") not in allowed_sources:
        return False, f"Invalid source: {job.get('source')} (must be in {allowed_sources})"

    # Check if job is stale (older than 24 hours)
    try:
        created_at = float(job.get("createdAt", job.get("created_at", 0)))
        if created_at == 0: # Handle explicit 0 or missing key default
             created_at = time.time()
    except (ValueError, TypeError):
         created_at = time.time() # Default to now if invalid
         print(f"⚠️ Warning: Invalid created_at for job {job.get('jobId')}, treating as fresh.")

    job_age = time.time() - created_at
    if job_age > 86400:  # 24 hours
        return False, f"Stale job: {job_age/3600:.1f} hours old"

    return True, "valid"

def log_to_file(msg):
    with open("/tmp/worker.log", "a") as f:
        f.write(f"[{time.ctime()}] {msg}\n")

def start_worker():
    log_to_file("👷 Worker starting...")
    try:
        host = r.connection_pool.connection_kwargs.get("host")
        log_to_file(f"🌐 Redis Host: {host}")
        log_to_file(f"🔗 Redis URL (Start): {REDIS_URL[:20]}...")
        if r.ping():
            log_to_file("✅ Redis Ping Successful")
        else:
            log_to_file("❌ Redis Ping Failed")
    except Exception as e:
        log_to_file(f"❌ Redis Connection Diagnostic Error: {str(e)}")

    print(f"👷 Exam Worker: Listening on {QUEUE_NAME}...")

    # Start delayed job processor in bg thread
    import threading
    threading.Thread(target=process_delayed_jobs, daemon=True).start()

    log_to_file(f"Listening on {QUEUE_NAME}")

    while True:
        try:
            # Check if worker is enabled via Redis flag
            worker_enabled = r.get("exam:worker:enabled")

            if worker_enabled and (worker_enabled == b"true" or worker_enabled == "true"):
                pass
            else:
                time.sleep(1)
                continue

            # Blocking Pop from Main Queues (Priority: Submission > Generation)
            result = r.blpop(QUEUE_SUBMISSION, timeout=1)
            if result:
                _, data = result
                job = json.loads(data)
                process_submission_job(job)
                continue

            # If no submission, check generation
            result = r.blpop(QUEUE_NAME, timeout=1)
            if not result:
                continue

            _, data = result
            log_to_file(f"🚀 Popped GENERATION (v2): {data[:50]}")
            job = json.loads(data)
            # Standardize for process_job
            if "jobId" not in job and "job_id" in job:
                job["jobId"] = job["job_id"]
            process_job(job)

        except Exception as e:
            log_to_file(f"❌ Loop Error: {str(e)}")
            time.sleep(1)

# Track discarded jobs to prevent log spam
_discarded_jobs = set()

# Maximum retries for any job
MAX_RETRIES = 3

def cleanup_delayed_queue():
    """
    One-time cleanup of delayed queue on startup.
    Removes all invalid/orphan jobs permanently.
    """
    print(f"🧹 Running delayed queue cleanup...")
    try:
        # Get all jobs from delayed queue
        all_delayed = r.zrange(QUEUE_DELAYED, 0, -1)

        removed_count = 0
        for job_data in all_delayed:
            if isinstance(job_data, bytes):
                job_data = job_data.decode('utf-8')

            try:
                job = json.loads(job_data)
                job_id = job.get('job_id', 'unknown')

                # Validate job
                is_valid, reason = validate_job(job)

                # Check retry count
                retry_count = job.get('retry_count', 0)

                if not is_valid or retry_count >= MAX_RETRIES:
                    # Permanently remove invalid/exhausted jobs
                    r.zrem(QUEUE_DELAYED, job_data)
                    removed_count += 1

                    if job_id not in _discarded_jobs:
                        _discarded_jobs.add(job_id)
                        if not is_valid:
                            print(f"🗑️  Cleanup: Removed invalid job {job_id} - {reason}")
                        else:
                            print(f"🗑️  Cleanup: Removed exhausted job {job_id} - retry_count={retry_count}")

            except json.JSONDecodeError:
                # Malformed JSON - remove it
                r.zrem(QUEUE_DELAYED, job_data)
                removed_count += 1
                print(f"🗑️  Cleanup: Removed malformed job data")

        print(f"✅ Delayed queue cleanup complete. Removed {removed_count} invalid/stale jobs")

    except Exception as e:
        print(f"❌ Delayed queue cleanup error: {e}")

def process_delayed_jobs():
    """
    Poller for delayed jobs (ZSET).
    Validates jobs BEFORE re-queueing to prevent infinite loops.
    """
    print(f"⏰ Delayed Job Processor Started on {QUEUE_DELAYED}")

    # Run cleanup once on startup
    cleanup_delayed_queue()

    while True:
        try:
            # Check if worker is enabled
            worker_enabled = r.get("exam:worker:enabled")
            if worker_enabled != b"true" and worker_enabled != "true":
                time.sleep(5)
                continue

            now = time.time()
            # Fetch jobs with score <= now (jobs whose delay has expired)
            jobs = r.zrangebyscore(QUEUE_DELAYED, 0, now)

            for job_data in jobs:
                if isinstance(job_data, bytes):
                    job_data = job_data.decode('utf-8')

                try:
                    # Parse job
                    job = json.loads(job_data)
                    job_id = job.get('job_id', 'unknown')

                    # CRITICAL: Validate job BEFORE re-queueing
                    is_valid, reason = validate_job(job)

                    # Check retry count
                    retry_count = job.get('retry_count', 0)

                    if not is_valid:
                        # PERMANENTLY remove invalid jobs - DO NOT re-queue
                        r.zrem(QUEUE_DELAYED, job_data)

                        # Log only once per job_id
                        if job_id not in _discarded_jobs:
                            _discarded_jobs.add(job_id)
                            print(f"🗑️  Discarded invalid delayed job {job_id}: {reason}")

                        continue  # Skip to next job

                    if retry_count >= MAX_RETRIES:
                        # Job has exhausted retries - mark as failed_permanent
                        r.zrem(QUEUE_DELAYED, job_data)

                        if job_id not in _discarded_jobs:
                            _discarded_jobs.add(job_id)
                            print(f"❌ Job {job_id} failed permanently after {retry_count} retries")

                        # TODO: Update job status in DB to 'FAILED'
                        continue

                    # Job is valid and has retries remaining - re-queue to main queue
                    print(f"🔄 Re-queuing valid delayed job {job_id} (retry {retry_count}/{MAX_RETRIES})")
                    r.rpush(QUEUE_NAME, job_data)

                    # Remove from delayed queue
                    r.zrem(QUEUE_DELAYED, job_data)

                except json.JSONDecodeError:
                    # Malformed job - remove permanently
                    r.zrem(QUEUE_DELAYED, job_data)
                    print(f"🗑️  Removed malformed job from delayed queue")
                except Exception as e:
                    print(f"❌ Error processing delayed job: {e}")
                    # Remove problematic job to prevent infinite loop
                    r.zrem(QUEUE_DELAYED, job_data)

            time.sleep(5)  # Poll interval

        except Exception as e:
            print(f"❌ Delayed Processor Error: {e}")
            time.sleep(5)

def process_job(job):
    session_id = job.get("jobId") or job.get("job_id")
    preferences = job.get("preferences", {})

    db: Session = SessionLocal()
    try:
        # 1. Fetch Session & Update Status (with retry for race conditions)
        session = None
        log_to_file(f"Looking for session {session_id}")
        for attempt in range(5):
            session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
            if session:
                break
            log_to_file(f"Session {session_id} not found, retry {attempt+1}")
            time.sleep(1)

        if not session:
            log_to_file(f"❌ Session {session_id} NOT FOUND")
            # Update Redis to reflect failure so UI stops waiting
            r.set(f"job:{session_id}", json.dumps({
                "jobId": session_id,
                "status": "FAILED",
                "error": "Session not found in shared database"
            }), ex=3600)
            return

        log_to_file(f"Session {session_id} found. Status -> PROCESSING")
        session.status = "PROCESSING"
        db.commit()
        db.refresh(session)

        # Update Redis job status for polling/initial state
        r.set(f"job:{session_id}", json.dumps({
            "jobId": session_id,
            "status": "PROCESSING",
            "sessionId": session_id
        }), ex=3600)

        # Publish PROCESSING immediately to move UI past PENDING
        r.publish(f"exam:stream:{session_id}", json.dumps({
            "type": "status",
            "status": "PROCESSING",
            "jobId": session_id,
            "message": "Worker active: Preparing AI context..."
        }))
        log_to_file(f"Published PROCESSING for {session_id}")

        # Small sleep to allow client/server subscription to complete
        time.sleep(1.0)

        # Publish GENERATING status
        r.publish(f"exam:stream:{session_id}", json.dumps({
            "type": "status",
            "status": "GENERATING",
            "jobId": session_id,
            "message": "Initializing AI pathways..."
        }))
        # 2. Fetch User AI Context for Adaptive Intelligence
        user_id = session.user_id

        from app.services.context_service import get_user_context
        from app.schemas.context_schema import UserAIContextSchema

        user_ctx = get_user_context(db, user_id)
        if user_ctx:
            prompt_context = user_ctx.to_prompt_context()
            print(f"🧠 Adaptive Context for {session_id}: {prompt_context}")
        else:
            prompt_context = {
                "user_level": "Beginner",
                "strong_topics": "None",
                "weak_topics": "None",
                "accuracy_history": "N/A",
                "avg_time": "N/A",
                "mistake_patterns": "None detected"
            }
            print(f"🧠 No prior context for {session_id}. Using defaults.")

        # 3. Generate Content using LangGraph
        from app.graph.builder import build_exam_generation_graph
        print(f"🤖 Exam Worker: Generating questions via LangGraph for {session_id}...")

        graph = build_exam_generation_graph()
        initial_state = {
            "session_id": session_id,
            "user_id": str(session.user_id),
            "thread_id": str(uuid.uuid4()),
            "exam_type": preferences.get("type", "Quiz"),
            "preferences": preferences,
            "retrieved_docs": [],
            "compressed_context": [],
            "generated_questions": [],
            "validated_questions": [],
            "analytics": {},
            "metadata": {},
            "token_usage": {},
            "streaming_status": "started",
            "error": None,
            "retry_count": 0,
            "cache_hit": False
        }
        
        final_state = graph.invoke(initial_state)
        questions_json = final_state.get("validated_questions", [])
        
        if not questions_json:
             log_to_file(f"⚠️ AI generation returned empty for {session_id}. Error: {final_state.get('error')}")
             raise Exception("AI failed to generate questions (Empty Result)")

        # Publish each question for backward compatibility stream
        for idx, q in enumerate(questions_json):
            if "id" not in q:
                q["id"] = str(uuid.uuid4())
            if "text" not in q and "question" in q:
                q["text"] = q["question"]
                
            r.publish(f"exam:stream:{session_id}", json.dumps({
                "type": "question",
                "index": idx,
                "total": len(questions_json),
                "data": q
            }))

        # 4. Update Session to READY
        session.questions = questions_json
        session.status = "READY"
        session.total_questions = len(questions_json)
        db.commit()

        # Update Redis status for polling (legacy compatibility)
        redis_status = {
            "jobId": session_id,
            "status": "READY"
        }
        r.set(f"job:{session_id}", json.dumps(redis_status), ex=3600)

        # Publish completion event
        r.publish(f"exam:stream:{session_id}", json.dumps({
            "type": "status",
            "status": "COMPLETED",
            "sessionId": session_id,
            "message": "Exam ready!"
        }))

        print(f"✅ Exam Worker: Job {session_id} completed. {len(questions_json)} questions generated.")


    except Exception as e:
        print(f"❌ Exam Worker: Failed to process job {session_id}: {e}")
        db.rollback()

        # Check if it's a rate limit / exhaustion issue -> Delayed Retry
        retry_count = job.get("retry_count", 0)

        # Relaxed check: any failure implies exhaustion given our robust AI retry logic in llm.py
        # If llm.py returned [], it means ALL models failed 3 times.
        is_exhaustion = True

        if is_exhaustion and retry_count < 3:
            print(f"🔄 Moving job {session_id} to DELAYED queue (Attempt {retry_count+1}/3)")

            # Requirement 5: "retry timestamp (now + 10 minutes)"
            delay = 600 # 10 minutes
            retry_time = time.time() + delay

            job["retry_count"] = retry_count + 1

            # Add to ZSET
            r.zadd(QUEUE_DELAYED, {json.dumps(job): retry_time})
            print(f"zzz Job sleeping until {time.ctime(retry_time)}")
            return

        # Mandatory Hard Fallback (Requirement 6) if retries exhausted
        print("⚠️ Retries exhausted. Triggering MANDATORY HARD FALLBACK.")
        perform_hard_fallback(session_id, preferences, db, str(e))

    finally:
        db.close()

def process_submission_job(job):
    job_id = job.get("jobId")
    user_id = job.get("userId")
    request = job.get("request")
    session_id = request.get("sessionId")
    answers = request.get("answers", [])

    print(f"📝 Processing submission for Session {session_id} (Job {job_id})")
    # print(f"🔍 DEBUG: Answers received: {len(answers)}")
    # if len(answers) > 0:
    #     print(f"🔍 DEBUG: First answer sample: {answers[0]}")

    db: Session = SessionLocal()
    try:
        session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
        if not session:
            print(f"❌ Submission Error: Session {session_id} not found")
            return

        # 1. Calculate Score
        # Load questions from JSONB
        questions = session.questions or []
        question_map = {q["id"]: q for q in questions}

        correct_count = 0
        total_questions = len(questions)
        total_time = 0

        user_responses_map = {}

        for ans in answers:
            q_id = ans.get("questionId")
            user_ans = ans.get("answer")
            time_spent = ans.get("timeSpent", 0)
            total_time += time_spent

            if q_id in question_map:
                correct_ans = question_map[q_id].get("correct_answer")
                is_correct = (user_ans == correct_ans)
                if is_correct:
                    correct_count += 1

                user_responses_map[q_id] = {
                    "questionId": q_id,
                    "userAnswer": user_ans,
                    "isCorrect": is_correct,
                    "timeSpent": time_spent
                }

        # 2. Update Session
        score = (correct_count / total_questions) * 100 if total_questions > 0 else 0
        accuracy = score # Same for now

        session.score = int(score)
        session.accuracy = int(accuracy)
        session.time_taken = total_time
        session.user_responses = user_responses_map
        session.status = "COMPLETED"

        # db.commit() # Commit intermediate? No, do it at end.

        # 3. Trigger AI Weakness Analysis
        from app.core.llm import evaluate_exam_submission

        submission_data = {
            "questions": questions,
            "answers": user_responses_map,
            "total_questions": total_questions,
            "correct_count": correct_count
        }

        print(f"🤖 AI Analysis started for {session_id}...")
        try:
             analysis_result = asyncio.run(evaluate_exam_submission(submission_data))
             session.cached_analysis = analysis_result
             print(f"✅ AI Analysis completed for {session_id}")
        except Exception as e:
             print(f"⚠️ AI Analysis failed: {e}")
             session.job_error = f"AI Analysis Failed: {str(e)[:100]}"

        db.commit()

        # Publish completion event
        r.publish(f"exam:stream:{job_id}", json.dumps({
            "type": "analysis",
            "status": "ANALYSIS_COMPLETED",
            "sessionId": session_id,
        }))

    except Exception as e:
        print(f"❌ Submission Processing Error: {e}")
        db.rollback()
    finally:
        db.close()

def perform_hard_fallback(session_id, preferences, db, original_error):
    try:
         session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
         if not session: return

         # Fallback: Random DB Questions
         random_questions = db.query(Question).order_by(func.random()).limit(10).all()

         questions_json = []
         if random_questions:
             for q in random_questions:
                 questions_json.append({
                     "id": str(uuid.uuid4()),
                     "text": q.text,
                     "options": q.options, # Already JSON string or dict? Check model.
                     # Model says JSONB, so dict.
                     "correct_answer": q.correct_answer,
                     "type": q.type,
                     "difficulty": q.difficulty,
                     "explanation": "Fallback question."
                 })
         else:
             # Ultra-Hard Fallback: Deterministic Template
             print("⚠️ DB Empty. Using Deterministic Templates.")
             questions_json = [
                 {
                     "id": str(uuid.uuid4()),
                     "text": "What is the primary benefit of a circuit breaker pattern?",
                     "options": ["Resilience", "Latency", "Throughput", "Security"],
                     "correct_answer": "Resilience",
                     "type": "MCQ",
                     "difficulty": "Easy",
                     "explanation": "It prevents cascading failures."
                 }
             ] * 5

         session.questions = questions_json
         session.status = "READY"
         session.total_questions = len(questions_json)
         session.job_error = f"Generated via Hard Fallback. Error: {original_error[:100]}"
         db.commit()

         # Update Redis status
         redis_status = {"jobId": session_id, "status": "READY", "fallback": True}
         r.set(f"job:{session_id}", json.dumps(redis_status), ex=3600)
         print(f"✅ Hard Fallback successful for {session_id}")

    except Exception as fallback_err:
        print(f"❌ CRITICAL: Hard Fallback Failed: {fallback_err}")
        # Last resort: Mark failed
        session.status = "FAILED"
        db.commit()
