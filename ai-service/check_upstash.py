import redis
r = redis.Redis.from_url("rediss://default:AY3_AAIncDI2YzllZTRlNDg0OGQ0OTQ3YjhkMDg0ODc3YTlkYmZiYnAyMzYzNTE@proud-elk-36351.upstash.io:6379")
QUEUES = ["queue:exam_generation", "queue:exam_submission", "queue:exam_delayed"]
print("--- Upstash Redis Status ---")
for q in QUEUES:
    print(f"{q}: {r.llen(q)}")

enabled = r.get("exam:worker:enabled")
print(f"exam:worker:enabled: {enabled}")
