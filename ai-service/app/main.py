from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import asyncio
import os

load_dotenv()

from app.api import generate, evaluate, analyze, exam
from app.middleware.observability import AIObservabilityMiddleware
from app.events.subscriber import listen_to_redis

background_tasks = set()

@asynccontextmanager
async def lifespan(app: FastAPI):
    import logging
    logger = logging.getLogger("ai_service")
    logger.info("🚀 AI Service starting up...")

    # 1. Reset all circuit breakers on boot
    from app.core.resilience import resilience_manager
    resilience_manager.reset_all_circuits()

    # Log circuit states
    for provider in ["groq", "gemini", "mistral"]:
        state = resilience_manager.get_circuit_state(provider)
        logger.info(f"🔌 {provider.upper()} Circuit State: {state}")

    logger.info("⏰ Startup safety window: 1s buffer...")

    # Run listener in background
    task = asyncio.create_task(listen_to_redis())
    background_tasks.add(task)
    task.add_done_callback(background_tasks.discard)

    # Initialize Redis Cache
    from app.core.cache import redis_cache
    await redis_cache.connect()

    logger.info("🎉 AI Service ready to accept requests")
    yield

    # Cancel all background tasks
    for task in background_tasks:
        task.cancel()

    await redis_cache.close()

app = FastAPI(title="Examlytics AI Service", version="1.0.0", lifespan=lifespan)

app.add_middleware(AIObservabilityMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

INTERNAL_SECRET = os.getenv("AI_SERVICE_SECRET", "internal-secret")
MAX_CONCURRENCY = 50
concurrency_semaphore = asyncio.Semaphore(MAX_CONCURRENCY)

@app.middleware("http")
async def limit_concurrency(request: Request, call_next):
    if request.url.path in ["/", "/health", "/metrics", "/docs", "/openapi.json"]:
        return await call_next(request)

    try:
        await asyncio.wait_for(concurrency_semaphore.acquire(), timeout=0.1)
    except asyncio.TimeoutError:
        return JSONResponse(status_code=503, content={"detail": "AI Service Saturated (Max 50 concurrent requests)"})

    try:
        response = await call_next(request)
        return response
    finally:
        concurrency_semaphore.release()

@app.middleware("http")
async def verify_internal_secret(request: Request, call_next):
    if request.url.path in ["/", "/health", "/docs", "/openapi.json"]:
        return await call_next(request)

    secret = request.headers.get("X-Internal-Secret")
    if secret != INTERNAL_SECRET:
         return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

    response = await call_next(request)
    return response

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "examlytics-ai"}

@app.get("/health/stats")
async def health_stats():
    from app.core.resilience import resilience_manager
    return resilience_manager.get_all_stats()

@app.get("/metrics")
def metrics():
    return {
        "max_concurrency": MAX_CONCURRENCY,
        "status": "running"
    }

@app.get("/")
def read_root():
    return {"message": "Welcome to Examlytics AI Service"}

from app.api import generate, evaluate, analyze, exam
# Include Routers
app.include_router(generate.router, prefix="/api/v1/generate", tags=["generation"])
app.include_router(evaluate.router, prefix="/api/v1/evaluate", tags=["evaluation"])
app.include_router(analyze.router, prefix="/api/v1/analyze", tags=["analysis"])
app.include_router(exam.router, prefix="/api/exam", tags=["exam"])
