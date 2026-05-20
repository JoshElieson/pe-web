@echo off
cd /d "%~dp0"
echo Starting FORGE site at http://127.0.0.1:8765/
echo Press Ctrl+C to stop.
start "" "http://127.0.0.1:8765/"
python -m http.server 8765
