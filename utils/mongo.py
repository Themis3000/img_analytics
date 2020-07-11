from pymongo import MongoClient
import os

client = MongoClient(os.environ['MONGO_URI'])
db = client["img_tracker"]
pages_col = db["pages"]
page_groups_col = db["page_groups"]


def create_page_tracker():
    pass


def add_page_view():
    pass


def create_page_group():
    pass
