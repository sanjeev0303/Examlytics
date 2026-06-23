from app.graph.state import ExamState
from app.graph.event_emitter import emitter
from app.models.router import router
from app.schemas.structured_schemas import DifficultyScoreSchema
from langchain_core.prompts import ChatPromptTemplate
import json

def score_difficulty(state: ExamState) -> ExamState:
    session_id = state.get("session_id")
    emitter.emit(session_id, "difficulty_scoring_started")
    
    questions = state.get("validated_questions", [])
    if not questions:
        questions = state.get("generated_questions", [])
        
    llm = router.get_model("validation").with_structured_output(DifficultyScoreSchema)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Analyze the difficulty of the provided question."),
        ("user", "{question_json}")
    ])
    chain = prompt | llm
    
    difficulty_scores = []
    
    for q in questions:
        try:
            res = chain.invoke({"question_json": json.dumps(q)})
            score_data = res.model_dump()
            score_data["question_id"] = q.get("id")
            difficulty_scores.append(score_data)
        except Exception as e:
            print(f"Error scoring difficulty: {e}")
            
    state["difficulty_scores"] = difficulty_scores
    emitter.emit(session_id, "difficulty_scoring_completed")
    state["streaming_status"] = "difficulty_scoring_completed"
    
    return state
