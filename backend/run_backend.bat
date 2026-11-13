@echo off
title CYCLO-AI Real-Time ML Backend
echo ========================================================
echo  Starting CYCLO-AI Real-Time ML Backend (Port 8000)...
echo ========================================================
cd /d "%~dp0"
python server.py
pause

