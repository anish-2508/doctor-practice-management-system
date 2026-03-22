# MongoDB database connection and initialization
from dotenv import load_dotenv
import os 
import asyncio
import pymongo
from pymongo import AsyncMongoClient

load_dotenv()

# Get MongoDB connection URI from environment
uri = os.getenv("MONGO_URI")

# Initialize async MongoDB client with server API
client = AsyncMongoClient(uri, server_api=pymongo.server_api.ServerApi(
version="1", strict=True, deprecation_errors=True))

# Access the main database
db = client.doctor_practice_app_db

# Dependency function to get database instance
def get_db():
   return db



