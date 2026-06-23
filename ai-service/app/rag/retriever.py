from typing import List, Dict, Any
from app.rag.vector_store import vector_store

class Retriever:
    def __init__(self):
        self.vs = vector_store

    def multi_query_search(self, queries: List[str], k: int = 4) -> List[Dict[str, Any]]:
        """
        Executes search for multiple queries and deduplicates results.
        """
        all_docs = []
        seen_ids = set()
        
        for query in queries:
            docs = self.vs.similarity_search(query, k=k)
            for doc in docs:
                if doc["id"] not in seen_ids:
                    seen_ids.add(doc["id"])
                    all_docs.append(doc)
                    
        return all_docs

    def hybrid_search(self, query: str, k: int = 4) -> List[Dict[str, Any]]:
        """
        In a full implementation, this combines Dense (Vector) and Sparse (BM25) search.
        For now, it falls back to dense search.
        """
        return self.vs.similarity_search(query, k=k)

retriever = Retriever()
