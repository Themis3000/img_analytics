from flask import Flask, send_file, request, make_response, render_template, redirect, url_for
import json
import os
from utils.visit_recorder import VisitRecorder
from utils import mongo

app = Flask(__name__)
visit_recorder = VisitRecorder()
small_path = os.path.join(os.getcwd(), 'static', 'small.jpg')


@app.route('/')
def index_page():
    return render_template('index.html')


@app.route('/img/<tracker_id>.jpeg')
def img_request(tracker_id):
    response = make_response(send_file(small_path, mimetype="image/jpeg"))
    # Instructs browsers to not cache image
    response.headers["Cache-Control"] = "max-age=0, no-cache, no-store, must-retaliate"
    # request.environ.get is meant to help in thee situation of a proxy being used, may not always work in all
    # environments. See https://stackoverflow.com/a/26654607/5813879
    request_ip = request.headers["X-Forwarded-For"] if "X-Forwarded-For" in request.headers else request.remote_addr
    referer = request.headers["Referer"] if "Referer" in request.headers else None
    visit_recorder.add_visit(request_ip, tracker_id, referer)
    return response


@app.route('/img/<tracker_id>')
def stats_redirect(tracker_id):
    return redirect(url_for('stats_page', tracker_id=tracker_id))


@app.route('/stats/<tracker_id>')
def stats_page(tracker_id):
    return render_template('stats.html')


@app.route('/api/create_tracker')
def create_tracker():
    tracker_id = mongo.create_page_tracker()
    return json.dumps({"tracker_id": tracker_id})


@app.route('/api/tracker/<tracker_id>')
def get_tracker(tracker_id):
    data = json.dumps(dict(mongo.get_tracker_data(tracker_id, 25, mask_ips=True)))
    return data


@app.route('/api/get_views/<tracker_id>')
def get_views(tracker_id):
    data = mongo.get_views_data(tracker_id, int(request.args['start']), int(request.args["amount"]))
    data = json.dumps({"views": data})
    return data
