import os
import asyncio
import json
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

async def test_streaming(provider, model_name, api_key_env, base_url=None):
    api_key = os.getenv(api_key_env)
    if not api_key:
        print(f"❌ {provider} API key not found in .env")
        return

    print(f"\n--- Testing {provider} ({model_name}) ---")

    if provider == "groq":
        llm = ChatGroq(model_name=model_name, api_key=api_key)
    elif provider == "gemini":
        llm = ChatGoogleGenerativeAI(model=model_name, google_api_key=api_key)
    elif provider == "mistral":
        llm = ChatOpenAI(api_key=api_key, base_url=base_url, model=model_name)

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert exam generator. Output VALID JSON ARRAY ONLY. No markdown. No explanations."),
        ("user", "Return a JSON ARRAY of 5 high-quality questions for topic: Frontend Developer. Difficulty: Medium. Language: English. Format: [{{'question': '...', 'options': [...], 'correct_answer': '...', 'difficulty': 'Medium', 'type': 'MCQ', 'explanation': '...'}}]")
    ])

    chain = prompt | llm

    full_content = ""
    chunk_count = 0
    try:
        async for chunk in chain.astream({}):
            chunk_count += 1
            content = getattr(chunk, 'content', '')
            print(f"Chunk {chunk_count}: {repr(content)}")
            full_content += content
    except Exception as e:
        print(f"❌ {provider} Error: {e}")
        return

    print(f"\n✅ {provider} finished. Total chunks: {chunk_count}")
    print(f"Full Response:\n{full_content}")

async def main():
    # Test Groq
    await test_streaming("groq", "llama-3.3-70b-versatile", "GROQ_API_KEY")

    # Test Gemini
    await test_streaming("gemini", "gemini-2.0-flash", "GEMINI_API_KEY")

    # Test Mistral
    await test_streaming("mistral", "mistral-medium", "MISTRAL_API_KEY", "https://api.mistral.ai/v1")

if __name__ == "__main__":
    asyncio.run(main())
