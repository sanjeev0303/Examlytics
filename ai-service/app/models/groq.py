import os
from langchain_groq import ChatGroq

def get_groq_llama():
    return ChatGroq(
        model_name="llama3-70b-8192",
        temperature=0.7,
        max_retries=3,
        api_key=os.getenv("GROQ_API_KEY")
    )

def get_groq_mixtral():
    return ChatGroq(
        model_name="mixtral-8x7b-32768",
        temperature=0.7,
        max_retries=3,
        api_key=os.getenv("GROQ_API_KEY")
    )
