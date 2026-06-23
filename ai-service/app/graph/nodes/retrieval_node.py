from app.graph.state import ExamState

def retrieve_context(state: ExamState) -> ExamState:
    # MVP: Basic context retrieval structure
    user_id = state.get("user_id")
    preferences = state.get("preferences", {})
    
    state["retrieved_docs"] = [{"topic": preferences.get("topic_id", "General")}]
    state["streaming_status"] = "retrieval_completed"
    
    return state
