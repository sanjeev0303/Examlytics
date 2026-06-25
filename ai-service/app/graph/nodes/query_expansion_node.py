from app.graph.state import ExamState
from app.graph.event_emitter import emitter
from app.models.router import router
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

class ExpandedQueries(BaseModel):
    queries: list[str] = Field(description="List of expanded search queries")

def expand_queries(state: ExamState) -> ExamState:
    session_id = state.get("session_id")
    emitter.emit(session_id, "query_expansion_started")
    
    preferences = state.get("preferences", {})
    topic = preferences.get("topic_id", "General")
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an AI assistant tasked with query expansion for a vector database. Given a topic, generate 3 different phrasing or sub-topic queries to improve retrieval."),
        ("user", "{topic}")
    ])
    
    try:
        res = router.invoke_chain(
            task_type="generation",
            prompt=prompt,
            output_schema=ExpandedQueries,
            inputs={"topic": topic}
        )
        # Add the original topic as well
        state["expanded_queries"] = [topic] + res.queries
    except Exception as e:
        print(f"Query expansion failed: {e}")
        state["expanded_queries"] = [topic]
        
    emitter.emit(session_id, "query_expansion_completed")
    state["streaming_status"] = "query_expansion_completed"
    
    return state

