from pytubefix import YouTube
import sys

url = "https://youtu.be/SkcO47UDzzY?si=z27yNx_o1O_HcPfr"

print(f"Testing URL: {url}")

configs = [
    {"client": "WEB", "use_oauth": False, "allow_oauth_cache": False},
    {"client": "ANDROID", "use_oauth": False, "allow_oauth_cache": False},
    {"client": "IOS", "use_oauth": False, "allow_oauth_cache": False},
    {"client": "WEB", "use_oauth": True, "allow_oauth_cache": True}, # Just to see what happens
]

for conf in configs:
    print(f"\n--- Testing Config: {conf} ---")
    try:
        yt = YouTube(url, **conf)
        print(f"Title: {yt.title}")
        print("SUCCESS")
        break
    except Exception as e:
        print(f"FAILED: {e}")
