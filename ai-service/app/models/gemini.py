import os
from langchain_google_genai import ChatGoogleGenerativeAI

def get_gemini_flash():
    return ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        temperature=0.7,
        max_retries=3,
        api_key=os.getenv("GEMINI_API_KEY")
    )

def get_gemini_pro():
    return ChatGoogleGenerativeAI(
        model="gemini-1.5-pro",
        temperature=0.2,
        max_retries=3,
        api_key=os.getenv("GEMINI_API_KEY")
    )
