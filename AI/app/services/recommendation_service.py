import joblib
import os
import asyncio
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from app.config import settings
from app.database import get_db
from bson import ObjectId

MODEL_FILE = os.path.join(settings.model_path, "recommender.joblib")


def _load_model_sync(path: str) -> dict:
    """Blocking joblib load — run via asyncio.to_thread."""
    return joblib.load(path)


def _compute_similarity_sync(orders: list) -> dict | None:
    """
    Pure CPU-bound computation: builds the pandas user-product matrix,
    runs cosine_similarity, then persists the result via joblib.dump.
    Must be called via asyncio.to_thread — never directly from an async context.
    Returns a dict with matrix/product_ids/product_index, or None if not enough data.
    """
    rows = []
    for order in orders:
        user_id = str(order["user_id"])
        for item in order.get("items", []):
            rows.append({
                "user_id":    user_id,
                "product_id": str(item["product_id"])
            })

    df = pd.DataFrame(rows)
    if df.empty:
        return None

    # Pivot: rows=products, cols=users, values=purchase count
    matrix = df.groupby(["product_id", "user_id"]).size().unstack(fill_value=0)

    product_ids   = matrix.index.tolist()
    product_index = {pid: i for i, pid in enumerate(product_ids)}

    # Cosine similarity between products (CPU-bound)
    similarity_matrix = cosine_similarity(matrix.values)

    result = {
        "matrix":        similarity_matrix,
        "product_ids":   product_ids,
        "product_index": product_index,
    }

    os.makedirs(settings.model_path, exist_ok=True)
    joblib.dump(result, MODEL_FILE)
    print(f"✅ Recommender trained on {len(product_ids)} products, {len(orders)} orders")
    return result


class RecommendationService:

    _similarity_matrix: np.ndarray | None = None
    _product_ids:       list | None = None
    _product_index:     dict | None = None

    @classmethod
    async def load_or_train(cls):
        if os.path.exists(MODEL_FILE):
            # joblib.load is blocking file I/O — offload to thread
            data = await asyncio.to_thread(_load_model_sync, MODEL_FILE)
            cls._similarity_matrix = data["matrix"]
            cls._product_ids        = data["product_ids"]
            cls._product_index      = data["product_index"]
            print("✅ Recommender model loaded from disk")
        else:
            await cls.train()

    @classmethod
    async def train(cls):
        """
        Build a product-product similarity matrix from order history.
        Products bought together frequently become more similar.
        """
        db = get_db()
        if db is None:
            print("⚠️  No DB connection — recommender skipped")
            return

        # Pull all orders with their items (async Motor I/O — fine on event loop)
        orders = await db.orders.find(
            {"status": {"$in": ["paid", "shipped", "delivered"]}},
            {"user_id": 1, "items.product_id": 1}
        ).to_list(length=10000)

        if len(orders) < 5:
            print("⚠️  Not enough orders to train recommender — need at least 5")
            return

        # Offload CPU-bound pandas/numpy/joblib work to a thread
        result = await asyncio.to_thread(_compute_similarity_sync, orders)
        if result is None:
            return

        cls._similarity_matrix = result["matrix"]
        cls._product_ids        = result["product_ids"]
        cls._product_index      = result["product_index"]

    @classmethod
    async def get_similar_products(cls, product_id: str, top_n: int = 5) -> list[str]:
        """Returns list of similar product_id strings."""
        if cls._similarity_matrix is None or cls._product_index is None:
            return []

        if product_id not in cls._product_index:
            # Product not in training data — return popular products instead
            return await cls._get_popular_products(top_n)

        idx          = cls._product_index[product_id]
        sim_scores   = list(enumerate(cls._similarity_matrix[idx]))
        sim_scores   = sorted(sim_scores, key=lambda x: x[1], reverse=True)

        # Skip the product itself (index 0 will be itself with score 1.0)
        similar_ids = [
            cls._product_ids[i]
            for i, score in sim_scores[1:top_n + 1]
            if score > 0
        ]

        # If not enough similar products found, pad with popular ones
        if len(similar_ids) < top_n:
            popular = await cls._get_popular_products(top_n)
            for pid in popular:
                if pid not in similar_ids and pid != product_id:
                    similar_ids.append(pid)
                if len(similar_ids) >= top_n:
                    break

        return similar_ids[:top_n]

    @classmethod
    async def _get_popular_products(cls, top_n: int) -> list[str]:
        """Fallback — most ordered products overall."""
        db = get_db()
        if db is None:
            return []

        pipeline = [
            {"$unwind": "$items"},
            {"$group": {
                "_id":   "$items.product_id",
                "count": {"$sum": "$items.quantity"}
            }},
            {"$sort":  {"count": -1}},
            {"$limit": top_n}
        ]

        results = await db.orders.aggregate(pipeline).to_list(length=top_n)
        return [str(r["_id"]) for r in results]