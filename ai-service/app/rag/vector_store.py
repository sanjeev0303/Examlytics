from typing import List, Dict, Any, Optional
import os
import chromadb
from chromadb.utils import embedding_functions

CHROMA_DB_DIR = os.getenv("CHROMA_DB_DIR", "./chroma_db")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class VectorStore:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
        
        if GEMINI_API_KEY:
            self.embedding_fn = embedding_functions.GoogleGenerativeAiEmbeddingFunction(api_key=GEMINI_API_KEY)
        else:
            self.embedding_fn = embedding_functions.DefaultEmbeddingFunction()
            
        self.collection = self.client.get_or_create_collection(
            name="knowledge_base",
            embedding_function=self.embedding_fn
        )

    def add_documents(self, documents: List[str], metadatas: List[Dict[str, Any]], ids: List[str]):
        self.collection.upsert(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )

    def similarity_search(self, query: str, k: int = 4, filter_metadata: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        results = self.collection.query(
            query_texts=[query],
            n_results=k,
            where=filter_metadata
        )
        
        docs = []
        if results and results['documents'] and len(results['documents']) > 0:
            for i, doc in enumerate(results['documents'][0]):
                docs.append({
                    "id": results['ids'][0][i],
                    "content": doc,
                    "metadata": results['metadatas'][0][i] if results['metadatas'] else {},
                    "score": results['distances'][0][i] if 'distances' in results and results['distances'] else 0
                })
        return docs

vector_store = VectorStore()
