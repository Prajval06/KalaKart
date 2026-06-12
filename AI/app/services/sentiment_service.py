import joblib
import os
import asyncio
import warnings
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.exceptions import InconsistentVersionWarning
from app.config import settings
from app.database import get_db

MODEL_FILE = os.path.join(settings.model_path, "sentiment_model.joblib")

SEED_DATA = [
    ("excellent product love it highly recommend", "positive"),
    ("great quality fast delivery very happy", "positive"),
    ("amazing value for money works perfectly", "positive"),
    ("outstanding product exceeded expectations", "positive"),
    ("best purchase ever will buy again", "positive"),
    ("fantastic quality looks exactly like photos", "positive"),
    ("very satisfied worth every rupee", "positive"),
    ("good product arrived on time well packaged", "positive"),
    ("works great no issues happy with purchase", "positive"),
    ("perfect condition fast shipping five stars", "positive"),
    ("terrible quality broke after one day", "negative"),
    ("worst product ever waste of money", "negative"),
    ("does not work as described very disappointed", "negative"),
    ("poor quality arrived damaged not happy", "negative"),
    ("completely different from photos misleading", "negative"),
    ("stopped working after a week useless", "negative"),
    ("bad experience never buying again", "negative"),
    ("product is fake not original avoid", "negative"),
    ("very poor quality not worth the price", "negative"),
    ("arrived late broken packaging poor quality", "negative"),
    ("product is okay nothing special", "neutral"),
    ("average quality does the job", "neutral"),
    ("decent product but could be better", "neutral"),
    ("its fine not great not terrible", "neutral"),
    ("works as expected nothing more nothing less", "neutral"),
    ("okay for the price not amazing", "neutral"),
    ("mediocre product expected more for this price", "neutral"),
    ("got what I paid for nothing special", "neutral"),
]


def _train_sync() -> Pipeline:
    """
    Pure synchronous sklearn training.
    Must be called via asyncio.to_thread — never directly from an async context.
    """
    texts, labels = zip(*SEED_DATA)

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=5000,
            stop_words="english"
        )),
        ("clf", LogisticRegression(
            max_iter=1000,
            class_weight="balanced"
        )),
    ])

    pipeline.fit(list(texts), list(labels))

    os.makedirs(os.path.dirname(MODEL_FILE), exist_ok=True)
    joblib.dump(pipeline, MODEL_FILE)
    print(f"Sentiment model trained on {len(texts)} samples and saved to {MODEL_FILE}")
    return pipeline


def _predict_sync(pipeline: Pipeline, text: str) -> dict:
    """
    Pure synchronous sklearn inference.
    Must be called via asyncio.to_thread — never directly from an async context.
    """
    label      = pipeline.predict([text])[0]
    proba      = pipeline.predict_proba([text])[0]
    classes    = pipeline.classes_.tolist()
    confidence = float(proba[classes.index(label)])
    return {
        "label":      label,
        "confidence": round(confidence, 4)
    }


class SentimentService:

    _pipeline: Pipeline | None = None

    @classmethod
    async def load_or_train(cls):
        try:
            os.makedirs(os.path.dirname(MODEL_FILE), exist_ok=True)
            if os.path.exists(MODEL_FILE):
                # joblib.load is blocking file I/O — offload to thread
                cls._pipeline = await asyncio.to_thread(joblib.load, MODEL_FILE)
                print("Sentiment model loaded from disk")
            else:
                print("Training sentiment model from scratch...")
                cls._pipeline = await asyncio.to_thread(_train_sync)
        except Exception as e:
            import traceback
            print(f"SENTIMENT ERROR: {type(e).__name__}: {e}")
            traceback.print_exc()
            raise

    @classmethod
    async def predict(cls, text: str) -> dict:
        # If model not loaded yet — train in a thread (never blocks event loop)
        if cls._pipeline is None:
            print("Model not loaded — training in background thread on first request...")
            cls._pipeline = await asyncio.to_thread(_train_sync)

        # sklearn inference is CPU-bound — offload to thread
        return await asyncio.to_thread(_predict_sync, cls._pipeline, text)