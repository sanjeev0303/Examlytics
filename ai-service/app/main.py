from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.api import generate, evaluate, train, analyze, exam

app = FastAPI(title="Examlytics AI Service", version="1.0.0")

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

@app.middleware("http")
async def verify_internal_secret(request: Request, call_next):
    if request.url.path in ["/health", "/docs", "/openapi.json"]:
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

@app.get("/")
def read_root():
    return {"message": "Welcome to Examlytics AI Service"}

# Include Routers
app.include_router(generate.router, prefix="/api/v1/generate", tags=["generation"])
app.include_router(evaluate.router, prefix="/api/v1/evaluate", tags=["evaluation"])
app.include_router(train.router, prefix="/api/v1/train", tags=["training"])
app.include_router(analyze.router, prefix="/api/v1/analyze", tags=["analysis"])
app.include_router(exam.router, prefix="/api/exam", tags=["exam"])

import asyncio
from app.events.subscriber import listen_to_redis

@app.on_event("startup")
async def startup_event():
    # Run listener in background
    asyncio.create_task(listen_to_redis())

    # Start Exam Worker (in thread or separate process ideally, but thread works for I/O bound)
    import threading
    from app.worker.exam_worker import start_worker
    worker_thread = threading.Thread(target=start_worker, daemon=True)
    worker_thread.start()
