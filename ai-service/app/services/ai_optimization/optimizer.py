from typing import List, Dict, Any
import json

class PromptOptimizer:
    """
    Handles prompt compression and optimization strategies to reduce token usage.
    """

    @staticmethod
    def compress_instructions(base_instruction: str) -> str:
        """
        Removes filler words and verbose explanations from instructions.
        """
        # Dictionary of replacements to shorten common phrases
        replacements = {
            "Please provide a response that": "Respond with",
            "Make sure to include": "Include",
            "in the following format": "as:",
            "The output should be": "Output:",
            "I want you to act as": "Role:",
            "is required to be": "must be",
            "Use the following context": "Context:",
        }

        optimized = base_instruction
        for old, new in replacements.items():
            optimized = optimized.replace(old, new)

        return optimized.strip()

    @staticmethod
    def format_for_model(instruction: str, data: Dict[str, Any]) -> str:
        """
        Formats the prompt as a structured JSON object to minimize ambiguity
        and encourage JSON output from the model.
        """
        prompt = {
            "role": "system",
            "instruction": PromptOptimizer.compress_instructions(instruction),
            "data": data,
            "format": "json"
        }
        return json.dumps(prompt, separators=(',', ':'))

class ModelRouter:
    """
    Routes requests to appropriate models based on complexity.
    """

    MODELS = {
        "FAST": "gemini-1.5-flash",
        "REASONING": "gpt-4o",
        "BALANCED": "gemini-1.5-pro"
    }

    @staticmethod
    def route(task_type: str, difficulty: str) -> str:
        """
        Determines the best model for the task.
        """
        if task_type == "CODING" and difficulty == "HARD":
            return ModelRouter.MODELS["REASONING"]

        if task_type == "MCQ" and difficulty in ["EASY", "MEDIUM"]:
            return ModelRouter.MODELS["FAST"]

        if task_type == "EXPLANATION":
            return ModelRouter.MODELS["BALANCED"]

        # Default
        return ModelRouter.MODELS["FAST"]
