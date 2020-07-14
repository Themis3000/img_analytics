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

# increment counters for these values in view_data if they're a non 0 length or none value on add_page_view
visits_counters = ["country_name", "city", "region_name", "referer"]


# mongo does not support having the . character as a dict key, so it must be replaced with another character
def encode_ip(ip: str):
    return ip.replace(".", "|")


def decode_ip(encoded_ip: str):
    return encoded_ip.replace("|", ".")


@retry(stop_max_attempt_number=3, retry_on_result=lambda result: isinstance(result, DuplicateKeyError))
def create_page_tracker():
    uuid = shortuuid.uuid()[:8]
    trackers_col.insert({"tracker_id": uuid,
                         "visits": [],
                         "visit_counts": {"all": 0},
                         "created_time": int(time.time())})
    return uuid


# count unique views
def add_page_view(view_data):
    inc_values = {}
    encoded_ip = encode_ip(view_data['ip'])
    for key in view_data:
        if key in visits_counters:
            count_value = "(unknown)" if len(view_data[key]) == 0 else view_data[key]
            inc_values[f"visit_counts.{key}.{count_value}"] = 1
    inc_values[f"visit_counts.users.{encoded_ip}"] = 1
    inc_values["visit_counts.all"] = 1

    trackers_col.update_one({"tracker_id": view_data["tracker_id"]},
                            {"$push": {"visits": view_data},
                             "$inc": inc_values,
                             "$set": {
                                 "visit_counts.unique": {"$cond": [
                                     {"$not": [f"visit_counts.users.{encoded_ip}"]},
                                     {"$add": ["$visit_counts.unique", 1]},
                                     "$visit_counts.unique"]}
                             }})

    # trackers_col.update_one({"tracker_id": view_data["tracker_id"]},
    #                         [{"$set":
    #                             {"$cond": [
    #                                 {"$not": [f"visit_counts.users.{encoded_ip}"]},
    #                                 {"$add": ["$visit_counts.unique", 1]},
    #                                 "$visit_counts.unique"
    #                             ]}}
    #                         ])


def get_views(tracker_id):
    trackers_col.find_one({"tracker_id": tracker_id},
                          {"array_field": {"$slice": -20}})


def create_page_group():
    pass
