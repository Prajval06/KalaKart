from fastapi import APIRouter, Query
from app.services.recommendation_service import RecommendationService

router = APIRouter()

@router.get("/{product_id}")
async def get_recommendations(
    product_id: str,
    limit: int = Query(default=5, ge=1, le=20)
):
    product_ids = await RecommendationService.get_similar_products(product_id, limit)
    return {
        "success": True,
        "data": {
            "product_id":       product_id,
            "recommendations":  product_ids,
            "count":            len(product_ids)
        }
    }