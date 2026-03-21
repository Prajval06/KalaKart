from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    ml_service_port:    int = 8001
    mongodb_url:        str = Field(default="mongodb://localhost:27017/ecommerce")
    model_path:         str = Field(default="app/ml/models")
    node_backend_url:   str = "http://localhost:8000"
    environment:        str = "development"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

settings = Settings()
print(f"📋 Config loaded — MongoDB: {settings.mongodb_url[:30]}...")
print(f"📋 Model path: {settings.model_path}")