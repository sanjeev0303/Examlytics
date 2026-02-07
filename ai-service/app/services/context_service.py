from sqlalchemy.orm import Session
from app.models.db_models import UserAIContext
from app.schemas.context_schema import UserAIContextSchema, ExamHistoryItem
from uuid import UUID
from typing import Optional
import datetime

def get_user_context(db: Session, user_id: UUID) -> Optional[UserAIContextSchema]:
    """Fetches user AI context from DB."""
    record = db.query(UserAIContext).filter(UserAIContext.user_id == user_id).first()
    if not record or not record.context_data:
        return None
    return UserAIContextSchema(**record.context_data)

def upsert_user_context(db: Session, user_id: UUID, context: UserAIContextSchema):
    """Creates or updates user AI context."""
    record = db.query(UserAIContext).filter(UserAIContext.user_id == user_id).first()
    data = context.model_dump(by_alias=True)

    if record:
        record.context_data = data
        record.updated_at = datetime.datetime.utcnow()
    else:
        record = UserAIContext(user_id=user_id, context_data=data)
        db.add(record)

    db.commit()
    return record

def update_context_after_exam(db: Session, user_id: UUID, exam_id: str, score: int, topic_scores: dict):
    """
    Updates user context after an exam submission:
    - Appends to examHistory
    - Recalculates topicMastery (rolling average)
    """
    ctx = get_user_context(db, user_id)
    if not ctx:
        ctx = UserAIContextSchema(userId=str(user_id))

    # Append exam history (keep last 10)
    ctx.exam_history.append(ExamHistoryItem(examId=exam_id, score=score, topics=topic_scores))
    if len(ctx.exam_history) > 10:
        ctx.exam_history = ctx.exam_history[-10:]

    # Recalculate topic mastery (simple rolling average)
    for topic, topic_score in topic_scores.items():
        if topic in ctx.topic_mastery:
            ctx.topic_mastery[topic] = (ctx.topic_mastery[topic] + (topic_score / 100)) / 2
        else:
            ctx.topic_mastery[topic] = topic_score / 100

    upsert_user_context(db, user_id, ctx)
    return ctx
