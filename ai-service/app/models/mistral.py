import os
from langchain_mistralai.chat_models import ChatMistralAI

def get_mistral_large():
    return ChatMistralAI(
        model="mistral-large-latest",
        temperature=0.2,
        max_retries=3,
        api_key=os.getenv("MISTRAL_API_KEY")
    )

def get_mistral_medium():
    # mistral-medium is deprecated, using mistral-small or standard
    return ChatMistralAI(
        model="mistral-small-latest",
        temperature=0.2,
        max_retries=3,
        api_key=os.getenv("MISTRAL_API_KEY")
    )
