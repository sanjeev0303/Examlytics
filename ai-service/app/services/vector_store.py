import os
from typing import List, Dict, Any
import hashlib
import json
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings

QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "")

class VectorStoreService:
    def __init__(self):
        # Initialize Qdrant Client
        self.client = QdrantClient(
            url=QDRANT_URL,
            api_key=QDRANT_API_KEY if QDRANT_API_KEY else None
        )
        
        # We use FastEmbedEmbeddings for lightweight, CPU-optimized embedding generation
        # without requiring heavy PyTorch/CUDA dependencies. The default model is BAAI/bge-small-en-v1.5
        # which outputs 384-dimensional vectors.
        self.embedding_fn = FastEmbedEmbeddings()
        
        # Ensure collections exist
        self._ensure_collection("knowledge_base")
        self._ensure_collection("semantic_cache")

    def _ensure_collection(self, name: str):
        if not self.client.collection_exists(name):
            self.client.create_collection(
                collection_name=name,
                vectors_config=VectorParams(size=384, distance=Distance.COSINE)
            )

    def hybrid_search(self, query: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """
        Retrieves documents using standard vector search (BM25 could be integrated later).
        """
        query_emb = self.embedding_fn.embed_query(query)
            
        search_result = self.client.search(
            collection_name="knowledge_base",
            query_vector=query_emb,
            limit=n_results
        )
        
        docs = []
        for scored_point in search_result:
            docs.append({
                "id": str(scored_point.id),
                "content": scored_point.payload.get("page_content", ""),
                "metadata": scored_point.payload.get("metadata", {})
            })
        return docs

    def check_semantic_cache(self, query: str, threshold: float = 0.9) -> List[Dict[str, Any]]:
        """
        Checks if a semantically similar query was generated recently.
        Returns cached data if similarity score >= threshold.
        """
        query_emb = self.embedding_fn.embed_query(query)
            
        search_result = self.client.search(
            collection_name="semantic_cache",
            query_vector=query_emb,
            limit=1
        )
        
        if search_result:
            best_match = search_result[0]
            if best_match.score >= threshold:
                response_json = best_match.payload.get("response_json")
                if response_json:
                    try:
                        return [json.loads(response_json)]
                    except Exception:
                        pass
                
        return []

    def add_to_semantic_cache(self, query: str, response_data: Dict[str, Any]):
        """
        Caches a generation response.
        """
        doc_id = hashlib.sha256(query.encode()).hexdigest()
        
        query_emb = self.embedding_fn.embed_query(query)
            
        self.client.upsert(
            collection_name="semantic_cache",
            points=[
                PointStruct(
                    id=doc_id,
                    vector=query_emb,
                    payload={
                        "query": query,
                        "response_json": json.dumps(response_data)
                    }
                )
            ]
        )

vector_store = VectorStoreService()
