from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from app.services.explanation_service import stream_explanation
from app.db import SessionLocal
from app.models.db_models import ExamSession
import json

router = APIRouter()

@router.get("/stream/{exam_id}/{question_id}")
async def stream_question_explanation(exam_id: str, question_id: str, request: Request):
    """
    Server-Sent Events (SSE) endpoint for streaming AI explanations.
    """
    db = SessionLocal()
    try:
        session = db.query(ExamSession).filter(ExamSession.id == exam_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Exam session not found")

        # Find the specific question and user response
        questions = session.questions or []
        responses = session.user_responses or []

        target_question = next((q for q in questions if q.get("id") == question_id), None)
        target_response = next((r for r in responses if r.get("questionId") == question_id), None)

        if not target_question:
            raise HTTPException(status_code=404, detail="Question not found in session")

        async def event_generator():
            async for chunk in stream_explanation(
                question_text=target_question.get("question", ""),
                user_answer=target_response.get("answer", "N/A") if target_response else "N/A",
                correct_answer=target_question.get("correct_answer", "")
            ):
                # Check for client disconnect
                if await request.is_disconnected():
                    break

                # SSE format: data: <content>\n\n
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"

        return StreamingResponse(event_generator(), media_type="text/event-stream")

    finally:
        db.close()
