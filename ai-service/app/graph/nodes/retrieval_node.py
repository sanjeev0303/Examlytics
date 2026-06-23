from app.graph.state import ExamState
from app.graph.event_emitter import emitter
from app.services.vector_store import vector_store

def retrieve_context(state: ExamState) -> ExamState:
    session_id = state.get("session_id")
    emitter.emit(session_id, "retrieval_started")
    
    expanded_queries = state.get("expanded_queries", [state.get("preferences", {}).get("topic_id", "General")])
    
    all_docs = []
    seen_ids = set()
    
    for query in expanded_queries:
        docs = vector_store.hybrid_search(query, n_results=3)
        for doc in docs:
            if doc["id"] not in seen_ids:
                seen_ids.add(doc["id"])
                all_docs.append(doc)
                
    state["retrieved_docs"] = all_docs
    state["streaming_status"] = "retrieval_completed"
    
    emitter.emit(session_id, "retrieval_completed")
    
    return state
