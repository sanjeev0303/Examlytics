from typing import List, Dict, Any
from pydantic import BaseModel

class TopicStats(BaseModel):
    topic: str
    accuracy: float
    avgTime: float
    attempts: int

class WeakTopic(BaseModel):
    topic: str
    severity: str
    confidenceScore: float
    recommendedQuestions: int

class AnalysisResult(BaseModel):
    weakTopics: List[WeakTopic]
    difficultyAdjustment: str
    focusStrategy: str

def analyze_performance(exam_type: str, difficulty: str, topic_stats: List[TopicStats]) -> AnalysisResult:
    weak_topics = []

    # Global metrics
    total_accuracy = 0
    count = 0

    for stat in topic_stats:
        # Ignore insufficient data
        if stat.attempts < 1:
            continue

        count += 1
        total_accuracy += stat.accuracy

        # Logic: Weak if Accuracy < 60 OR (Accuracy < 75 AND Time > 60s)
        # Weighting: 70% Accuracy, 30% Time (Time penalty starts at 45s)

        # Normalize Time Score (0 to 100, where 100 is bad/slow)
        # Assume 120s is max penalty threshold
        time_score = min(max((stat.avgTime - 30) / (120 - 30), 0), 1) * 100

        # Combined Score (Lower is better performance)
        # We want "Weakness Score" (Higher is weaker)
        # Weakness = (100 - Accuracy) * 0.7 + (TimeScore) * 0.3
        weakness_score = ((100 - stat.accuracy) * 0.7) + (time_score * 0.3)

        if weakness_score > 40: # Threshold for "Weak"
            severity = "medium"
            rec_questions = 10

            if weakness_score > 70:
                severity = "high"
                rec_questions = 20
            elif weakness_score < 50:
                severity = "low"
                rec_questions = 5

            # Penalize repeated mistakes (Lower accuracy with high attempts)
            if stat.attempts > 5 and stat.accuracy < 50:
                severity = "critical"
                rec_questions = 25
                weakness_score += 10 # Boost confidence/severity manually

            weak_topics.append(WeakTopic(
                topic=stat.topic,
                severity=severity,
                # Confidence score is essentially how "bad" it is, normalized 0-1?
                # Or statistical confidence?
                # Prompt says: "confidenceScore": 0.42.
                # Let's use the weakness magnitude normalized 0-1.
                confidenceScore=round(min(weakness_score / 100.0, 1.0), 2),
                recommendedQuestions=rec_questions
            ))

    # Difficulty Adjustment
    avg_acc = 0
    if count > 0:
        avg_acc = total_accuracy / count

    diff_adj = "maintain"
    if avg_acc < 35:
        diff_adj = "easy"
    elif avg_acc > 85:
        diff_adj = "hard"

    # Focus Strategy
    strategy = "balanced"
    if len(weak_topics) == 1:
        strategy = "single-topic"
    elif len(weak_topics) > 3:
        strategy = "broad-review"
    elif avg_acc < 30:
        strategy = "foundation-rebuild"

    # Sort weak topics by confidence (severity)
    weak_topics.sort(key=lambda x: x.confidenceScore, reverse=True)

    return AnalysisResult(
        weakTopics=weak_topics,
        difficultyAdjustment=diff_adj,
        focusStrategy=strategy
    )
