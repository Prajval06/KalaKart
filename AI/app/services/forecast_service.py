from app.database import get_db
from datetime import datetime, timedelta
from bson import ObjectId


class ForecastService:

    @classmethod
    async def forecast_product(cls, product_id: str, days_ahead: int = 7) -> dict:
        db = get_db()

        thirty_days_ago = datetime.utcnow() - timedelta(days=30)

        try:
            oid = ObjectId(product_id)
        except Exception:
            return {"error": "INVALID_PRODUCT_ID"}

        # Daily sales pipeline
        pipeline = [
            {
                "$match": {
                    "createdAt": {"$gte": thirty_days_ago},
                    "status":    {"$in": ["paid", "shipped", "delivered"]},
                }
            },
            {"$unwind": "$items"},
            {"$match": {"items.product_id": oid}},
            {
                "$group": {
                    "_id":        {
                        "$dateToString": {
                            "format": "%Y-%m-%d",
                            "date":   "$createdAt"
                        }
                    },
                    "units_sold": {"$sum": "$items.quantity"}
                }
            },
            {"$sort": {"_id": 1}}
        ]

        daily_sales = await db.orders.aggregate(pipeline).to_list(length=100)

        # Get current product info
        product = await db.products.find_one(
            {"_id": oid},
            {"inventory_count": 1, "name": 1}
        )

        if not product:
            return {"error": "PRODUCT_NOT_FOUND"}

        inventory    = product.get("inventory_count", 0)
        product_name = product.get("name", "Unknown")

        # No sales data at all
        if not daily_sales:
            return {
                "product_id":          product_id,
                "product_name":        product_name,
                "current_inventory":   inventory,
                "avg_daily_sales":     0,
                "predicted_demand":    0,
                "days_until_stockout": None,
                "stockout_risk":       "low",
                "recommendation":      "No sales data in past 30 days",
                "forecast_days":       days_ahead,
            }

        # Average daily sales over 30 day window
        total_units = sum(d["units_sold"] for d in daily_sales)
        avg_daily   = total_units / 30

        # Predicted demand over forecast window
        predicted_demand = round(avg_daily * days_ahead)

        # Days until stockout
        days_until_stockout = None
        if avg_daily > 0:
            days_until_stockout = round(inventory / avg_daily)

        # Risk level
        if days_until_stockout is None:
            risk = "low"
        elif days_until_stockout <= 7:
            risk = "critical"
        elif days_until_stockout <= 14:
            risk = "high"
        elif days_until_stockout <= 30:
            risk = "medium"
        else:
            risk = "low"

        # Human readable recommendation
        recommendations_map = {
            "critical": f"Reorder immediately — stock runs out in ~{days_until_stockout} days",
            "high":     f"Reorder soon — stock runs out in ~{days_until_stockout} days",
            "medium":   "Monitor stock — consider reordering in the next 2 weeks",
            "low":      "Stock levels are healthy",
        }

        return {
            "product_id":          product_id,
            "product_name":        product_name,
            "current_inventory":   inventory,
            "avg_daily_sales":     round(avg_daily, 2),
            "predicted_demand":    predicted_demand,
            "days_until_stockout": days_until_stockout,
            "stockout_risk":       risk,
            "recommendation":      recommendations_map[risk],
            "forecast_days":       days_ahead,
        }

    @classmethod
    async def get_all_at_risk(cls, risk_level: str = "high") -> list:
        db = get_db()

        risk_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        threshold  = risk_order.get(risk_level, 1)

        products = await db.products.find(
            {"is_active": True},
            {"_id": 1}
        ).to_list(length=500)

        at_risk = []
        for p in products:
            forecast = await cls.forecast_product(str(p["_id"]))
            if "error" in forecast:
                continue
            product_risk = forecast.get("stockout_risk", "low")
            if risk_order.get(product_risk, 3) <= threshold:
                at_risk.append(forecast)

        # Sort by most critical first
        at_risk.sort(key=lambda x: risk_order.get(x.get("stockout_risk", "low"), 3))
        return at_risk