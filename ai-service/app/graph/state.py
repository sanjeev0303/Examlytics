from typing import TypedDict, List, Dict, Any, Optional

class ExamState(TypedDict):
    session_id: str
    user_id: str
    thread_id: str
    exam_type: str
    preferences: Dict[str, Any]
    retrieved_docs: List[Any]
    expanded_queries: List[str]
    compressed_context: List[Any]
    generated_questions: List[Dict[str, Any]]
    validated_questions: List[Dict[str, Any]]
    difficulty_scores: List[Dict[str, Any]]
    bloom_scores: List[Dict[str, Any]]
    weak_topics: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    analytics: Dict[str, Any]
    metadata: Dict[str, Any]
    token_usage: Dict[str, int]
    streaming_status: str
    events: List[Dict[str, Any]]
    confidence_scores: List[float]
    should_regenerate: bool
    error: Optional[str]
    retry_count: int
    cache_hit: bool
    cache_key: Optional[str]
