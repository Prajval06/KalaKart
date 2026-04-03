from pydantic_settings import BaseSettings
from pydantic import Field, AliasChoices

class Settings(BaseSettings):
    ml_service_port:    int = Field(default=8001, validation_alias="PORT")
    mongodb_url:        str = Field(
        default="mongodb://localhost:27017/ecommerce",
        validation_alias=AliasChoices("MONGO_URL", "MONGODB_URL", "MONGO_URI"),
    )
    model_path:         str = Field(default="app/ml/models")
    node_backend_url:   str = Field(default="http://localhost:5000", validation_alias="NODE_BACKEND_URL")
    environment:        str = Field(default="development", validation_alias="NODE_ENV")

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }

settings = Settings()
print(f"📋 Config loaded — MongoDB: {settings.mongodb_url[:30]}...")
print(f"📋 Model path: {settings.model_path}")