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
        # 1. Question Generation -> Gemini Flash
        # 2. Validation -> Mistral Large
        # 3. Analytics -> Mistral Medium
        # 4. Fast Streaming -> Groq
        # Fallback logic with circuit breaker
        
        primary_model = None
        provider = ""
        
        if task_type == "generation":
            provider = "gemini"
            primary_model = get_gemini_flash
        elif task_type == "validation":
            provider = "mistral"
            primary_model = get_mistral_nemo
        elif task_type == "analytics":
            provider = "mistral"
            primary_model = get_mistral_small
        elif task_type == "streaming":
            provider = "groq"
            primary_model = get_groq_llama
        else:
            provider = "gemini"
            primary_model = get_gemini_flash
            
        # Check Circuit Breaker
        if resilience_manager.can_execute(provider):
            try:
                return primary_model()
            except Exception as e:
                logger.error(f"Failed to initialize {provider}: {e}")
                resilience_manager.record_failure(provider)
                
        # Fallbacks
        logger.warning(f"Primary model {provider} unavailable for {task_type}, cascading to fallbacks...")
        
        fallbacks = [
            ("gemini", get_gemini_flash),
            ("groq", get_groq_llama_small),
            ("mistral", get_mistral_nemo),
            ("huggingface", get_huggingface_fallback)
        ]
        
        for fb_prov, fb_model in fallbacks:
            if fb_prov != provider and resilience_manager.can_execute(fb_prov):
                try:
                    return fb_model()
                except Exception as e:
                    logger.error(f"Fallback {fb_prov} failed: {e}")
                    resilience_manager.record_failure(fb_prov)
                    
        # Ultimate fallback
        logger.error("All providers exhausted, using HuggingFace as ultimate fallback")
        return get_huggingface_fallback()

router = ModelRouter()
