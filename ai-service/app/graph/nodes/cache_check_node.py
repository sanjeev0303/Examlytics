from app.graph.state import ExamState
from app.graph.event_emitter import emitter
from app.services.vector_store import vector_store
import json

def check_cache(state: ExamState) -> ExamState:
    session_id = state.get("session_id")
    emitter.emit(session_id, "cache_check_started")
    
    preferences = state.get("preferences", {})
    # Create a deterministic query string from preferences
    query_str = json.dumps(preferences, sort_keys=True)
    state["cache_key"] = query_str
    
    cached_results = vector_store.check_semantic_cache(query_str, threshold=0.95)
    
    if cached_results:
        print("🎯 Semantic Cache Hit!")
        cache_data = json.loads(cached_results[0].get("response_json", "{}"))
        state["generated_questions"] = cache_data.get("questions", [])
        state["cache_hit"] = True
        emitter.emit(session_id, "cache_hit")
    else:
        state["cache_hit"] = False
        emitter.emit(session_id, "cache_miss")
        
    state["streaming_status"] = "cache_checked"
    emitter.emit(session_id, "cache_check_completed")
    
    return state
