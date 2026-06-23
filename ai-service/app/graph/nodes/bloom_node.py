from app.graph.state import ExamState
from app.graph.event_emitter import emitter
from app.models.router import router
from app.schemas.structured_schemas import BloomTaxonomySchema
from langchain_core.prompts import ChatPromptTemplate
import json

def score_bloom_taxonomy(state: ExamState) -> ExamState:
    session_id = state.get("session_id")
    # This might run in parallel or after difficulty, emitting its own events
    # We didn't explicitly specify bloom_scoring_started in the prompt but it's logical
    emitter.emit(session_id, "bloom_scoring_started")
    
    questions = state.get("validated_questions", [])
    if not questions:
        questions = state.get("generated_questions", [])
        
    llm = router.get_model("validation").with_structured_output(BloomTaxonomySchema)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Classify the provided question according to Bloom's taxonomy."),
        ("user", "{question_json}")
    ])
    chain = prompt | llm
    
    bloom_scores = []
    
    for q in questions:
        try:
            res = chain.invoke({"question_json": json.dumps(q)})
            score_data = res.model_dump()
            score_data["question_id"] = q.get("id")
            bloom_scores.append(score_data)
        except Exception as e:
            print(f"Error scoring bloom taxonomy: {e}")
            
    state["bloom_scores"] = bloom_scores
    emitter.emit(session_id, "bloom_scoring_completed")
    state["streaming_status"] = "bloom_scoring_completed"
    
    return state
