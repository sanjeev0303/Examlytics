import json
import asyncio
from app.models.router import router

def repair_json(content: str) -> str:
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0]
    elif "```" in content:
        content = content.split("```")[1].split("```")[0]
    return content.strip()

class RegistryShim:
    def get_generation_llm(self):
        return router.get_model("generation")
    def get_evaluation_llm(self):
        return router.get_model("validation")
        
registry = RegistryShim()

async def generate_exam_content(preferences: dict, context: dict = {}) -> list:
    from langchain_core.prompts import ChatPromptTemplate
    llm = router.get_model("generation")
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Output valid JSON array only."),
        ("user", f"Create {preferences.get('question_count', 5)} questions. Output as JSON array.")
    ])
    chain = prompt | llm
    res = await chain.ainvoke({})
    try:
        return json.loads(repair_json(res.content))
    except:
        return []

async def generate_exam_incremental(preferences: dict, context: dict = {}):
    yield None

async def evaluate_exam_submission(submission_data: dict) -> dict:
    llm = router.get_model("validation")
    from langchain_core.prompts import ChatPromptTemplate
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Evaluate this. Return JSON."),
        ("user", json.dumps(submission_data))
    ])
    chain = prompt | llm
    res = await chain.ainvoke({})
    try:
        return json.loads(repair_json(res.content))
    except:
        return {}

async def generate_content_async(prompt: str) -> str:
    llm = router.get_model("generation")
    res = await llm.ainvoke(prompt)
    return res.content
