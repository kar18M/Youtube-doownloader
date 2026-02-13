import os
import time
import uuid
import threading
import yt_dlp
import tempfile
from flask import Flask, request, jsonify, send_file, after_this_request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DOWNLOAD_FOLDER = "downloads"
if not os.path.exists(DOWNLOAD_FOLDER):
    os.makedirs(DOWNLOAD_FOLDER)

# Global dictionary to store job status
# Format: { job_id: { status: 'downloading', progress: 50, filename: '...', filepath: '...', error: None } }
jobs = {}

def cleanup_job(job_id):
    """Remove job from memory after some time"""
    time.sleep(300) # Keep job data for 5 minutes
    if job_id in jobs:
        del jobs[job_id]

def progress_hook(d, job_id):
    if d['status'] == 'downloading':
        try:
            p = d.get('_percent_str', '0%').replace('%','')
            jobs[job_id]['progress'] = float(p)
            jobs[job_id]['status'] = 'downloading'
        except:
            pass
    elif d['status'] == 'finished':
        jobs[job_id]['progress'] = 100
        jobs[job_id]['status'] = 'processing' # FFmpeg merge might happen after this

import imageio_ffmpeg

def download_worker(job_id, url, format_id):
    job = jobs[job_id]
    try:
        ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()
        # Configure yt-dlp
        ydl_opts = {
            'format': f"{format_id}+bestaudio/best" if format_id != 'best' else 'best',
            'outtmpl': os.path.join(DOWNLOAD_FOLDER, f'%(title)s_{job_id}.%(ext)s'),
            'progress_hooks': [lambda d: progress_hook(d, job_id)],
            'quiet': True,
            'no_warnings': True,
            'ffmpeg_location': os.path.dirname(ffmpeg_path),
            
            # Anti-403 Options
            'source_address': '0.0.0.0', # Force IPv4
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.google.com/'
            },
            'nocheckcertificate': True,
        }
        
        # Helper to handle cookies from Env
        cookie_file = None
        cookies_content = os.environ.get('COOKIES_CONTENT')
        if cookies_content:
            # Create a named temp file for cookies.txt
            # We use delete=False so we can close it and let yt-dlp open it by name
            # We'll try to clean it up later or rely on OS temp cleaning
            tf = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt')
            tf.write(cookies_content)
            tf.close()
            cookie_file = tf.name
            ydl_opts['cookiefile'] = cookie_file

        # Better yet:
        ydl_opts['ffmpeg_location'] = ffmpeg_path

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            job['filepath'] = filename
            job['filename'] = os.path.basename(filename)
            job['status'] = 'complete'
            job['progress'] = 100
            
    except Exception as e:
        job['status'] = 'error'
        job['error'] = str(e)
        print(f"Job {job_id} failed: {e}")

    # Schedule cleanup of job metadata
    # Schedule cleanup of job metadata
    def background_cleanup():
        cleanup_job(job_id)
        if 'cookie_file' in locals() and cookie_file and os.path.exists(cookie_file):
             try:
                 os.remove(cookie_file)
             except:
                 pass

    threading.Thread(target=background_cleanup, daemon=True).start()

@app.route('/api/video-info', methods=['POST'])
def get_video_info():
    data = request.json
    url = data.get('url')
    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    try:
        ydl_opts = {'quiet': True, 'no_warnings': True}
        
        # Helper to handle cookies from Env (Duplicated logic, ideally refactor to function)
        cookie_file = None
        cookies_content = os.environ.get('COOKIES_CONTENT')
        if cookies_content:
            tf = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt')
            tf.write(cookies_content)
            tf.close()
            cookie_file = tf.name
            ydl_opts['cookiefile'] = cookie_file
            
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            # Cleanup cookie file immediately after extraction
            if cookie_file and os.path.exists(cookie_file):
                try:
                    os.remove(cookie_file)
                except:
                    pass
            
            formats = []
            # Simplified format processing for frontend compatibility
            # We want: 1080p, 720p, Audio
            
            seen_res = set()
            for f in info.get('formats', []):
                # Adaptive video (no audio)
                if f.get('vcodec') != 'none' and f.get('acodec') == 'none':
                    res = f.get('resolution') or f"{f.get('height')}p"
                    if res not in seen_res and f.get('ext') == 'mp4':
                        formats.append({
                            'itag': f['format_id'], # Using format_id as itag
                            'resolution': f"{res} (Video)",
                            'mime_type': f"video/{f['ext']}",
                            'type': 'adaptive',
                            'filesize_approx': f.get('filesize', 0)
                        })
                        seen_res.add(res)
            
            # Add Audio Option
            formats.append({
                'itag': 'bestaudio/best', 
                'resolution': 'Audio Only',
                'mime_type': 'audio/mp3',
                'type': 'audio',
                'filesize_approx': 0
            })

            return jsonify({
                'title': info.get('title'),
                'author': info.get('uploader'),
                'thumbnail_url': info.get('thumbnail'),
                'views': info.get('view_count'),
                'streams': formats
            })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/start-download', methods=['POST'])
def start_download():
    data = request.json
    url = data.get('url')
    itag = data.get('itag') # format_id
    
    if not url or not itag:
        return jsonify({'error': 'Missing URL or itag'}), 400

    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        'status': 'initializing',
        'progress': 0,
        'url': url,
        'format_id': itag
    }

    # Start separate thread
    thread = threading.Thread(target=download_worker, args=(job_id, url, itag))
    thread.start()

    return jsonify({'job_id': job_id})

@app.route('/api/progress/<job_id>')
def get_progress(job_id):
    job = jobs.get(job_id)
    if not job:
        return jsonify({'status': 'error', 'error': 'Job not found'}), 404
    return jsonify(job)

@app.route('/api/get-file/<job_id>')
def get_file(job_id):
    job = jobs.get(job_id)
    if not job or job['status'] != 'complete':
        return jsonify({'error': 'File not ready'}), 400
    
    file_path = job['filepath']
    
    @after_this_request
    def remove_file(response):
        try:
           # Simple deferred delete. Since users might download slowly, 
           # practically we might want a cron job instead, but this is okay for single use.
           # Or just rely on cleanup_job to NOT delete the file, but maybe a temp cron.
           # For now, let's NOT delete immediately to allow retries, or delete after long delay.
           pass 
        except Exception as e:
            pass
        return response

    return send_file(file_path, as_attachment=True, download_name=job['filename'])

if __name__ == "__main__":
    app.run(debug=True, port=5000, host='0.0.0.0')
