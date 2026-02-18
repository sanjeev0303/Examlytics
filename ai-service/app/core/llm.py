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
    MISTRAL = "mistral"

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
        if os.getenv("GEMINI_API_KEY"):
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

        # 5. Mistral (High Quality / Euro-Host)
        if os.getenv("MISTRAL_API_KEY"):
            self._models[LLMProvider.MISTRAL] = ChatOpenAI(
                 api_key=os.getenv("MISTRAL_API_KEY"),
                 base_url="https://api.mistral.ai/v1",
                 model="mistral-medium",
                 temperature=0.7,
                 max_retries=0
            )

    def get_model(self, provider: LLMProvider):
        return self._models.get(provider)

    def get_generation_llm(self):
        """
        Policy: Groq > Gemini > Mistral > Claude > OpenAI
        """
        if LLMProvider.GROQ in self._models:
            return self._models[LLMProvider.GROQ]
        if LLMProvider.GEMINI in self._models:
            return self._models[LLMProvider.GEMINI]
        if LLMProvider.MISTRAL in self._models:
            return self._models[LLMProvider.MISTRAL]
        if LLMProvider.CLAUDE in self._models:
            return self._models[LLMProvider.CLAUDE]
        if LLMProvider.OPENAI in self._models:
            return self._models[LLMProvider.OPENAI]
        raise Exception("No AI Providers configured for Generation! Set GROQ_API_KEY, GEMINI_API_KEY, or MISTRAL_API_KEY.")

    def get_evaluation_llm(self):
        """
        Policy: Gemini > Groq > Mistral > OpenAI
        """
        if LLMProvider.GEMINI in self._models:
            return self._models[LLMProvider.GEMINI]
        if LLMProvider.GROQ in self._models:
            return self._models[LLMProvider.GROQ]
        if LLMProvider.MISTRAL in self._models:
            return self._models[LLMProvider.MISTRAL]
        if LLMProvider.OPENAI in self._models:
            return self._models[LLMProvider.OPENAI]
        if LLMProvider.CLAUDE in self._models:
            return self._models[LLMProvider.CLAUDE]
        raise Exception("No AI Providers configured for Evaluation!")

# Singleton Instance
registry = ModelRegistry()


def repair_json(content: str) -> str:
    """
    Attempt to repair common JSON errors from AI responses.
    Handles: markdown wrappers, unterminated strings, missing brackets
    """
    # Remove markdown code blocks
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0]
    elif "```" in content:
        content = content.split("```")[1].split("```")[0]

    # Strip whitespace
    content = content.strip()

    # Fix unterminated strings (odd number of quotes)
    if content.count('"') % 2 != 0:
        # Find last quote and ensure string is terminated
        content += '"'

    # Fix missing closing brackets/braces
    open_braces = content.count('{') - content.count('}')
    open_brackets = content.count('[') - content.count(']')

    if open_braces > 0:
        content += '}' * open_braces
    if open_brackets > 0:
        content += ']' * open_brackets

    return content


def generate_strict_instructions(preferences: dict) -> str:
    instructions = []

    if preferences.get("type") == "IMPROVEMENT":
        instructions.append("- STRICTLY generate questions ONLY related to the provided Topics/Weak Topics.")

    if preferences.get("language") and preferences.get("language") != "N/A":
        instructions.append(f"- All coding questions and snippets MUST be in {preferences['language']}.")

    if preferences.get("job_category") and preferences.get("job_category") != "N/A":
        instructions.append(f"- Focus questions specifically on {preferences['job_category']} interview scenarios.")

    if preferences.get("subjects") and preferences.get("subjects") != "N/A":
        # Handle list or comma-separated string
        subjs = preferences['subjects']
        if isinstance(subjs, list):
            subjs = ", ".join(subjs)
        instructions.append(f"- Questions MUST be distributed among: {subjs}.")

    return "\n".join(instructions)

# --- PUBLIC FUNCTIONS ---

from app.core.resilience import resilience_manager

async def generate_exam_content(preferences: dict, context: dict = {}) -> list:
    """
    Generates questions using AI with robust fallback and resilience.
    """
    # 2. Estimate Tokens (Rough heuristic: 500 in + 2000 out)
    ESTIMATED_COST = 2500

    valid_context = context or {}

    # --- CACHING LAYER ---
    from app.core.cache import redis_cache
    import hashlib

    # Create deterministic hash of inputs
    cache_payload = {
        "preferences": preferences,
        # We optionally include context if it affects generation.
        # Weak topics affect it, so include it.
        "weak_topics": valid_context.get("weak_topics", "None")
    }
    cache_key = f"exam_gen:{hashlib.md5(json.dumps(cache_payload, sort_keys=True).encode()).hexdigest()}"

    # check cache
    cached_result = await redis_cache.get(cache_key)
    if cached_result:
        try:
            print(f"⚡ CACHE HIT for {cache_key}")
            return json.loads(cached_result)
        except:
            pass # Invalid cache, regeneration

    # Optimize prompt - JSON strictly, no fluff
    # CRITICAL: Enforce strict JSON contract
    optimized_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an API that outputs VALID JSON ONLY. No markdown. No explanations. No text before or after the JSON."),
        ("user", """CRITICAL: Return VALID JSON ONLY. No prose. No markdown code blocks. No commentary.

Create {question_count} {exam_type} questions.
Topic: {topics}
Subject: {subjects}
Difficulty: {difficulty}
Language: {language}
Context: Level={user_level}, Weak Topics={weak_topics}

OUTPUT FORMAT (EXACT JSON STRUCTURE REQUIRED):
[{{
  "question": "question text here",
  "options": ["option a", "option b", "option c", "option d"],
  "correct_answer": "exact text of correct option",
  "difficulty": "Easy or Medium or Hard",
  "type": "MCQ",
  "explanation": "brief explanation"
}}]

REMINDER: Output ONLY the JSON array. Nothing else.""")
    ])


    # 3. Provider Failover Strategy
    # Priority: Groq -> Gemini -> Mistral
    providers_priority = [LLMProvider.GROQ, LLMProvider.GEMINI, LLMProvider.MISTRAL]

    last_error = None
    fallback_used = False

    for provider_idx, provider in enumerate(providers_priority):
        provider_name = provider.value

        # Mark as fallback ONLY if we moved past first provider
        is_using_fallback = provider_idx > 0
        if is_using_fallback:
            fallback_used = True

        # A. Check Resilience (Circuit & Budget)
        circuit_state = resilience_manager.get_circuit_state(provider_name)
        if not resilience_manager.check_circuit(provider_name):
            print(f"⏩ {provider_name}: Circuit OPEN. Skipping to next provider.")
            continue

        if not resilience_manager.check_token_budget(provider_name, ESTIMATED_COST):
            print(f"⏩ {provider_name}: Budget Exceeded. Skipping to next provider.")
            continue

        print(f"🤖 Attempting Generation with {provider_name} (Provider #{provider_idx+1}, Fallback: {is_using_fallback}, Circuit: {circuit_state})...")

        # B. Retry Loop (Max 2 retries = 3 total attempts)
        for attempt in range(3):
            try:
                llm = None

                # Dynamic Provider Instantiation
                if provider == LLMProvider.GROQ:
                     if not os.getenv("GROQ_API_KEY"): break
                     llm = ChatGroq(model_name="llama-3.3-70b-versatile", temperature=0.7, max_retries=0)

                elif provider == LLMProvider.GEMINI:
                     if not os.getenv("GOOGLE_API_KEY"): break
                     llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.7, max_retries=0, convert_system_message_to_human=True)

                elif provider == LLMProvider.MISTRAL:
                    # Mistral Strategy: Preference for official API, then Groq-hosted
                    if os.getenv("MISTRAL_API_KEY"):
                         llm = ChatOpenAI(
                             api_key=os.getenv("MISTRAL_API_KEY"),
                             base_url="https://api.mistral.ai/v1",
                             model="mistral-medium",
                             temperature=0.7,
                             max_retries=0
                         )
                    elif os.getenv("GROQ_API_KEY"):
                        # Fallback to Llama 3 8B if Mistral Key missing but Groq available
                        llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0.7, max_retries=0)
                    else:
                        break

                if not llm:
                    print(f"⚠️ {provider_name} not configured.")
                    break

                chain = optimized_prompt | llm

                # Timeout constraint (30s)
                response = await asyncio.wait_for(
                    chain.ainvoke({
                        "question_count": preferences.get("question_count", 5),
                        "exam_type": preferences.get("type", "Quiz"),
                        "topics": preferences.get("topic_id", "General"),
                        "subjects": preferences.get("subjects", "General"),
                        "difficulty": preferences.get("difficulty", "Medium"),
                        "language": preferences.get("language", "English"),
                        "user_level": valid_context.get("user_level", "Beginner"),
                        "weak_topics": valid_context.get("weak_topics", "None")
                    }),
                    timeout=30
                )

                # Parse Response with JSON repair
                content = response.content

                # First attempt: direct parse
                try:
                    data = json.loads(content)
                except json.JSONDecodeError as json_err:
                    print(f"⚠️ {provider_name}: Initial JSON parse failed, attempting repair...")
                    # Attempt to repair JSON
                    repaired_content = repair_json(content)
                    try:
                        data = json.loads(repaired_content)
                        print(f"✅ {provider_name}: JSON repair successful")
                    except json.JSONDecodeError:
                        print(f"❌ {provider_name}: JSON repair failed - {str(json_err)[:100]}")
                        # JSON errors are non-retryable, move to next provider
                        raise ValueError(f"Invalid JSON after repair attempt: {str(json_err)[:100]}")

                if isinstance(data, list) and len(data) > 0:
                    print(f"✅ Success: {provider_name} generated {len(data)} questions (Fallback: {is_using_fallback}, Failover Count: {provider_idx})")

                    # Observability Logging
                    print(json.dumps({
                        "event": "exam_generation_success",
                        "provider": provider_name,
                        "provider_index": provider_idx,
                        "tokens_estimated": ESTIMATED_COST,
                        "fallback_used": fallback_used,
                        "failover_count": provider_idx,
                        "circuit_state": circuit_state
                    }))

                    resilience_manager.record_success(provider_name)
                    resilience_manager.consume_tokens(provider_name, ESTIMATED_COST)

                    # Cache the result for 24 hours
                    await redis_cache.set(cache_key, json.dumps(data), ttl=86400)

                    return data

                # If parsed data is invalid/empty, treat as error to trigger retry
                raise ValueError("Empty or invalid JSON response")

            except Exception as e:
                # Error Handling
                last_error = e
                err_str = str(e).lower()

                # Classify error types
                is_connection_error = "connection" in err_str or "timeout" in err_str or "timed out" in err_str
                is_json_error = "json" in err_str or "parse" in err_str or "decode" in err_str
                is_rate_limit = "429" in err_str or "rate_limit" in err_str or "quota" in err_str or "too many requests" in err_str

                print(f"⚠️ Error {provider_name} (Attempt {attempt+1}/3): {str(e)[:200]}")
                print(f"   Error Type: Connection={is_connection_error}, JSON={is_json_error}, RateLimit={is_rate_limit}")

                # Rate limit → circuit breaker, skip to next provider
                if is_rate_limit:
                    resilience_manager.record_error(provider_name, is_rate_limit=True)
                    print(f"🚫 {provider_name} Rate Limited. Circuit may open. Switching to next provider.")
                    break  # Break retry loop, try next provider immediately

                # JSON errors are non-retryable (we already tried repair)
                if is_json_error:
                    print(f"🚫 {provider_name} JSON error is non-retryable. Switching to next provider.")
                    break

                # Connection/Timeout errors → retry with backoff
                if is_connection_error and attempt < 2:
                     delay = resilience_manager.get_backoff_delay(attempt)
                     print(f"⏳ Retryable error. Backoff {delay:.1f}s for {provider_name}")
                     await asyncio.sleep(delay)
                     continue  # Retry same provider

                # After 3 attempts, move to next provider
                if attempt >= 2:
                    print(f"🚫 {provider_name} exhausted all 3 attempts. Switching to next provider.")
                    break

    print(f"❌ All AI Providers failed. Last error: {last_error}")
    # Worker will handle Hard Fallback
    return []

async def generate_exam_incremental(preferences: dict, context: dict = {}):
    """
    Incremental generator that yields questions as they are produced by the LLM.
    """
    valid_context = context or {}
    # Robust defaults for preferences
    question_count = preferences.get("question_count") or preferences.get("questionCount") or 5
    topics = preferences.get("topic_id") or preferences.get("topicId") or preferences.get("topics", "General")
    subjects = preferences.get("subjects", "General")
    difficulty = preferences.get("difficulty", "Medium")
    language = preferences.get("language", "English")

    # Priority: Groq -> Gemini -> Mistral
    providers_priority = [LLMProvider.GROQ, LLMProvider.GEMINI, LLMProvider.MISTRAL]

    optimized_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert exam generator. Output VALID JSON ARRAY ONLY. No markdown. No explanations."),
        ("user", """Return a JSON ARRAY of {question_count} high-quality questions.
CRITICAL: Do NOT return an empty list []. Generate the requested count.
No prose. No markdown code blocks. No commentary.

Subject: {subjects}
Topic: {topics}
Difficulty: {difficulty}
Language: {language}
Target Audience: {user_level}
Areas for Improvement: {weak_topics}

Format: [{{
  "question": "clear question text",
  "options": ["opt1", "opt2", "opt3", "opt4"],
  "correct_answer": "text matching one option",
  "difficulty": "{difficulty}",
  "type": "MCQ",
  "explanation": "concise explanation"
}}]""")
    ])

    last_error = None

    for provider in providers_priority:
        provider_name = provider.value
        if not resilience_manager.check_circuit(provider_name):
            print(f"⏩ {provider_name}: Circuit OPEN, skipping.")
            continue

        try:
            llm = None
            if provider == LLMProvider.GROQ and os.getenv("GROQ_API_KEY"):
                print(f"🤖 Attempting Incremental Generation with {provider_name}...")
                llm = ChatGroq(model_name="llama-3.3-70b-versatile", temperature=0.7)
            elif provider == LLMProvider.GEMINI and (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")):
                print(f"🤖 Attempting Incremental Generation with {provider_name}...")
                api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
                llm = ChatGoogleGenerativeAI(
                    model="gemini-2.0-flash",
                    temperature=0.7,
                    google_api_key=api_key,
                    convert_system_message_to_human=True
                )
            elif provider == LLMProvider.MISTRAL and os.getenv("MISTRAL_API_KEY"):
                print(f"🤖 Attempting Incremental Generation with {provider_name}...")
                llm = ChatOpenAI(api_key=os.getenv("MISTRAL_API_KEY"), base_url="https://api.mistral.ai/v1", model="mistral-medium")

            if not llm:
                print(f"⚠️ {provider_name}: No API key found, skipping.")
                continue

            chain = optimized_prompt | llm

            buffer = ""
            current_depth = 0
            in_string = False
            escape = False

            chunk_count = 0
            yielded_any = False
            async for chunk in chain.astream({
                "question_count": question_count,
                "topics": topics,
                "subjects": subjects,
                "difficulty": difficulty,
                "language": language,
                "user_level": valid_context.get("user_level", "Beginner"),
                "weak_topics": valid_context.get("weak_topics", "None")
            }):
                chunk_count += 1
                content = getattr(chunk, 'content', '')
                if chunk_count <= 5 or chunk_count % 10 == 0:
                   print(f"DEBUG: {provider_name} Chunk {chunk_count}: {repr(content)}")

                for char in content:
                    if char == '"' and not escape:
                        in_string = not in_string

                    if not in_string:
                        if char == '{':
                            current_depth += 1
                        elif char == '}':
                            current_depth -= 1

                    buffer += char
                    escape = (char == '\\' and not escape)

                    if not in_string and current_depth == 0 and char == '}':
                        # Possible object end
                        try:
                            # Clean buffer to start at first {
                            start_idx = buffer.find('{')
                            if start_idx != -1:
                                obj_str = buffer[start_idx:]
                                question = json.loads(obj_str)
                                print(f"✅ Parsed incremental question from {provider_name}")
                                yield question
                                yielded_any = True
                                buffer = "" # Clear buffer for next object
                        except Exception as e:
                            # print(f"DEBUG: JSON parse yielded error: {e}")
                            pass # Incomplete or invalid JSON object, keep buffering

            print(f"🏁 {provider_name} stream finished. Total chunks: {chunk_count}")
            if yielded_any:
                resilience_manager.record_success(provider_name)
                return # Successfully finished with one provider

            print(f"⚠️ {provider_name} produced no questions, trying next...")

        except Exception as e:
            err_str = str(e).lower()
            is_rate_limit = "429" in err_str or "rate_limit" in err_str or "quota" in err_str or "too many requests" in err_str
            last_error = e

            print(f"❌ {provider_name} incremental error: {err_str[:200]}")

            if is_rate_limit:
                resilience_manager.record_error(provider_name, is_rate_limit=True)
                print(f"🚫 {provider_name} Rate Limited. Switching to next provider.")
            else:
                resilience_manager.record_error(provider_name)
                print(f"⚠️ {provider_name} unexpected error, trying next...")

            continue

    yield None # Signal failure

async def evaluate_exam_submission(submission_data: dict) -> dict:
    """
    Evaluates the submission using LLM with fallback strategy.
    Policy: Gemini -> Groq -> OpenAI -> Claude
    """

    # Define fallback order
    providers = [LLMProvider.GEMINI, LLMProvider.GROQ, LLMProvider.MISTRAL]

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
