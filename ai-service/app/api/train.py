from fastapi import APIRouter

router = APIRouter()

@router.post("/")
async def trigger_training():
    return {"message": "Model training endpoint"}
