from typing import TypedDict, List, Dict, Any, Optional

class ExamState(TypedDict):
    session_id: str
    user_id: str
    thread_id: str
    exam_type: str
    preferences: Dict[str, Any]
    retrieved_docs: List[Any]
    compressed_context: List[Any]
    generated_questions: List[Dict[str, Any]]
    validated_questions: List[Dict[str, Any]]
    analytics: Dict[str, Any]
    metadata: Dict[str, Any]
    token_usage: Dict[str, int]
    streaming_status: str
    error: Optional[str]
    retry_count: int
    cache_hit: bool
