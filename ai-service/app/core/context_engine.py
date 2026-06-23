class ContextCompressor:
    def compress(self, docs):
        # MVP pass-through
        return docs

class ContextRanker:
    def rank(self, docs):
        # MVP pass-through
        return docs

class IntentAnalyzer:
    def analyze(self, query):
        # MVP default
        return {"intent": "general"}
