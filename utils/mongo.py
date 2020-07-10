from pymongo import MongoClient
import os

client = MongoClient(os.environ['MONGO_URI'])
db = client["img_tracker"]
app_col = db["app"]

def get_stored