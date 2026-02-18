from typing import Dict, List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.services.analytics.bkt import BayesianKnowledgeTracing
from app.services.context_service import get_user_context
from app.schemas.context_schema import UserAIContextSchema

class PredictiveScoringService:
    def __init__(self, db: Session):
        self.db = db
        self.bkt = BayesianKnowledgeTracing()

    def calculate_topic_mastery(self, user_id: UUID) -> Dict[str, float]:
        """
        Calculates topic mastery for a user based on their interaction history.
        Uses BKT to update p_known for each topic.
        """
        ctx = get_user_context(self.db, user_id)
        if not ctx:
            return {}

        topic_mastery: Dict[str, float] = {}

        # In a real scenario, we'd fetch raw question_interactions from the DB
        # for better granularity. For now, we'll use the rolling history
        # stored in UserAIContext to simulate cumulative learning.

        # Sort history by time if possible to ensure sequential BKT updates
        # (Assuming exam_history is already ordered by completion)

        for topic, current_mastery in ctx.topic_mastery.items():
            # Use stored mastery as p_known base
            p_known = current_mastery

            # Find interactions for this topic in recent history
            for exam in ctx.exam_history:
                if topic in exam.topics:
                    # accuracy is 0-100, normalize to bool for BKT
                    is_correct = exam.topics[topic] >= 70 # Simplified threshold
                    p_known = self.bkt.update(p_known, is_correct)

            topic_mastery[topic] = round(p_known, 4)

        return topic_mastery

    def predict_future_accuracy(self, user_id: UUID, topic: str) -> float:
        """
        Predicts the probability of getting the next question in a topic correct.
        """
        mastery = self.calculate_topic_mastery(user_id)
        p_known = mastery.get(topic, 0.5) # Default to 0.5 if unknown
        return round(self.bkt.predict_correctness(p_known), 4)
