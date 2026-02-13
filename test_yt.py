from pytubefix import YouTube
import sys

url = "https://youtu.be/x9E0XWJ_cWM?si=D5l3cDb7aXvSXJaK"
try:
    print(f"Attempting to fetch: {url}")
    yt = YouTube(url)
    print(f"Title: {yt.title}")
    print("Success")
except Exception as e:
    print(f"Error: {e}")
