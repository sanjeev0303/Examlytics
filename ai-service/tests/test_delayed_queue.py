#!/usr/bin/env python3
"""
Test delayed queue behavior to ensure no infinite loops.
"""
import json
import time
import redis
import os
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "rediss://default:gQAAAAAAAR8VAAIgcDEwMDE1MTM2MDQ1NWI0MzRiYjkwMTBmMjc0MmFiYTNlYg@amazed-malamute-73493.upstash.io:6379")
QUEUE_DELAYED = "queue:exam_delayed"

def test_delayed_queue_validation():
    """
    Test that invalid jobs in delayed queue are removed, not re-queued.
    """
    print("🧪 Testing Delayed Queue Validation...\n")

    r = redis.Redis.from_url(REDIS_URL, decode_responses=True)

    # Clean delayed queue first
    r.delete(QUEUE_DELAYED)
    print("✅ Cleaned delayed queue")

    # Add invalid jobs to delayed queue (jobs without source or with wrong source)
    invalid_jobs = [
        {
            "job_id": "invalid-1",
            "user_id": "user-123",
            "created_at": time.time()
            # Missing 'source' field
        },
        {
            "job_id": "invalid-2",
            "user_id": "user-456",
            "source": "system",  # Wrong source
            "created_at": time.time()
        },
        {
            "job_id": "stale-job",
            "user_id": "user-789",
            "source": "client",
            "created_at": time.time() - 90000  # 25 hours old
        }
    ]

    # Add a valid job for comparison
    valid_job = {
        "job_id": "valid-1",
        "user_id": "user-999",
        "source": "client",
        "created_at": time.time(),
        "retry_count": 0,
        "preferences": {"question_count": 5}
    }

    # Add all jobs to delayed queue with score = now (ready to process)
    now = time.time()
    for job in invalid_jobs + [valid_job]:
        r.zadd(QUEUE_DELAYED, {json.dumps(job): now})

    print(f"✅ Added {len(invalid_jobs)} invalid jobs + 1 valid job to delayed queue")

    # Get initial count
    initial_count = r.zcard(QUEUE_DELAYED)
    print(f"📊 Initial delayed queue size: {initial_count}")

    print("\n⏳ Waiting for delayed processor to run cleanup (15 seconds)...")
    print("   (The worker should validate and remove invalid jobs)")
    time.sleep(15)

    # Check final count
    final_count = r.zcard(QUEUE_DELAYED)
    print(f"\n📊 Final delayed queue size: {final_count}")

    # Get remaining jobs
    remaining = r.zrange(QUEUE_DELAYED, 0, -1)
    print(f"📋 Remaining jobs: {len(remaining)}")

    if len(remaining) > 0:
        for job_data in remaining:
            job = json.loads(job_data)
            print(f"   - {job.get('job_id')} (source: {job.get('source', 'MISSING')})")

    # Assertions
    assert final_count == 0, f"Expected 0 jobs in delayed queue (all should be removed), got {final_count}"

    print("\n✅ TEST PASSED: All invalid jobs were removed from delayed queue")
    print("✅ No infinite loop detected")

def test_retry_limit():
    """
    Test that jobs with retry_count >= MAX_RETRIES are permanently removed.
    """
    print("\n🧪 Testing Retry Limit Enforcement...\n")

    r = redis.Redis.from_url(REDIS_URL, decode_responses=True)

    # Clean delayed queue
    r.delete(QUEUE_DELAYED)

    # Add job with exhausted retries
    exhausted_job = {
        "job_id": "exhausted-job",
        "user_id": "user-123",
        "source": "client",
        "created_at": time.time(),
        "retry_count": 3,  # Already at MAX_RETRIES
        "preferences": {}
    }

    now = time.time()
    r.zadd(QUEUE_DELAYED, {json.dumps(exhausted_job): now})

    print(f"✅ Added job with retry_count=3 to delayed queue")
    print(f"📊 Queue size: {r.zcard(QUEUE_DELAYED)}")

    print("\n⏳ Waiting for delayed processor (10 seconds)...")
    time.sleep(10)

    final_count = r.zcard(QUEUE_DELAYED)
    print(f"📊 Final queue size: {final_count}")

    assert final_count == 0, f"Expected exhausted job to be removed, got {final_count} jobs"

    print("\n✅ TEST PASSED: Exhausted job was permanently removed")

if __name__ == "__main__":
    print("=" * 60)
    print("DELAYED QUEUE INFINITE LOOP TEST")
    print("=" * 60)
    print("\n⚠️  Make sure the AI service is running with worker enabled\n")

    try:
        test_delayed_queue_validation()
        test_retry_limit()

        print("\n" + "=" * 60)
        print("🎉 ALL TESTS PASSED!")
        print("=" * 60)

    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        exit(1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        exit(1)
