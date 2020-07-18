from app import app

if __name__ == "__main__":
    app.wsgi_app = app.wsgi_app
    app.run()
