from app.graph.state import ExamState
from app.graph.event_emitter import emitter

def detect_weak_topics(state: ExamState) -> ExamState:
    session_id = state.get("session_id")
    # Weak topic detection acts as the start of analytics
    emitter.emit(session_id, "analytics_started")
    
    # Placeholder: In Phase D this will be powered by the weak_topic_agent
    # using the validation and historical context
    return {"weak_topics": []}
