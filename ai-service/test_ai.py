import time
import json
import sys
import os

# Add current dir to path
sys.path.append(os.getcwd())

from app.services.reasoning import analyze_performance, TopicStats

def test_ai_reasoning():
    print("Starting AI Reasoning Verification...")

    # Input Data
    stats = [
        TopicStats(topic="Probability", accuracy=42, avgTime=78, attempts=12),
        TopicStats(topic="Algebra", accuracy=90, avgTime=30, attempts=5),
        TopicStats(topic="Geometry", accuracy=65, avgTime=50, attempts=8)
    ]

    start_time = time.time()
    result = analyze_performance(exam_type="aptitude", difficulty="medium", topic_stats=stats)
    end_time = time.time()

    duration = end_time - start_time
    print(f"Execution Time: {duration:.4f}s")

    # Verify Time Constraint
    if duration > 2.0:
        print("❌ FAILED: Execution too slow")
        sys.exit(1)

    print("✅ PASS: Execution time < 2s")

    # Verify Logic
    weak_topics = result.weakTopics
    print(f"Weak Topics Found: {len(weak_topics)}")

    found_prob = False
    for wt in weak_topics:
        if wt.topic == "Probability":
            found_prob = True
            print(f"Probability - Severity: {wt.severity}, Confidence: {wt.confidenceScore}")
            if wt.severity != "high" and wt.severity != "medium":
                print(f"❌ FAILED: Probability severity unexpected: {wt.severity}")

    if not found_prob:
        print("❌ FAILED: Probability not detected as weak")

    print(json.dumps(result.dict(), indent=2))
    print("✅ AI Verify Complete")

if __name__ == "__main__":
    test_ai_reasoning()
