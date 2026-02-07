from pydantic import BaseModel
from typing import List, Optional

class GenerateExamRequest(BaseModel):
    user_id: str
    topic_ids: Optional[List[str]] = None
    difficulty: Optional[str] = "MEDIUM"
    question_count: int = 10
    based_on_weakness: bool = False

class GeneratedQuestion(BaseModel):
    text: str
    options: List[str]
    correct_answer: str
    topic_id: str
    difficulty: str

class GenerateExamResponse(BaseModel):
    exam_id: Optional[str] = None # If we store it, or just returns blueprint
    questions: List[GeneratedQuestion]
