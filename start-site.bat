@echo off
cd /d "%~dp0"
start "FITFUUX server" cmd /k python serve.py
timeout /t 2 >nul
start "" "http://127.0.0.1:8087/index.html"
