import chromadb
from chromadb.utils import embedding_functions
import os
from typing import List, Dict, Any

CHROMA_DB_DIR = os.getenv("CHROMA_DB_DIR", "./chroma_db")

class VectorStoreService:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
        self.embedding_fn = embedding_functions.DefaultEmbeddingFunction()
        
        # Collection for knowledge base (RAG)
        self.kb_collection = self.client.get_or_create_collection(
            name="knowledge_base",
            embedding_function=self.embedding_fn
        )
        
        # Collection for semantic caching of generations
        self.cache_collection = self.client.get_or_create_collection(
            name="semantic_cache",
            embedding_function=self.embedding_fn
        )

    def hybrid_search(self, query: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """
        Retrieves documents using hybrid search.
        In this MVP, we use Chroma's standard vector search. 
        BM25 could be integrated for true hybrid search in the future.
        """
        results = self.kb_collection.query(
            query_texts=[query],
            n_results=n_results
        )
        
        docs = []
        if results and results['documents'] and len(results['documents']) > 0:
            for i, doc in enumerate(results['documents'][0]):
                docs.append({
                    "id": results['ids'][0][i],
                    "content": doc,
                    "metadata": results['metadatas'][0][i] if results['metadatas'] else {}
                })
        return docs

    def check_semantic_cache(self, query: str, threshold: float = 0.9) -> List[Dict[str, Any]]:
        """
        Checks if a semantically similar query was generated recently.
        Returns cached data if distance is below (1 - threshold).
        Note: Chroma uses L2 distance by default.
        """
        results = self.cache_collection.query(
            query_texts=[query],
            n_results=1
        )
        
        if results and results['distances'] and len(results['distances'][0]) > 0:
            distance = results['distances'][0][0]
            # Convert L2 distance conceptually. A small distance means high similarity.
            # Typical threshold for "very similar" in L2 with normalized embeddings is < 0.2
            if distance < (1.0 - threshold): 
                # Decode metadata back into structure
                return [results['metadatas'][0][0]]
                
        return []

    def add_to_semantic_cache(self, query: str, response_data: Dict[str, Any]):
        """
        Caches a generation response.
        """
        # We need a unique ID, hash the query or use random UUID
        import hashlib
        import json
        doc_id = hashlib.sha256(query.encode()).hexdigest()
        
        # We can only store str, int, float, bool in metadatas for Chroma
        # So we serialize the response data to a JSON string in metadata
        self.cache_collection.upsert(
            ids=[doc_id],
            documents=[query],
            metadatas=[{"response_json": json.dumps(response_data)}]
        )

vector_store = VectorStoreService()
