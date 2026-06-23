import os
from langchain_huggingface import HuggingFaceEndpoint, ChatHuggingFace

def get_huggingface_fallback():
    llm = HuggingFaceEndpoint(
        repo_id="mistralai/Mistral-7B-Instruct-v0.3",
        task="text-generation",
        max_new_tokens=1024,
        do_sample=False,
        huggingfacehub_api_token=os.getenv("HUGGINGFACE_TOKEN")
    )
    return ChatHuggingFace(llm=llm)
