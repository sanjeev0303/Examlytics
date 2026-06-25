from app.graph.state import ExamState
from app.graph.event_emitter import emitter
from app.models.router import router
from langchain_core.prompts import ChatPromptTemplate
from app.schemas.structured_schemas import QuestionBatchSchema

def generate_questions(state: ExamState) -> ExamState:
    session_id = state.get("session_id")
    emitter.emit(session_id, "generation_started")
    
    preferences = state.get("preferences", {})
    question_count = preferences.get("question_count", 5)
    topics = preferences.get("topic_id", "General")
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert exam generator. Generate a batch of {question_count} distinct questions matching the topic and preferences. Make sure to fill in all fields including the bloom_taxonomy and difficulty_score (with score and reasoning) for each question to enable downstream analytics."),
        ("user", "Create {question_count} questions about topic '{topics}'. Preferences: {preferences}")
    ])
    
    try:
        res = router.invoke_chain(
            task_type="generation",
            prompt=prompt,
            output_schema=QuestionBatchSchema,
            inputs={
                "question_count": question_count,
                "topics": topics,
                "preferences": str(preferences)
            }
        )
        
        generated_questions = []
        for i, q in enumerate(res.questions):
            q_dict = q.model_dump()
            generated_questions.append(q_dict)
            
            # Emit individual question immediately to simulate progress
            emitter.emit(session_id, "question_generated", {
                "question": q_dict,
                "index": i + 1,
                "total": len(res.questions)
            })
        
        state["generated_questions"] = generated_questions
        state["streaming_status"] = "generation_completed"
        state["error"] = None
    except Exception as e:
        state["error"] = str(e)
        state["retry_count"] = state.get("retry_count", 0) + 1
        
    return state

