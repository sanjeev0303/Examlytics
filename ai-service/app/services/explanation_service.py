from typing import AsyncGenerator
from langchain_core.prompts import ChatPromptTemplate
from app.core.llm import registry

async def stream_explanation(question_text: str, user_answer: str, correct_answer: str) -> AsyncGenerator[str, None]:
    """
    Streams an explanation for a question using the primary generation LLM.
    """
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert tutor. Provide a concise, helpful explanation for why the correct answer is right and why the user's answer might be wrong."),
        ("user", f"Question: {question_text}\nCorrect Answer: {correct_answer}\nUser Answer: {user_answer}")
    ])

    llm = registry.get_generation_llm()

    # Ensure we use a provider that supports streaming
    chain = prompt | llm

    async for chunk in chain.astream({}):
        # LangChain chunks have .content
        if hasattr(chunk, "content"):
            yield chunk.content
        else:
            yield str(chunk)
