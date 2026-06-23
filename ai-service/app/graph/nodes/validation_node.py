from app.graph.state import ExamState

def validate_questions(state: ExamState) -> ExamState:
    state["validated_questions"] = state.get("generated_questions", [])
    state["streaming_status"] = "validation_completed"
    return state
