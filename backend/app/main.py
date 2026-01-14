from fastapi import FastAPI 

app = FastAPI()

@app.get("/test_db")
async def test_db():
    from db import mongo

    collections = await mongo.db.list_collection_names()

    return {
        "collections":  collections
    }


    