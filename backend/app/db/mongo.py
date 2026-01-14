from dotenv import load_dotenv
import os 
import asyncio
import pymongo
# from pymongo.mongo_client import MongoClient
# from pymongo.server_api import ServerApi
from pymongo import AsyncMongoClient

load_dotenv()

uri = os.getenv("MONGO_URI")

client = AsyncMongoClient(uri, server_api=pymongo.server_api.ServerApi(
   version="1", strict=True, deprecation_errors=True))

db = client.doctor_db
