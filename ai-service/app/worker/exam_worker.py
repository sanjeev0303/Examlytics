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

def start_worker():
    print(f"👷 Exam Worker: Listening on {QUEUE_NAME}...")
    while True:
        try:
            # Blocking Pop
            _, data = r.blpop(QUEUE_NAME, timeout=0)
            job = json.loads(data)
            print(f"👷 Exam Worker: Received job {job.get('job_id')}")

            process_job(job)

        except Exception as e:
            print(f"❌ Exam Worker: Error in loop: {e}")
            time.sleep(1) # Prevent tight loop on Redis error

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
             print("⚠️ AI generation returned empty, falling back to database/random (not implemented fully).")
             # Fallback logic here if needed, or error out
             raise Exception("AI failed to generate questions")

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

            new_q = Question(
                text=q_data.get("question") or q_data.get("problem_statement"),
                options=json.dumps(options_raw),
                correct_answer=q_data.get("correct_answer") or q_data.get("expected_approach"), # Simplification
                difficulty=q_data.get("difficulty", "Medium").upper(),
                type=q_data.get("type", "MCQ"),
                # topic_id?? We might need to resolve or create topic.
                # For now, store raw topic string if we add it to DB, or just use session topic
            )
            # db.add(new_q) # Optional persistence
            # db.commit()

            questions_json.append({
                "id": str(uuid.uuid4()), # Dynamic ID
                "text": new_q.text,
                "options": json.loads(new_q.options),
                "type": new_q.type,
                "correct_answer": new_q.correct_answer,
                "explanation": q_data.get("explanation")
            })

        # 4. Update Session to READY
        session.questions = questions_json
        session.status = "READY"
        session.total_questions = len(questions_json)
        db.commit()
        print(f"✅ Exam Worker: Job {session_id} completed. {len(questions_json)} questions generated.")

    except Exception as e:
        print(f"❌ Exam Worker: Failed to process job {session_id}: {e}")
        db.rollback()
        # Mark Failed
        try:
             session.status = "FAILED"
             session.job_error = str(e)
             db.commit()
        except:
            pass
    finally:
        db.close()
