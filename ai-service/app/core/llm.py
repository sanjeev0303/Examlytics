import os
import json
import asyncio
from enum import Enum
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_anthropic import ChatAnthropic
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from app.core.prompts import EXAM_ENGINE_SYSTEM_PROMPT, EVALUATION_SYSTEM_PROMPT

# --- ENUMS & CONFIGURATION ---

class LLMProvider(Enum):
    OPENAI = "openai"
    GEMINI = "gemini"
    CLAUDE = "claude"
    GROQ = "groq"

class ModelRegistry:
    def __init__(self):
        self._models = {}
        self._initialize_models()

    def _initialize_models(self):
        multiple_ai = os.getenv("MULTIPLE_AI", "false").lower() == "true"

        # 1. OpenAI (Evaluation / Analytics / Fallback)
        if multiple_ai and os.getenv("OPENAI_API_KEY"):
            self._models[LLMProvider.OPENAI] = ChatOpenAI(
                model="gpt-4o",
                temperature=0.2,
                model_kwargs={"response_format": {"type": "json_object"}}
            )

        # 2. Gemini (Fast Generation / Long Context) - Primary Provider
        if os.getenv("GOOGLE_API_KEY"):
            self._models[LLMProvider.GEMINI] = ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                temperature=0.7,
                convert_system_message_to_human=True
            )

        # 3. Claude (Deep Reasoning / Creative)
        if multiple_ai and os.getenv("ANTHROPIC_API_KEY"):
            self._models[LLMProvider.CLAUDE] = ChatAnthropic(
                model="claude-3-sonnet-20240229",
                temperature=0.5
            )

        # 4. Groq (Ultra Fast Inference) - Primary Provider
        if os.getenv("GROQ_API_KEY"):
            self._models[LLMProvider.GROQ] = ChatGroq(
                model_name="llama-3.3-70b-versatile",
                temperature=0.7
            )

    def get_model(self, provider: LLMProvider):
        return self._models.get(provider)

    def get_generation_llm(self):
        """
        Policy: Groq > Gemini > Claude > OpenAI
        """
        if LLMProvider.GROQ in self._models:
            return self._models[LLMProvider.GROQ]
        if LLMProvider.GEMINI in self._models:
            return self._models[LLMProvider.GEMINI]
        if LLMProvider.CLAUDE in self._models:
            return self._models[LLMProvider.CLAUDE]
        if LLMProvider.OPENAI in self._models:
            return self._models[LLMProvider.OPENAI]
        raise Exception("No AI Providers configured for Generation! Set GOOGLE_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY.")

    def get_evaluation_llm(self):
        """
        Policy: OpenAI > Claude > Gemini
        """
        if LLMProvider.OPENAI in self._models:
            return self._models[LLMProvider.OPENAI]
        if LLMProvider.CLAUDE in self._models:
            return self._models[LLMProvider.CLAUDE]
        if LLMProvider.GEMINI in self._models:
            return self._models[LLMProvider.GEMINI]
        if LLMProvider.GROQ in self._models:
            return self._models[LLMProvider.GROQ]
        raise Exception("No AI Providers configured for Evaluation!")

# Singleton Instance
registry = ModelRegistry()

# --- PUBLIC FUNCTIONS ---

async def generate_exam_content(preferences: dict, context: dict = {}) -> list:
    """
    Generates questions using the LLM based on preferences and structured user context.
    """
    try:
        llm = registry.get_generation_llm()
        provider = llm.__class__.__name__
        print(f"🤖 Generating Exam using: {provider}")

        valid_context = context or {}

        prompt = ChatPromptTemplate.from_messages([
            ("system", EXAM_ENGINE_SYSTEM_PROMPT),
            ("user", """Generate an exam using the following inputs:

Exam Configuration:
- Exam Type: {exam_type}
- Mode: {mode}
- Number of Questions: {question_count}
- Difficulty Split:
  Easy: {easy_percentage}%
  Medium: {medium_percentage}%
  Hard: {hard_percentage}%
- Topics (optional): {topics}
- Time Limit: {time_limit}

User Context:
- User Level: {user_level}
- Strong Topics: {strong_topics}
- Weak Topics: {weak_topics}
- Accuracy History: {accuracy_history}
- Avg Time per Question: {avg_time}
- Previous Mistakes: {mistake_patterns}

Instructions:
{strict_instruction}
- Prioritize weak topics
- Avoid repeating similar questions
- Adjust difficulty per topic mastery
- Generate original, exam-standard questions

Return output strictly in JSON.""")
        ])

        chain = prompt | llm

        # Difficulty percentages
        diff = preferences.get("difficulty", "MEDIUM")
        if diff == "HARD":
            easy, medium, hard = 10, 30, 60
        elif diff == "EASY":
            easy, medium, hard = 60, 30, 10
        else:
            easy, medium, hard = 30, 40, 30

        response = await chain.ainvoke({
            "exam_type": preferences.get("type", "General"),
            "mode": preferences.get("mode", "Mixed"),
            "question_count": preferences.get("question_count", 10),
            "difficulty": preferences.get("difficulty", "MEDIUM"),
            "easy_percentage": easy,
            "medium_percentage": medium,
            "hard_percentage": hard,
            "topics": preferences.get("topic_id", "General"),
            "time_limit": "20 mins",
            "user_level": valid_context.get("user_level", "Intermediate"),
            "strong_topics": valid_context.get("strong_topics", "None"),
            "weak_topics": valid_context.get("weak_topics", "None"),
            "accuracy_history": valid_context.get("accuracy_history", "N/A"),
            "avg_time": valid_context.get("avg_time", "N/A"),
            "mistake_patterns": valid_context.get("mistake_patterns", "None detected"),
            "strict_instruction": "- STRICTLY generate questions ONLY related to the provided Topics/Weak Topics. Do NOT generate general questions." if preferences.get("type") == "IMPROVEMENT" else ""
        })

        content = response.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
             content = content.split("```")[1].split("```")[0]

        data = json.loads(content)

        if isinstance(data, dict) and "questions" in data:
            return data["questions"]
        if isinstance(data, list):
            return data

        print("❌ AI returned unexpected format")
        return []

    except Exception as e:
        print(f"❌ AI Generation Error: {e}")
        return []

async def evaluate_exam_submission(submission_data: dict) -> dict:
    """
    Evaluates the submission using LLM with fallback strategy.
    Policy: Gemini -> Groq -> OpenAI -> Claude
    """

    # Define fallback order
    providers = [LLMProvider.GROQ, LLMProvider.GEMINI, LLMProvider.OPENAI, LLMProvider.CLAUDE]

    for provider_enum in providers:
        if provider_enum not in registry._models:
            continue

        try:
            llm = registry.get_model(provider_enum)
            print(f"🧐 Evaluating Submission using: {provider_enum.name}")

            result = await _try_evaluate_with_provider(llm, submission_data)
            if result:
                 return result

        except Exception as e:
            print(f"⚠️ Adaptation Error with {provider_enum.name}: {e}")
            continue

    print("❌ All AI Providers failed for evaluation.")
    return {}

async def _try_evaluate_with_provider(llm, submission_data: dict) -> dict:
    # Escape curly braces in JSON to prevent LangChain template variable interpretation
    submission_json = json.dumps(submission_data, indent=2).replace("{", "{{").replace("}", "}}")

    prompt = ChatPromptTemplate.from_messages([
        ("system", EVALUATION_SYSTEM_PROMPT),
        ("user", f"Evaluate this submission:\n{submission_json}")
    ])

    chain = prompt | llm

    # Set a specific timeout for the chain invocation if supported,
    # or rely on the caller's timeout.
    # Here we just invoke.
    response = await asyncio.wait_for(chain.ainvoke({}), timeout=10)

    content = response.content
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0]
    elif "```" in content:
            content = content.split("```")[1].split("```")[0]

    return json.loads(content)

async def generate_content_async(prompt: str) -> str:
    """
    Generic async content generation for simple prompts.
    Used by semantic evaluation and other simple LLM calls.
    """
    try:
        llm = registry.get_generation_llm()
        response = await llm.ainvoke(prompt)
        return response.content
    except Exception as e:
        print(f"❌ Content Generation Error: {e}")
        raise
