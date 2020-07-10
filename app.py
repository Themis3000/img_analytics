from flask import Flask, send_file, request

import os

app = Flask(__name__)
small_path = os.path.join(os.getcwd(), 'static', 'small.jpg')


@app.route('/')
def hello_world():
    return 'Hello World!'


@app.route('/img.jpeg')
def img_request():
    # request.environ.get is meant to help in thee situation of a proxy being used, may not always work in all
    # environments. See https://stackoverflow.com/a/26654607/5813879
    request_ip = request.environ.get('HTTP_X_REAL_IP', request.remote_addr)
    return send_file(small_path, mimetype="image/jpeg")


if __name__ == '__main__':
    app.run()
