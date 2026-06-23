import json
import asyncio
from app.models.router import router
from app.schemas.structured_schemas import QuestionBatchSchema, ExamEvaluationSchema

class RegistryShim:
    def get_generation_llm(self):
        return router.get_model("generation")
    def get_evaluation_llm(self):
        return router.get_model("validation")
        
registry = RegistryShim()

async def generate_exam_content(preferences: dict, context: dict = {}) -> list:
    from langchain_core.prompts import ChatPromptTemplate
    llm = router.get_model("generation").with_structured_output(QuestionBatchSchema)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Generate questions according to the schema."),
        ("user", f"Create {preferences.get('question_count', 5)} questions matching these preferences: {json.dumps(preferences)}")
    ])
    chain = prompt | llm
    try:
        res = await chain.ainvoke({})
        return res.model_dump()["questions"]
    except Exception as e:
        print(f"Error generating exam content: {e}")
        return []

async def evaluate_exam_submission(submission_data: dict) -> dict:
    llm = router.get_model("validation").with_structured_output(ExamEvaluationSchema)
    from langchain_core.prompts import ChatPromptTemplate
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Evaluate the exam submission according to the schema."),
        ("user", json.dumps(submission_data))
    ])
    chain = prompt | llm
    try:
        res = await chain.ainvoke({})
        return res.model_dump()
    except Exception as e:
        print(f"Error evaluating exam submission: {e}")
        return {}

async def generate_content_async(prompt: str) -> str:
    llm = router.get_model("generation")
    res = await llm.ainvoke(prompt)
    return res.content
