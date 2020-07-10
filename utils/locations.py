import os
import requests

db_url = f"https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City-CSV&license_key={os.environ['LICENSE_KEY']}&suffix=zip"
db_sha256_url = f"https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City-CSV&license_key={os.environ['LICENSE_KEY']}&suffix=zip.sha256"
current_sha256 = None
