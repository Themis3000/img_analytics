from threading import Thread
from typing import Union
from utils.ip_lookup import get_ip_data
from dataclasses import dataclass
from utils.mongo import add_page_view
import time


@dataclass()
class Visit:
    ip: str
    time_requested: int
    tracker_id: str
    referer: Union[str, None] = "(unknown)"

    def __post_init__(self):
        if self.referer is None:
            self.referer = "(unknown)"


class VisitRecorder(Thread):
    def __init__(self):
        Thread.__init__(self)
        self.daemon = True
        self.queue = []
        self.start()

    def run(self):
        while True:
            while len(self.queue) > 0:
                visit = self.queue.pop()
                ip_data = get_ip_data(visit.ip)
                if ip_data is None:
                    ip_data = {}
                ip_data.update({"time_requested": visit.time_requested,
                                "tracker_id": visit.tracker_id,
                                "ip": visit.ip,
                                "referer": visit.referer})
                add_page_view(ip_data)
            time.sleep(1)

    def add_visit(self, ip, tracker_id, referer=None):
        self.queue.append(Visit(ip, int(time.time()), tracker_id, referer))
