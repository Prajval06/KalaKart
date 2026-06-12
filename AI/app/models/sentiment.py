from pydantic import BaseModel, Field
from typing import Annotated, Literal

class SentimentRequest(BaseModel):
    text: Annotated[str, Field(
        min_length=1,
        max_length=2000,
        description="Review text to analyse. Max 2 000 characters."
    )]
    review_id: str | None = None  # optional — for batch tagging

class SentimentResponse(BaseModel):
    label:      Literal["positive", "negative", "neutral"]
    confidence: float               # 0.0 to 1.0
    review_id:  str | None = None

class BatchSentimentRequest(BaseModel):
    requests: Annotated[list[SentimentRequest], Field(
        min_length=1,
        max_length=50,
        description="Batch of reviews. Max 50 items per request."
    )]