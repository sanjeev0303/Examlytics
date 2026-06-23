from langgraph.graph import StateGraph, START, END
from app.graph.state import ExamState
from app.graph.nodes.retrieval_node import retrieve_context
from app.graph.nodes.generation_node import generate_questions
from app.graph.nodes.validation_node import validate_questions
from app.graph.edges.conditional_edges import should_retry_generation

def build_exam_generation_graph():
    workflow = StateGraph(ExamState)
    
    workflow.add_node("retrieve", retrieve_context)
    workflow.add_node("generate", generate_questions)
    workflow.add_node("validate", validate_questions)
    
    workflow.add_edge(START, "retrieve")
    workflow.add_edge("retrieve", "generate")
    
    workflow.add_conditional_edges(
        "generate",
        should_retry_generation,
        {
            "generate": "generate",
            "validate": "validate",
            "failed": END
        }
    )
    
    workflow.add_edge("validate", END)
    
    return workflow.compile()
