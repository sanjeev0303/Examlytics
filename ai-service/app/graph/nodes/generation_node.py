from app.graph.state import ExamState
from app.models.router import router
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

class GeneratedQuestion(BaseModel):
    question: str
    options: list[str] = Field(min_length=4, max_length=4)
    correct_answer: str
    difficulty: str
    type: str
    explanation: str
    topic: str | None = None

class ExamGenerationOutput(BaseModel):
    questions: list[GeneratedQuestion]

def generate_questions(state: ExamState) -> ExamState:
    preferences = state.get("preferences", {})
    question_count = preferences.get("question_count", 5)
    topics = preferences.get("topic_id", "General")
    
    llm = router.get_model("generation")
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert exam generator. Generate questions."),
        ("user", f"Create {question_count} questions about {topics}.")
    ])
    
    try:
        structured_llm = llm.with_structured_output(ExamGenerationOutput)
        chain = prompt | structured_llm
        res = chain.invoke({})
        
        state["generated_questions"] = [q.model_dump() for q in res.questions]
        state["streaming_status"] = "generation_completed"
        state["error"] = None
    except Exception as e:
        state["error"] = str(e)
        state["retry_count"] = state.get("retry_count", 0) + 1
        
    return state
