class TokenBudgetManager:
    """Manages context window budgets and ensures limits aren't exceeded."""
    def __init__(self):
        self.max_tokens = 8192
        
    def check_budget(self, current_tokens: int, estimated_completion: int) -> bool:
        return (current_tokens + estimated_completion) < self.max_tokens
        
    def trim_context(self, context: list, max_allowed: int) -> list:
        # Simplistic trimming logic
        return context[:max_allowed]

token_manager = TokenBudgetManager()
