from app.agents.base import BaseAgent
from app.schemas.structured_schemas import ValidationSchema

class ValidationAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            model_key="validation",
            system_prompt="You are an expert exam reviewer. Review the provided question for validity and correctness.",
            output_schema=ValidationSchema
        )

validation_agent = ValidationAgent()
