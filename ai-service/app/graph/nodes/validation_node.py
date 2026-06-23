from app.graph.state import ExamState
from app.graph.event_emitter import emitter
from app.models.router import router
from app.schemas.structured_schemas import ValidationSchema
from langchain_core.prompts import ChatPromptTemplate
import json

def validate_questions(state: ExamState) -> ExamState:
    session_id = state.get("session_id")
    emitter.emit(session_id, "validation_started")
    
    questions = state.get("generated_questions", [])
    llm = router.get_model("validation").with_structured_output(ValidationSchema)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert exam reviewer. Validate the provided question."),
        ("user", "{question_json}")
    ])
    chain = prompt | llm
    
    validated_questions = []
    confidence_scores = []
    
    for q in questions:
        try:
            res = chain.invoke({"question_json": json.dumps(q)})
            # For simplicity now, we just pass the question if valid
            if res.is_valid:
                validated_questions.append(q)
            elif res.corrected_question:
                validated_questions.append(res.corrected_question.model_dump())
                
            confidence_scores.append(res.confidence)
        except Exception as e:
            print(f"Validation error: {e}")
            
    state["validated_questions"] = validated_questions
    state["confidence_scores"] = confidence_scores
    
    avg_conf = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
    state["should_regenerate"] = avg_conf < 0.7
    
    emitter.emit(session_id, "validation_completed")
    state["streaming_status"] = "validation_completed"
    return state
