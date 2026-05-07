import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env.local")

mongo_uri = os.environ.get("MONGODB_URI")
if not mongo_uri:
    raise ValueError("MONGODB_URI is not set.")

client = MongoClient(mongo_uri)
# Get the default database from the connection string
db = client.get_default_database(default="chat-ai")
collection = db["document_chunks"]

def insert_chunks(chunks):
    if not chunks:
        return []
    
    docs = []
    for chunk in chunks:
        docs.append({
            "text": chunk.text,
            "embedding": chunk.embedding,
            "metadata": chunk.metadata
        })
    
    result = collection.insert_many(docs)
    return result.inserted_ids

def vector_search(query_embedding, limit=5):
    # This requires an Atlas Vector Search index named "vector_index"
    pipeline = [
        {
            "$vectorSearch": {
                "index": "vector_index",
                "path": "embedding",
                "queryVector": query_embedding,
                "numCandidates": limit * 10,
                "limit": limit
            }
        },
        {
            "$project": {
                "_id": 0,
                "text": 1,
                "metadata": 1,
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ]
    
    results = list(collection.aggregate(pipeline))
    return results
