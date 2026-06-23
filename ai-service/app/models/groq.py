import os
from langchain_groq import ChatGroq

def get_groq_llama():
    return ChatGroq(
        model_name="llama-3.3-70b-versatile",
        temperature=0.7,
        max_retries=3,
        api_key=os.getenv("GROQ_API_KEY")
    )

def get_groq_llama_small():
    return ChatGroq(
        model_name="llama-3.1-8b-instant",
        temperature=0.7,
        max_retries=3,
        api_key=os.getenv("GROQ_API_KEY")
    )
