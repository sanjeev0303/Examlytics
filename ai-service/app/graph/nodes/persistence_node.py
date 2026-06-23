from app.graph.state import ExamState
from app.graph.event_emitter import emitter
from app.services.vector_store import vector_store

def persist_results(state: ExamState) -> ExamState:
    session_id = state.get("session_id")
    emitter.emit(session_id, "persist_started")
    
    cache_key = state.get("cache_key")
    questions = state.get("validated_questions", []) or state.get("generated_questions", [])
    
    if cache_key and questions:
        # Cache successful generations
        response_data = {"questions": questions}
        vector_store.add_to_semantic_cache(cache_key, response_data)
        print("💾 Saved to Semantic Cache.")
    
    # DB persistence happens here or in the caller. 
    # Since this is part of the graph, it could just be setting status for the caller to save
    # or actually writing to DB if DB session is available.
    
    emitter.emit(session_id, "persist_completed")
    
    # Finally, emit completed
    emitter.emit(session_id, "completed")
    state["streaming_status"] = "completed"
    
    return state
