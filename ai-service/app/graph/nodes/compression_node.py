from app.graph.state import ExamState
from app.services.vector_store import vector_store
from app.models.router import router
from langchain_classic.retrievers.document_compressors import LLMChainExtractor
from langchain_classic.retrievers import ContextualCompressionRetriever

def compress_context(state: ExamState) -> ExamState:
    session_id = state.get("session_id")
    
    preferences = state.get("preferences", {})
    topic = preferences.get("topic_id", "General")
    
    from langchain_qdrant import QdrantVectorStore
    
    lc_vectorstore = QdrantVectorStore(
        client=vector_store.client,
        collection_name="knowledge_base",
        embedding=vector_store.embedding_fn
    )
    
    # Base retriever
    base_retriever = lc_vectorstore.as_retriever(search_kwargs={"k": 5})
    
    # Setup LLM and Compressor
    llm = router.get_model("generation")
    compressor = LLMChainExtractor.from_llm(llm)
    
    # Setup ContextualCompressionRetriever
    compression_retriever = ContextualCompressionRetriever(
        base_compressor=compressor, base_retriever=base_retriever
    )
    
    try:
        compressed_docs = compression_retriever.invoke(topic)
        # Convert LangChain Document objects to dicts for our state
        all_docs = []
        for d in compressed_docs:
            all_docs.append({
                "content": d.page_content,
                "metadata": d.metadata
            })
    except Exception as e:
        print(f"Compression failed: {e}")
        # Fallback to whatever was retrieved previously if compression fails
        all_docs = state.get("retrieved_docs", [])
        
    state["compressed_context"] = all_docs
    
    return state
