
import redis
import json
import time
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
r = redis.Redis.from_url(REDIS_URL)

QUEUE_GEN = "queue:exam_generation"
QUEUE_SUB = "queue:exam_submission"

def check_redis():
    print("--- Redis Status ---")
    gen_len = r.llen(QUEUE_GEN)
    sub_len = r.llen(QUEUE_SUB)
    print(f"Generation Queue Len: {gen_len}")
    print(f"Submission Queue Len: {sub_len}")

    worker_enabled = r.get("exam:worker:enabled")
    print(f"Worker Enabled: {worker_enabled}")

check_redis()

# Inject a fake generation job
job_id = str(uuid.uuid4())
job = {
    "job_id": job_id,
    "user_id": "debug-user",
    "source": "client",
    "created_at": time.time(),
    "preferences": {
        "question_count": 1,
        "topic_id": "Debug Topic",
        "difficulty": "Easy"
    }
}

print(f"\n--- Injecting Debug Job {job_id} ---")
r.rpush(QUEUE_GEN, json.dumps(job))
print("Job pushed.")

print("Waiting for processing...")
for i in range(10):
    status = r.get(f"job:{job_id}")
    if status:
        print(f"Job Status [{i}s]: {status}")
        if b"PROCESSING" in status or b"COMPLETED" in status or b"FAILED" in status:
            print("Worker is ALIVE and picked up the job!")
            break
    else:
        print(f"Job Status [{i}s]: None")

    time.sleep(1)

print("\n--- Final Checks ---")
check_redis()
