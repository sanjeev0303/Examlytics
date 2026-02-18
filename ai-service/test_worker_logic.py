import os
import asyncio
import json
from dotenv import load_dotenv

load_dotenv()

from app.core.llm import generate_exam_incremental

async def main():
    preferences = {
        "topic_id": "Frontend Developer",
        "type": "OBJECTIVE",
        "difficulty": "MEDIUM",
        "question_count": 5,
        "subjects": "General",
        "language": "English"
    }
    context = {
        "user_level": "Beginner",
        "weak_topics": "None"
    }

    print(f"🚀 Testing Incremental Generation for: {preferences['topic_id']}")

    count = 0
    async for q in generate_exam_incremental(preferences, context):
        if q is None:
            print("❌ Failure yielded by generator.")
            break
        count += 1
        print(f"✅ Received Question {count}: {q['question'][:50]}...")

    print(f"\n🏁 Finished. Total questions: {count}")

if __name__ == "__main__":
    asyncio.run(main())
