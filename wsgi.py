from app import app
from utils.proxy_fix import ProxyFix

if __name__ == "__main__":
    app.wsgi_app = ProxyFix(app.wsgi_app)
    app.run()
