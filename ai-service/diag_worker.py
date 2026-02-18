import json
import redis
import os
from app.worker.exam_worker import process_job

REDIS_URL = "rediss://default:AY3_AAIncDI2YzllZTRlNDg0OGQ0OTQ3YjhkMDg0ODc3YTlkYmZiYnAyMzYzNTE@proud-elk-36351.upstash.io:6379"
r = redis.from_url(REDIS_URL, decode_responses=True)

def run_one():
    print("🚀 Diagnostic worker started...")
    print(f"📦 Current queue length: {r.llen('queue:exam_generation')}")

    # Block and pop one job
    print("⏳ Waiting for job in 'queue:exam_generation'...")
    res = r.brpop("queue:exam_generation", timeout=10)

    if res:
        queue_name, job_str = res
        print(f"✅ Found job: {job_str[:100]}...")
        job_data = json.loads(job_str)

        print("🛠️ Processing job...")
        try:
            # We call the actual worker function
            process_job(job_data)
            print("🏁 Job processing call finished.")
        except Exception as e:
            print(f"❌ Error processing job: {e}")
    else:
        print("😴 No job found after 10 seconds.")

if __name__ == "__main__":
    run_one()
