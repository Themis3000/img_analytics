import requests
from cachetools import cached, TTLCache

api_url = "https://freegeoip.app/json/"


@cached(cache=TTLCache(maxsize=1000, ttl=345600))  # removes a given entry from cache every 4 days
def get_ip_data(ip):
    response = requests.get(api_url + ip)
    return response.json()
