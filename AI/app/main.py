from fastapi import FastAPI, Response
from contextlib import asynccontextmanager
from app.database import connect_db, close_db, get_db_status
from app.routers import recommendations, sentiment, forecast
from app.services.recommendation_service import RecommendationService
from app.services.sentiment_service import SentimentService
from app.config import settings
import os
import sys
import asyncio

# Tracks whether the service completed a successful startup.
# Used by /health and /ready — prevents partially-initialized pods from
# receiving live traffic even if uvicorn begins accepting connections early.
_service_ready = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _service_ready

    # ── Step 1: MongoDB — hard dependency ─────────────────────────────────────
    # connect_db raises on failure; let it propagate so uvicorn aborts startup.
    try:
        await connect_db()
    except Exception as e:
        print(f"FATAL: MongoDB connection failed at startup: {e}")
        print("Service cannot start without a database connection. Exiting.")
        sys.exit(1)

    os.makedirs(settings.model_path, exist_ok=True)

    # ── Step 2: Sentiment model — hard dependency ──────────────────────────────
    # Sentiment always has seed data so there is no legitimate reason for it to
    # fail. A failure here indicates a broken environment (disk, memory, import).
    try:
        await asyncio.wait_for(SentimentService.load_or_train(), timeout=60)
        print("Sentiment model ready")
    except asyncio.TimeoutError:
        print("FATAL: Sentiment model timed out after 60s.")
        print("Check disk space and model path. Exiting.")
        sys.exit(1)
    except Exception as e:
        print(f"FATAL: Sentiment model failed to load/train: {e}")
        sys.exit(1)

    # ── Step 3: Recommender model — soft dependency ────────────────────────────
    # The recommender requires order history (≥5 orders). A fresh deployment
    # has none. Log clearly but allow startup to succeed without it.
    try:
        await asyncio.wait_for(RecommendationService.load_or_train(), timeout=30)
        if RecommendationService._similarity_matrix is not None:
            print("Recommender model ready")
        else:
            print("WARNING: Recommender model not trained — insufficient order data (need ≥5 orders)")
            print("WARNING: Recommendations will fall back to popular products until retrained")
    except asyncio.TimeoutError:
        print("WARNING: Recommender model timed out after 30s — continuing without it")
    except Exception as e:
        print(f"WARNING: Recommender model failed: {e} — continuing without it")

    # ── Startup complete ───────────────────────────────────────────────────────
    _service_ready = True
    print("ML Service startup complete — service is ready")

    yield

    # ── Shutdown ───────────────────────────────────────────────────────────────
    _service_ready = False
    await close_db()
    print("ML Service shut down cleanly")


app = FastAPI(
    title="E-Commerce ML Service",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(recommendations.router, prefix="/recommend",  tags=["Recommendations"])
app.include_router(sentiment.router,       prefix="/sentiment",  tags=["Sentiment"])
app.include_router(forecast.router,        prefix="/forecast",   tags=["Forecast"])


@app.get("/health")
async def health(response: Response):
    """
    Liveness probe: returns 503 if the database is disconnected or
    the service never completed startup.
    """
    db_status         = get_db_status()
    sentiment_ready   = SentimentService._pipeline is not None
    recommender_ready = RecommendationService._similarity_matrix is not None

    is_healthy = _service_ready and db_status["ready"]
    response.status_code = 200 if is_healthy else 503

    return {
        "status":   "ok" if is_healthy else "degraded",
        "service":  "ml-backend",
        "ready":    _service_ready,
        "database": db_status,
        "models": {
            "sentiment":   sentiment_ready,
            "recommender": recommender_ready,
        }
    }


@app.get("/ready")
async def readiness(response: Response):
    """
    Readiness probe: returns 503 until ALL hard dependencies are satisfied.
    Use this for Kubernetes readinessProbe / ALB target group health checks.
    The recommender is a soft dependency — it does not block readiness.
    """
    db_status       = get_db_status()
    sentiment_ready = SentimentService._pipeline is not None

    # Hard requirements: startup finished, DB connected, sentiment model loaded
    is_ready = _service_ready and db_status["ready"] and sentiment_ready
    response.status_code = 200 if is_ready else 503

    return {
        "ready":              is_ready,
        "startup_complete":   _service_ready,
        "database":           db_status["ready"],
        "sentiment_model":    sentiment_ready,
        "recommender_model":  RecommendationService._similarity_matrix is not None,
    }