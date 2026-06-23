from app.graph.state import ExamState

def should_retry_generation(state: ExamState) -> str:
    if state.get("error"):
        if state.get("retry_count", 0) < 3:
            return "generate"
        return "failed"
    return "validate"
