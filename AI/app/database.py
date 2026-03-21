from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = None
db     = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.mongodb_url)
    db     = client.get_default_database()
    print("✅ ML Service connected to MongoDB")

async def close_db():
    global client
    if client:
        client.close()

def get_db():
    return db