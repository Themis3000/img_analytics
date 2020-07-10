from threading import Thread
from utils.ip_lookup import get_ip_data
import time


class VisitRecorder(Thread):
    def __init__(self):
        Thread.__init__(self)
        self.daemon = True
        self.queue = []
        self.start()

    def run(self):
        while True:
            if len(self.queue) > 0:
                print(f"adding {self.queue}")
                self.queue = []
            time.sleep(1)

    def add_visit(self, ip):
        self.queue.append(ip)
