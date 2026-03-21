import asyncio
import sys
import os

# Make sure we use the right path
sys.path.insert(0, os.getcwd())

async def main():
    # Load config
    from app.config import settings
    print(f"Model path: {settings.model_path}")
    print(f"Model file will be: {settings.model_path}/sentiment_model.joblib")

    # Create folder if missing
    os.makedirs(settings.model_path, exist_ok=True)
    print(f"Folder exists: {os.path.exists(settings.model_path)}")

    # Try training
    from app.services.sentiment_service import SentimentService
    print("Training sentiment model...")
    await SentimentService.train()
    print("Done!")

    # Test prediction
    result = SentimentService.predict("this product is amazing love it")
    print(f"Test prediction: {result}")

asyncio.run(main())