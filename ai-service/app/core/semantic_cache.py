import hashlib
import json
from typing import Dict, Any, Optional
import chromadb
from chromadb.utils import embedding_functions
import os

CHROMA_DB_DIR = os.getenv("CHROMA_DB_DIR", "./chroma_db")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class SemanticCache:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
        
        if GEMINI_API_KEY:
            self.embedding_fn = embedding_functions.GoogleGenerativeAiEmbeddingFunction(api_key=GEMINI_API_KEY)
        else:
            self.embedding_fn = embedding_functions.DefaultEmbeddingFunction()
            
        self.collection = self.client.get_or_create_collection(
            name="semantic_cache",
            embedding_function=self.embedding_fn
        )

    def check(self, query: str, threshold: float = 0.95) -> Optional[Dict[str, Any]]:
        results = self.collection.query(
            query_texts=[query],
            n_results=1
        )
        
        if results and results['distances'] and len(results['distances'][0]) > 0:
            distance = results['distances'][0][0]
            if distance < (1.0 - threshold): 
                try:
                    return json.loads(results['metadatas'][0][0].get("response_json", "{}"))
                except:
                    pass
        return None

    def add(self, query: str, response_data: Dict[str, Any]):
        doc_id = hashlib.sha256(query.encode()).hexdigest()
        self.collection.upsert(
            ids=[doc_id],
            documents=[query],
            metadatas=[{"response_json": json.dumps(response_data)}]
        )

semantic_cache = SemanticCache()
