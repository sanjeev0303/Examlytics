import os
from langchain_mistralai.chat_models import ChatMistralAI

def get_mistral_nemo():
    return ChatMistralAI(
        model="open-mistral-nemo",
        temperature=0.2,
        max_retries=3,
        api_key=os.getenv("MISTRAL_API_KEY")
    )

def get_mistral_small():
    return ChatMistralAI(
        model="mistral-small-latest",
        temperature=0.2,
        max_retries=3,
        api_key=os.getenv("MISTRAL_API_KEY")
    )
