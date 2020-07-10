import requests
from functools import lru_cache
import time

api_url = "https://freegeoip.app/json/"


def cache_maintainer(clear_time: int):
    """
    :param clear_time: In seconds, how often to clear cache (only checks when called)
    """
    def inner(func):
        def wrapper(*args, **kwargs):
            if hasattr(func, 'next_clear'):
                if time.time() > func.next_clear:
                    func.cache_clear()
                    func.next_clear = time.time() + clear_time
            else:
                func.next_clear = time.time() + clear_time

            func(*args, **kwargs)
        return wrapper
    return inner


@cache_maintainer(86400)  # clear cache every 1 day
@lru_cache(maxsize=1000)
def get_ip_data(ip):
    print(ip)
    return requests.get(api_url + ip).json()

