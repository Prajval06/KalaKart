from fastapi import APIRouter
from app.models.sentiment import SentimentRequest, SentimentResponse, BatchSentimentRequest
from app.services.sentiment_service import SentimentService

router = APIRouter()

@router.post("", response_model=SentimentResponse)
async def analyze_sentiment(req: SentimentRequest):
    result = await SentimentService.predict(req.text)
    return {
        **result,
        "review_id": req.review_id
    }

@router.post("/batch")
async def analyze_batch(body: BatchSentimentRequest):
    results = []
    for req in body.requests:
        result = await SentimentService.predict(req.text)
        results.append({"review_id": req.review_id, **result})
    return {"success": True, "data": {"results": results, "count": len(results)}}
