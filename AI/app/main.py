from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.database import connect_db, close_db, get_db_status
from app.routers import recommendations, sentiment, forecast
from app.services.recommendation_service import RecommendationService
from app.services.sentiment_service import SentimentService
from app.config import settings
import os
import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_db()
    os.makedirs(settings.model_path, exist_ok=True)

    # Load models with timeout — don't let startup hang forever
    try:
        await asyncio.wait_for(SentimentService.load_or_train(), timeout=60)
        print("Sentiment model ready")
    except asyncio.TimeoutError:
        print("Sentiment model timed out — will train on first request")
    except Exception as e:
        print(f"Sentiment model failed: {e}")

    try:
        await asyncio.wait_for(RecommendationService.load_or_train(), timeout=15)
        print("✅ Recommender model ready")
    except asyncio.TimeoutError:
        print("⚠️  Recommender timed out — will train when orders exist")
    except Exception as e:
        print(f"⚠️  Recommender failed: {e} — continuing without it")

    print("🚀 ML Service startup complete")
    yield

    # Shutdown
    await close_db()
    print("ML Service shut down")

app = FastAPI(
    title="E-Commerce ML Service",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(recommendations.router, prefix="/recommend",  tags=["Recommendations"])
app.include_router(sentiment.router,       prefix="/sentiment",  tags=["Sentiment"])
app.include_router(forecast.router,        prefix="/forecast",   tags=["Forecast"])

@app.get("/health")
async def health():
    db_status = get_db_status()
    return {
        "status":  "ok" if db_status["ready"] else "degraded",
        "service": "ml-backend",
        "database": db_status,
        "models": {
            "sentiment":       SentimentService._pipeline is not None,
            "recommender":     RecommendationService._similarity_matrix is not None,
        }
    }