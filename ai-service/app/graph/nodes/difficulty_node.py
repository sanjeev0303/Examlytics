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
        
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Analyze the difficulty of the provided question."),
        ("user", "{question_json}")
    ])
    
    difficulty_scores = []
    
    for q in questions:
        # Optimization: use pre-existing difficulty_score if populated by generation step
        if q.get("difficulty_score"):
            score_data = q["difficulty_score"]
            if isinstance(score_data, dict):
                score_data["question_id"] = q.get("id")
                difficulty_scores.append(score_data)
                continue
            elif hasattr(score_data, "model_dump"):
                score_dict = score_data.model_dump()
                score_dict["question_id"] = q.get("id")
                difficulty_scores.append(score_dict)
                continue
                
        try:
            res = router.invoke_chain(
                task_type="validation",
                prompt=prompt,
                output_schema=DifficultyScoreSchema,
                inputs={"question_json": json.dumps(q)}
            )
            score_data = res.model_dump()
            score_data["question_id"] = q.get("id")
            difficulty_scores.append(score_data)
        except Exception as e:
            print(f"Error scoring difficulty: {e}")
            
    emitter.emit(session_id, "difficulty_scoring_completed")
    return {"difficulty_scores": difficulty_scores}

