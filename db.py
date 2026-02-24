from pymongo import MongoClient
from datetime import datetime

client = MongoClient("mongodb+srv://user1:test1234@cluster0.wh2clll.mongodb.net/?appName=Cluster0")
db = client["translator_db"]
collection = db["translations"]

def save_translation(data):
    data["timestamp"] = datetime.utcnow()
    collection.insert_one(data)

def get_history():
    return list(collection.find({}, {"_id": 0}).sort("timestamp", -1))