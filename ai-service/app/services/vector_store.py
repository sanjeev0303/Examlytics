import os
from typing import List, Dict, Any
import hashlib
import json
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
from langchain_mistralai import MistralAIEmbeddings

QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "")

class VectorStoreService:
    def __init__(self):
        # Initialize Qdrant Client
        # Added timeout settings to handle slow connections
        self.client = QdrantClient(
            url=QDRANT_URL,
            api_key=QDRANT_API_KEY if QDRANT_API_KEY else None,
            timeout=30.0
        )

        # Switched to Mistral API embeddings to bypass HuggingFace local download hangs and Google API version issues
        # Using the current supported mistral-embed model. This outputs 1024-dimensional vectors.
        self.embedding_fn = MistralAIEmbeddings(model="mistral-embed")

        # Ensure collections exist (v3 to avoid dimension mismatch with older collections)
        self.kb_collection = "knowledge_base_v3"
        self.cache_collection = "semantic_cache_v3"

        self._ensure_collection(self.kb_collection)
        self._ensure_collection(self.cache_collection)

    def _ensure_collection(self, name: str):
        if not self.client.collection_exists(name):
            self.client.create_collection(
                collection_name=name,
                vectors_config=VectorParams(size=1024, distance=Distance.COSINE)
            )

    def hybrid_search(self, query: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """
        Retrieves documents using standard vector search (BM25 could be integrated later).
        """
        query_emb = self.embedding_fn.embed_query(query)

        search_response = self.client.query_points(
            collection_name=self.kb_collection,
            query=query_emb,
            limit=n_results
        )

        docs = []
        for scored_point in search_response.points:
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

        search_response = self.client.query_points(
            collection_name=self.cache_collection,
            query=query_emb,
            limit=1
        )

        if search_response.points:
            best_match = search_response.points[0]
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
            collection_name=self.cache_collection,
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
