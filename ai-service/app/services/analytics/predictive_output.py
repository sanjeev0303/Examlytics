from typing import List, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from app.services.analytics.predictive_scoring import PredictiveScoringService

class PredictiveOutputService:
    def __init__(self, db: Session):
        self.scoring_service = PredictiveScoringService(db)

    def get_performance_projections(self, user_id: UUID) -> Dict[str, Any]:
        """
        Generates performance projections and insights for a user.
        """
        mastery = self.scoring_service.calculate_topic_mastery(user_id)

        insights = []
        recommendations = []
        projected_readiness = 0.0

        if mastery:
            # Calculate overall readiness
            projected_readiness = sum(mastery.values()) / len(mastery)

            # Identify top strengths and weaknesses
            sorted_topics = sorted(mastery.items(), key=lambda x: x[1], reverse=True)

            strongest = sorted_topics[0]
            weakest = sorted_topics[-1]

            if strongest[1] > 0.8:
                insights.append(f"High mastery in {strongest[0]} ({strongest[1]*100:.0f}%).")

            if weakest[1] < 0.5:
                insights.append(f"Significant room for improvement in {weakest[0]}.")
                recommendations.append(f"Spend next 3 days on {weakest[0]} foundations.")

            # Trend mapping (Simplified)
            if projected_readiness > 0.7:
                insights.append("Upward learning trajectory detected.")
            else:
                insights.append("Stable performance; consider increasing difficulty for better transition.")

        else:
            insights.append("Insufficient data for detailed projections.")
            recommendations.append("Complete 2 more practice exams to unlock predictive analytics.")

        return {
            "mastery": mastery,
            "readinessScore": round(projected_readiness, 4),
            "insights": insights,
            "recommendations": recommendations
        }
