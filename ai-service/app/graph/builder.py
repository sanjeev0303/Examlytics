from langgraph.graph import StateGraph, START, END
from app.graph.state import ExamState

from app.graph.nodes.cache_check_node import check_cache
from app.graph.nodes.query_expansion_node import expand_queries
from app.graph.nodes.retrieval_node import retrieve_context
from app.graph.nodes.compression_node import compress_context
from app.graph.nodes.generation_node import generate_questions
from app.graph.nodes.validation_node import validate_questions
from app.graph.nodes.difficulty_node import score_difficulty
from app.graph.nodes.bloom_node import score_bloom_taxonomy
from app.graph.nodes.weak_topic_node import detect_weak_topics
from app.graph.nodes.analytics_node import generate_analytics
from app.graph.nodes.recommendation_node import generate_recommendations
from app.graph.nodes.persistence_node import persist_results

from app.graph.edges.conditional_edges import should_retry_generation

def check_cache_routing(state: ExamState) -> str:
    if state.get("cache_hit"):
        return "end"
    return "expand"

def build_exam_generation_graph():
    workflow = StateGraph(ExamState)
    
    workflow.add_node("check_cache", check_cache)
    workflow.add_node("expand", expand_queries)
    workflow.add_node("retrieve", retrieve_context)
    workflow.add_node("compress", compress_context)
    workflow.add_node("generate", generate_questions)
    workflow.add_node("validate", validate_questions)
    workflow.add_node("difficulty", score_difficulty)
    workflow.add_node("bloom", score_bloom_taxonomy)
    workflow.add_node("weak_topics", detect_weak_topics)
    workflow.add_node("analytics", generate_analytics)
    workflow.add_node("recommendations", generate_recommendations)
    workflow.add_node("persist", persist_results)
    
    workflow.add_edge(START, "check_cache")
    
    workflow.add_conditional_edges(
        "check_cache",
        check_cache_routing,
        {
            "end": END,
            "expand": "expand"
        }
    )
    
    workflow.add_edge("expand", "retrieve")
    workflow.add_edge("retrieve", "compress")
    workflow.add_edge("compress", "generate")
    
    workflow.add_conditional_edges(
        "generate",
        should_retry_generation,
        {
            "generate": "generate",
            "validate": "validate",
            "failed": END
        }
    )
    
    # We could theoretically parallelize difficulty and bloom, but for simplicity let's sequence them
    workflow.add_edge("validate", "difficulty")
    workflow.add_edge("difficulty", "bloom")
    workflow.add_edge("bloom", "weak_topics")
    workflow.add_edge("weak_topics", "analytics")
    workflow.add_edge("analytics", "recommendations")
    workflow.add_edge("recommendations", "persist")
    workflow.add_edge("persist", END)
    
    return workflow.compile()
