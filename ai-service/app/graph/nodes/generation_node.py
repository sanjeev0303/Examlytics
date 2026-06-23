from app.graph.state import ExamState
from app.graph.event_emitter import emitter
from app.models.router import router
from langchain_core.prompts import ChatPromptTemplate
from app.schemas.structured_schemas import QuestionSchema

def generate_questions(state: ExamState) -> ExamState:
    session_id = state.get("session_id")
    emitter.emit(session_id, "generation_started")
    
    preferences = state.get("preferences", {})
    question_count = preferences.get("question_count", 5)
    topics = preferences.get("topic_id", "General")
    
    llm = router.get_model("generation")
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert exam generator. Generate a single question according to the schema."),
        ("user", f"Create 1 question about {topics}. This is question {{current_index}} of {question_count}. Preferences: {preferences}")
    ])
    
    try:
        structured_llm = llm.with_structured_output(QuestionSchema)
        chain = prompt | structured_llm
        
        generated_questions = []
        for i in range(question_count):
            res = chain.invoke({"current_index": i + 1})
            q_dict = res.model_dump()
            generated_questions.append(q_dict)
            
            # Emit individual question immediately
            emitter.emit(session_id, "question_generated", {"question": q_dict, "index": i + 1, "total": question_count})
        
        state["generated_questions"] = generated_questions
        state["streaming_status"] = "generation_completed"
        state["error"] = None
    except Exception as e:
        state["error"] = str(e)
        state["retry_count"] = state.get("retry_count", 0) + 1
        
    return state
