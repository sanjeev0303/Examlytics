import os

def configure_langsmith():
    """Configure LangSmith for observability."""
    if os.getenv("LANGCHAIN_API_KEY"):
        os.environ["LANGCHAIN_TRACING_V2"] = "true"
        os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"
        os.environ["LANGCHAIN_PROJECT"] = os.getenv("LANGCHAIN_PROJECT", "examlytics-production")
        print("🔍 LangSmith Tracing Enabled")
    else:
        print("⚠️ LangSmith API Key not found. Tracing disabled.")

configure_langsmith()
