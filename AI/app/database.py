from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = None
db     = None
db_ready = False
db_error = None

async def connect_db():
    global client, db, db_ready, db_error
    client = AsyncIOMotorClient(settings.mongodb_url)
    db     = client.get_default_database()
    try:
        # Verify the selected database is actually readable by this URI.
        await db.list_collection_names()
        db_ready = True
        db_error = None
        print("✅ ML Service connected to MongoDB")
    except Exception as e:
        db_ready = False
        db_error = str(e)
        print("❌ MongoDB authentication failed for ML Service")
        print("   Update MONGO_URL with a valid Mongo URI that has read access to the target database")
        print("   Example local URI: mongodb://127.0.0.1:27017/kalakart")
        raise e

async def close_db():
    global client, db_ready
    if client:
        client.close()
    db_ready = False

def get_db():
    return db

def get_db_status():
    return {
        "ready": db_ready,
        "error": db_error,
        "database": db.name if db is not None else None,
    }