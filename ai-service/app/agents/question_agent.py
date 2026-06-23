from app.agents.base import BaseAgent
from app.schemas.structured_schemas import QuestionBatchSchema

class QuestionAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            model_key="generation",
            system_prompt="You are an expert exam generator. Create high-quality questions following the strict schema.",
            output_schema=QuestionBatchSchema
        )

question_agent = QuestionAgent()
