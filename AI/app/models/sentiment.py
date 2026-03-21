from pydantic import BaseModel
from typing import Literal

class SentimentRequest(BaseModel):
    text: str
    review_id: str | None = None  # optional — for batch tagging

class SentimentResponse(BaseModel):
    label:      Literal["positive", "negative", "neutral"]
    confidence: float               # 0.0 to 1.0
    review_id:  str | None = None