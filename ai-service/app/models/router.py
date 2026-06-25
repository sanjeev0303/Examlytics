from typing import Any
from langchain_core.prompts import ChatPromptTemplate
from app.models.gemini import get_gemini_flash, get_gemini_pro
from app.models.groq import get_groq_llama, get_groq_llama_small
from app.models.mistral import get_mistral_nemo, get_mistral_small
from app.models.huggingface import get_huggingface_fallback
from app.core.resilience import resilience_manager
import logging

logger = logging.getLogger("ai_service")

class ModelRouter:
    @staticmethod
    def get_model(task_type: str):
        """
        Returns a LangChain model configured with native fallbacks.
        This is ideal for components like MultiQueryRetriever that expect an LLM object
        and execute it internally.
        """
        if task_type == "generation":
            models = [get_gemini_flash(), get_groq_llama(), get_mistral_nemo()]
        elif task_type == "validation":
            models = [get_mistral_nemo(), get_groq_llama_small(), get_gemini_flash()]
        elif task_type == "analytics":
            models = [get_mistral_small(), get_groq_llama_small(), get_gemini_flash()]
        elif task_type == "streaming":
            models = [get_groq_llama(), get_gemini_flash(), get_mistral_nemo()]
        else:
            models = [get_gemini_flash(), get_groq_llama_small(), get_mistral_nemo()]
            
        primary = models[0]
        if len(models) > 1:
            return primary.with_fallbacks(models[1:])
        return primary


    @classmethod
    def invoke_chain(cls, task_type: str, prompt: ChatPromptTemplate, inputs: dict, output_schema: Any = None) -> Any:
        """
        Executes a chain using the primary model for a task, and automatically cascades to 
        fallbacks on any execution failure (e.g. rate limit, connection error).
        Updates resilience circuit breaker states.
        """
        providers = []
        if task_type == "generation":
            providers = [
                ("gemini", get_gemini_flash),
                ("groq", get_groq_llama),
                ("mistral", get_mistral_nemo)
            ]
        elif task_type == "validation":
            providers = [
                ("mistral", get_mistral_nemo),
                ("groq", get_groq_llama_small),
                ("gemini", get_gemini_flash)
            ]
        elif task_type == "analytics":
            providers = [
                ("mistral", get_mistral_small),
                ("groq", get_groq_llama_small),
                ("gemini", get_gemini_flash)
            ]
        else:
            providers = [
                ("gemini", get_gemini_flash),
                ("groq", get_groq_llama_small),
                ("mistral", get_mistral_nemo)
            ]

        last_error = None
        for provider, model_fn in providers:
            if not resilience_manager.can_execute(provider):
                logger.warning(f"Skipping {provider} for {task_type} because circuit is OPEN")
                continue

            try:
                logger.info(f"Attempting task '{task_type}' with provider '{provider}'...")
                model = model_fn()
                if output_schema:
                    structured_model = model.with_structured_output(output_schema)
                    chain = prompt | structured_model
                else:
                    chain = prompt | model
                
                res = chain.invoke(inputs)
                resilience_manager.record_success(provider)
                logger.info(f"Successfully completed task '{task_type}' with provider '{provider}'")
                return res
            except Exception as e:
                logger.error(f"Error invoking chain with provider {provider}: {e}")
                resilience_manager.record_failure(provider)
                last_error = e

        # Ultimate fallback to HuggingFace
        try:
            logger.warning(f"All primary providers failed for {task_type}, trying ultimate fallback HuggingFace...")
            model = get_huggingface_fallback()
            # Note: ChatHuggingFace might not support with_structured_output directly.
            # If output_schema is required, we attempt it but catch exceptions.
            if output_schema:
                try:
                    structured_model = model.with_structured_output(output_schema)
                    chain = prompt | structured_model
                except Exception:
                    # If structured output fails to bind, we fall back to raw output and hope for the best
                    logger.warning("HuggingFace fallback doesn't support structured output. Trying raw completion...")
                    chain = prompt | model
            else:
                chain = prompt | model
                
            return chain.invoke(inputs)
        except Exception as e:
            logger.error(f"Ultimate fallback HuggingFace failed: {e}")
            raise last_error or e

router = ModelRouter()

