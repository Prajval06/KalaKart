from fastapi import APIRouter, Query
from app.services.forecast_service import ForecastService

router = APIRouter()

@router.get("/at-risk")
async def get_at_risk_products(
    risk_level: str = Query(default="high")
):
    products = await ForecastService.get_all_at_risk(risk_level)
    return {
        "success": True,
        "data": {"at_risk_products": products, "count": len(products)}
    }

@router.get("/{product_id}")
async def get_forecast(
    product_id: str,
    days_ahead: int = Query(default=7, ge=1, le=30)
):
    result = await ForecastService.forecast_product(product_id, days_ahead)
    if "error" in result:
        return {
            "success": False,
            "error": {"code": result["error"], "message": "Product not found or invalid ID"}
        }
    return {"success": True, "data": result}