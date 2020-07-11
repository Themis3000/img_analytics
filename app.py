from flask import Flask, send_file, request, make_response
import os
from utils.visit_recorder import VisitRecorder

app = Flask(__name__)
visit_recorder = VisitRecorder()
small_path = os.path.join(os.getcwd(), 'static', 'small.jpg')


@app.route('/')
def hello_world():
    return 'Hello World!'


@app.route('/<tracker_id>.jpeg')
def img_request(tracker_id):
    response = make_response(send_file(small_path, mimetype="image/jpeg"))
    response.headers["Cache-Control"] = "max-age=0, no-cache, no-store, must-retaliate"
    # request.environ.get is meant to help in thee situation of a proxy being used, may not always work in all
    # environments. See https://stackoverflow.com/a/26654607/5813879
    request_ip = request.environ.get('HTTP_X_REAL_IP', request.remote_addr)
    visit_recorder.add_visit("67.220.10.108", tracker_id)
    return response


if __name__ == '__main__':
    app.run()
