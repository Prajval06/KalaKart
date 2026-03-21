from fastapi import APIRouter
from app.models.sentiment import SentimentRequest, SentimentResponse
from app.services.sentiment_service import SentimentService

router = APIRouter()

@router.post("", response_model=SentimentResponse)
async def analyze_sentiment(req: SentimentRequest):
    result = SentimentService.predict(req.text)
    return {
        **result,
        "review_id": req.review_id
    }

@router.post("/batch")
async def analyze_batch(requests: list[SentimentRequest]):
    results = []
    for req in requests:
        result = SentimentService.predict(req.text)
        results.append({"review_id": req.review_id, **result})
    return {"success": True, "data": {"results": results}}