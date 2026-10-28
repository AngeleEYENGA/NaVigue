@echo off
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo Python is required to start NaVigue locally.
  echo Install Python or open this folder with the VS Code Live Server extension.
  pause
  exit /b 1
)
python -c "import http.server, threading, webbrowser; server=http.server.ThreadingHTTPServer(('127.0.0.1', 0), http.server.SimpleHTTPRequestHandler); url=f'http://127.0.0.1:{server.server_port}/index.html'; threading.Timer(1, lambda: webbrowser.open(url)).start(); print(f'NaVigue is available at {url}'); server.serve_forever()"
if errorlevel 1 pause
