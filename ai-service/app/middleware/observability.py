import time
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from prometheus_client import Counter, Histogram, Gauge

# Define Prometheus metrics
TOKENS_USED = Counter("ai_tokens_total", "Total AI tokens used", ["model", "type"])
REQUEST_LATENCY = Histogram("ai_request_latency_seconds", "AI Request Latency", ["endpoint"])
COST_ESTIMATE = Counter("ai_cost_usd_total", "Estimated cost in USD", ["model"])
CACHE_HITS = Counter("ai_cache_hits_total", "Semantic Cache Hits")

class AIObservabilityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        # Process request
        response = await call_next(request)

        # Calculate duration
        duration = time.time() - start_time
        REQUEST_LATENCY.labels(endpoint=request.url.path).observe(duration)

        # Extract custom headers if available (set by the route handler)
        # Note: In a real app, we might need a better way to pass context than headers in response
        # or use a contextvar.
        tokens = response.headers.get("X-AI-Tokens", 0)
        model = response.headers.get("X-AI-Model", "unknown")

        if tokens:
            try:
                count = int(tokens)
                TOKENS_USED.labels(model=model, type="total").inc(count)

                # Simple cost estimation (example rates)
                rate = 0.000001 # $1 per 1M tokens (mock)
                if model == "gpt-4o":
                    rate = 0.00001
                elif model == "gemini-1.5-flash":
                    rate = 0.0000005

                COST_ESTIMATE.labels(model=model).inc(count * rate)
            except ValueError:
                pass

        return response

# Usage: app.add_middleware(AIObservabilityMiddleware)
