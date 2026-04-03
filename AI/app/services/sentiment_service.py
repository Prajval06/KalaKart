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


def _train_sync():
    """
    Pure synchronous sklearn training.
    Called inside a thread so it never blocks the event loop.
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


class SentimentService:

    _pipeline: Pipeline | None = None

    @classmethod
    async def load_or_train(cls):
        """Load saved model or train in background thread."""
        try:
            if os.path.exists(MODEL_FILE):
                loop = asyncio.get_event_loop()

                def _load_model_with_warning_check():
                    with warnings.catch_warnings(record=True) as caught:
                        warnings.simplefilter("always", InconsistentVersionWarning)
                        loaded = joblib.load(MODEL_FILE)
                    version_warning = any(
                        issubclass(w.category, InconsistentVersionWarning) for w in caught
                    )
                    return loaded, version_warning

                # If the sklearn artifact version is stale, retrain to avoid risky inference.
                loaded_pipeline, has_version_mismatch = await loop.run_in_executor(
                    None, _load_model_with_warning_check
                )
                if has_version_mismatch:
                    print("Sentiment model version mismatch detected — retraining model")
                    cls._pipeline = await loop.run_in_executor(None, _train_sync)
                else:
                    cls._pipeline = loaded_pipeline
                    print("Sentiment model loaded from disk")
            else:
                print(f"No saved model found — training in background thread...")
                # Run blocking sklearn training in thread pool
                loop = asyncio.get_event_loop()
                cls._pipeline = await loop.run_in_executor(None, _train_sync)
                print("Sentiment model ready")
        except Exception as e:
            import traceback
            print(f"SENTIMENT ERROR: {type(e).__name__}: {e}")
            traceback.print_exc()

    @classmethod
    def predict(cls, text: str) -> dict:
        # If model not loaded yet — train synchronously right now
        # This handles the case where startup training was skipped
        if cls._pipeline is None:
            print("Model not loaded — training synchronously on first request...")
            cls._pipeline = _train_sync()

        label      = cls._pipeline.predict([text])[0]
        proba      = cls._pipeline.predict_proba([text])[0]
        classes    = cls._pipeline.classes_.tolist()
        confidence = float(proba[classes.index(label)])

        return {
            "label":      label,
            "confidence": round(confidence, 4)
        }