from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
import time
import os
import shortuuid
from retrying import retry

client = MongoClient(os.environ['MONGO_URI'])
db = client["img_tracker"]
trackers_col = db["trackers"]

trackers_col.create_index("tracker_id", unique=True)


@retry(stop_max_attempt_number=3, retry_on_result=lambda result: isinstance(result, DuplicateKeyError))
def create_page_tracker():
    uuid = shortuuid.uuid()[:8]
    trackers_col.insert({"tracker_id": uuid,
                         "visits": [],
                         "visit_counts": [],
                         "created_time": int(time.time())})
    return uuid


def add_page_view(view_data):
    trackers_col.update_one({"tracker_id": view_data["tracker_id"]},
                            {"$push": {"visits": view_data}})


def get_views():
    pass


def create_page_group():
    pass
