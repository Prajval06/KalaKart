from fastapi import APIRouter, Query
from app.services.forecast_service import ForecastService

router = APIRouter()

@router.get("/{product_id}")
async def get_forecast(
    product_id: str,
    days_ahead: int = Query(default=7, ge=1, le=30)
):
    result = await ForecastService.forecast_product(product_id, days_ahead)
    return {"success": True, "data": result}

@router.get("/all/at-risk")
async def get_at_risk_products(
    risk_level: str = Query(default="high")
):
    """Returns all products at or above the given risk level."""
    from app.database import get_db
    db = get_db()

    products = await db.products.find(
        {"is_active": True},
        {"_id": 1}
    ).to_list(length=500)

    at_risk = []
    risk_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    threshold  = risk_order.get(risk_level, 1)

    for p in products:
        forecast = await ForecastService.forecast_product(str(p["_id"]))
        if risk_order.get(forecast.get("stockout_risk", "low"), 3) <= threshold:
            at_risk.append(forecast)

    at_risk.sort(key=lambda x: risk_order.get(x.get("stockout_risk", "low"), 3))

    return {
        "success": True,
        "data":    {"at_risk_products": at_risk, "count": len(at_risk)}
    }