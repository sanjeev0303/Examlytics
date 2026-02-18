from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

import asyncio
from app.api import generate, evaluate, train, analyze, exam, stream
from app.middleware.observability import AIObservabilityMiddleware

app = FastAPI(title="Examlytics AI Service", version="1.0.0")

app.add_middleware(AIObservabilityMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
import os
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse

INTERNAL_SECRET = os.getenv("AI_SERVICE_SECRET", "internal-secret")
MAX_CONCURRENCY = 50
concurrency_semaphore = asyncio.Semaphore(MAX_CONCURRENCY)

@app.middleware("http")
async def limit_concurrency(request: Request, call_next):
    if request.url.path in ["/", "/health", "/metrics", "/docs", "/openapi.json"]:
        return await call_next(request)

    try:
        # Non-blocking acquire with timeout (effectively 0 to fail fast, or small buffer)
        # Using wait_for to enforce timeout on acquire
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "examlytics-ai"}

@app.get("/health/stats")
async def health_stats():
    from app.core.resilience import resilience_manager
    return resilience_manager.get_all_stats()

@app.get("/metrics")
def metrics():
    """
    Expose current concurrency metrics.
    """
    # semaphore.locked() returns True if implementation can't acquire immediately
    # Internal counter is _value (not public API but common in debug)
    # Better to track manually if we want exact numbers, but semaphore._value gives available slots
    # available = concurrency_semaphore._value
    # But _value is implementation detail.
    # Let's trust the semaphore effectively manages it.
    # We can infer usage:

    # Python's asyncio.Semaphore doesn't expose 'count' easily in a public stable API
    # except indirectly via _value or similar.
    # For now, we return configured max.

    return {
        "max_concurrency": MAX_CONCURRENCY,
        # "available": concurrency_semaphore._value # Intentionally commenting out private access safety
        "status": "running"
    }

@app.get("/")
def read_root():
    return {"message": "Welcome to Examlytics AI Service"}

# Include Routers
app.include_router(generate.router, prefix="/api/v1/generate", tags=["generation"])
app.include_router(evaluate.router, prefix="/api/v1/evaluate", tags=["evaluation"])
app.include_router(train.router, prefix="/api/v1/train", tags=["training"])
app.include_router(analyze.router, prefix="/api/v1/analyze", tags=["analysis"])
app.include_router(stream.router, prefix="/api/v1/stream", tags=["streaming"])
app.include_router(exam.router, prefix="/api/exam", tags=["exam"])

import asyncio
from app.events.subscriber import listen_to_redis

background_tasks = set()

@app.on_event("startup")
async def startup_event():
    import logging
    logger = logging.getLogger("ai_service")

    logger.info("🚀 AI Service starting up...")

    # 0. Start Exam Worker IMMEDIATELY (in thread)
    import threading
    from app.worker.exam_worker import start_worker
    worker_thread = threading.Thread(target=start_worker, daemon=True)
    worker_thread.start()
    print("👷 Worker thread spawned from main.py startup_event")

    # 1. Reset all circuit breakers on boot
    from app.core.resilience import resilience_manager
    resilience_manager.reset_all_circuits()

    # Log circuit states
    for provider in ["groq", "gemini", "mistral"]:
        state = resilience_manager.get_circuit_state(provider)
        logger.info(f"🔌 {provider.upper()} Circuit State: {state}")

    # 2. Startup Safety Window (Reduced for Dev)
    logger.info("⏰ Startup safety window: 1s buffer...")

    # 3. Run listener in background
    task = asyncio.create_task(listen_to_redis())
    background_tasks.add(task)
    task.add_done_callback(background_tasks.discard)

    # 4. Initialize Redis Cache
    from app.core.cache import redis_cache
    await redis_cache.connect()


    logger.info("🎉 AI Service ready to accept requests")

@app.on_event("shutdown")
async def shutdown_event():
    # Cancel all background tasks
    for task in background_tasks:
        task.cancel()

    from app.core.cache import redis_cache
    await redis_cache.close()

    # Wait for tasks to be cancelled (optional, but good practice)
    # await asyncio.gather(*background_tasks, return_exceptions=True)
