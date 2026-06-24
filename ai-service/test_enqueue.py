import json
import uuid
import time
import redis
r = redis.Redis.from_url('rediss://default:gQAAAAAAAR8VAAIgcDEwMDE1MTM2MDQ1NWI0MzRiYjkwMTBmMjc0MmFiYTNlYg@amazed-malamute-73493.upstash.io:6379')
job = {
    "jobId": str(uuid.uuid4()),
    "userId": "00000000-0000-0000-0000-000000000000",
    "preferences": {
        "topicId": "123",
        "questionCount": 2,
        "type": "Quiz",
        "difficulty": "Easy"
    },
    "source": "client",
    "createdAt": time.time()
}
r.lpush("queue:exam_generation_v2", json.dumps(job))
print(f"Enqueued {job['jobId']}")
