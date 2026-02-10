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

QUEUE_NAME = "queue:exam_generation"


QUEUE_DELAYED = "queue:exam_delayed"

def validate_job(job: dict) -> tuple[bool, str]:
    """
    Validate job structure and origin.
    Returns: (is_valid, reason)
    """
    # Check required fields
    required_fields = ["job_id", "user_id", "source", "created_at"]
    for field in required_fields:
        if field not in job:
            return False, f"Missing required field: {field}"

    # Validate source is from client
    allowed_sources = ["client", "load_test"]
    if job.get("source") not in allowed_sources:
        return False, f"Invalid source: {job.get('source')} (must be in {allowed_sources})"

    # Check if job is stale (older than 24 hours)
    job_age = time.time() - job.get("created_at", 0)
    if job_age > 86400:  # 24 hours
        return False, f"Stale job: {job_age/3600:.1f} hours old"

    return True, "valid"

def start_worker():
    print(f"👷 Exam Worker: Listening on {QUEUE_NAME}...")

    # Start delayed job processor in bg thread
    import threading
    threading.Thread(target=process_delayed_jobs, daemon=True).start()

    while True:
        try:
            # Check if worker is enabled via Redis flag
            worker_enabled = r.get("exam:worker:enabled")
            if worker_enabled != b"true" and worker_enabled != "true":
                print("⏸️  Worker paused: exam:worker:enabled flag not set to 'true'")
                time.sleep(5)
                continue

            # Blocking Pop from Main Queue
            result = r.blpop(QUEUE_NAME, timeout=5)
            if not result:
                continue

            _, data = result
            job = json.loads(data)

            job_id = job.get('job_id', 'unknown')
            print(f"👷 Exam Worker: Received job {job_id}")

            # Validate job
            is_valid, reason = validate_job(job)
            if not is_valid:
                print(f"❌ Job validation failed for {job_id}: {reason}")
                print(f"🗑️  Discarding invalid/orphan job: {job_id}")
                continue

            print(f"✅ Job {job_id} validated successfully (source: {job.get('source')})")
            process_job(job)

        except Exception as e:
            print(f"❌ Exam Worker: Error in loop: {e}")
            time.sleep(1) # Prevent tight loop on Redis error

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
    session_id = job.get("job_id")
    preferences = job.get("preferences", {})

    db: Session = SessionLocal()
    try:
        # 1. Fetch Session & Update Status
        session = db.query(ExamSession).filter(ExamSession.id == session_id).first()
        if not session:
            print(f"❌ Exam Worker: Session {session_id} not found")
            return

        session.status = "PROCESSING"
        db.commit()

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

        # 3. Generate Content using AI
        from app.core.llm import generate_exam_content

        print(f"🤖 Exam Worker: Generating questions via AI for {session_id}...")
        questions_data = asyncio.run(
            generate_exam_content(preferences, context=prompt_context)
        )

        if not questions_data:
             print("⚠️ AI generation returned empty, trying fallback or retry.")
             raise Exception("AI failed to generate questions (Exhausted/RateLimit)")

        questions_json = []

        # 3. Create Questions in DB (if we want to persist them as reusable entities)
        # OR just store them in the session if they are ephemeral custom gen.
        # The prompt implies dynamic generation. Let's persist them for analytics but maybe mark them as generated.

        for i, q_data in enumerate(questions_data):
            # Create Question Record
            options_raw = q_data.get("options")
            print(f"🔍 DEBUG: Q{i} Raw Options: {options_raw}")
            if options_raw is None:
                options_raw = []

            # (Optional) We skip saving individual Question models to DB for speed in this refactor,
            # assuming we just store JSON in session. Or keep existing logic if robust.
            # Keeping simplistic logic for constraints:
            questions_json.append({
                "id": str(uuid.uuid4()),
                "text": q_data.get("question") or q_data.get("problem_statement"),
                "options": options_raw,
                "type": q_data.get("type", "MCQ"),
                "correct_answer": q_data.get("correct_answer"),
                "difficulty": q_data.get("difficulty", "Medium"),
                "explanation": q_data.get("explanation")
            })

        # 4. Update Session to READY
        session.questions = questions_json
        session.status = "READY"
        session.total_questions = len(questions_json)
        db.commit()

        # Update Redis status for polling
        redis_status = {
            "jobId": session_id,
            "status": "READY"
        }
        r.set(f"job:{session_id}", json.dumps(redis_status), ex=3600)
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
