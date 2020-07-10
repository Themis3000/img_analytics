from pymongo import mongo_client
import os

mongo = mongo_client(os.environ['MONGO_URI'])