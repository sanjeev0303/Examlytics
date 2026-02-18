import chromadb
from chromadb.config import Settings

class VectorStore:
    def __init__(self, collection_name="exam_cache"):
        self.client = chromadb.Client(Settings(is_persistent=True, persist_directory="./chroma_db"))
        self.collection = self.client.get_or_create_collection(name=collection_name)

    def add_documents(self, documents: list[str], embeddings: list[list[float]], metadatas: list[dict] = None, ids: list[str] = None):
        if ids is None:
            import uuid
            ids = [str(uuid.uuid4()) for _ in documents]

        self.collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )

    def search(self, query_embedding: list[float], n_results: int = 1):
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        return results
