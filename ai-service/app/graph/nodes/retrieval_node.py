from app.graph.state import ExamState
from app.services.vector_store import vector_store
from app.models.router import router
from langchain_classic.retrievers.multi_query import MultiQueryRetriever

def retrieve_context(state: ExamState) -> ExamState:
    session_id = state.get("session_id")
    
    preferences = state.get("preferences", {})
    topic = preferences.get("topic_id", "General")
    
    # We will use the original topic for MultiQueryRetriever to expand
    # since it handles the expansion internally.
    
    from langchain_qdrant import QdrantVectorStore
    
    lc_vectorstore = QdrantVectorStore(
        client=vector_store.client,
        collection_name="knowledge_base",
        embedding=vector_store.embedding_fn
    )
    
    # Base retriever
    base_retriever = lc_vectorstore.as_retriever(search_kwargs={"k": 5})
    
    # Setup MultiQueryRetriever
    llm = router.get_model("generation")
    retriever = MultiQueryRetriever.from_llm(
        retriever=base_retriever, llm=llm
    )
    
    # Retrieve documents
    try:
        retrieved_docs = retriever.invoke(topic)
        # Convert LangChain Document objects to dicts for our state
        all_docs = []
        for d in retrieved_docs:
            all_docs.append({
                "content": d.page_content,
                "metadata": d.metadata
            })
    except Exception as e:
        print(f"Retrieval failed: {e}")
        all_docs = []
                
    state["retrieved_docs"] = all_docs
    
    return state
