from app.models.router import router
from langchain_core.prompts import ChatPromptTemplate
from typing import Type, Any, Dict
from pydantic import BaseModel

class BaseAgent:
    def __init__(self, model_key: str, system_prompt: str, output_schema: Type[BaseModel]):
        self.llm = router.get_model(model_key).with_structured_output(output_schema)
        self.prompt_template = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("user", "{input_data}")
        ])
        self.chain = self.prompt_template | self.llm

    def invoke(self, input_data: Any) -> Any:
        try:
            return self.chain.invoke({"input_data": input_data})
        except Exception as e:
            print(f"Agent {self.__class__.__name__} failed: {e}")
            return None
