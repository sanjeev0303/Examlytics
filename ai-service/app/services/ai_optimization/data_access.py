from .cache import SemanticCache

class DataAccess:
    def __init__(self):
        self.cache = SemanticCache()

    def get_cached_result(self, query: str):
        return self.cache.get(query)

    def cache_result(self, query: str, data: dict):
        self.cache.set(query, data)
