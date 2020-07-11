from threading import Thread
from typing import Union
from utils.ip_lookup import get_ip_data
from dataclasses import make_dataclass, field, dataclass
import time


@dataclass()
class Visit:
    ip: str
    time_requested: int
    tracker_id: str
    referer: Union[str, None] = "(unknown)"

    def __post_init__(self):
        if type(self.referer) is None:
            self.referer = "(unknown)"


class VisitRecorder(Thread):
    def __init__(self):
        Thread.__init__(self)
        self.daemon = True
        self.queue = []
        self.start()

    def run(self):
        while True:
            if len(self.queue) > 0:
                ip_datas = []
                for visit in self.queue:
                    ip_data = get_ip_data(visit.ip)
                    if ip_data is None:
                        ip_data = {}
                    ip_data.update({"time_requested": visit.time_requested,
                                    "tracker_id": visit.tracker_id,
                                    "ip": visit.ip,
                                    "referer": visit.referer})
                    ip_datas.append(ip_data)
                print(f"adding {ip_datas}")
                self.queue = []
            time.sleep(1)

    def add_visit(self, ip, tracker_id, referer=None):
        self.queue.append(Visit(ip, int(time.time()), tracker_id, referer))
