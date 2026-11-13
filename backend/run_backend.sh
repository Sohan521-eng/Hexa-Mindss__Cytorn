#!/usr/bin/env bash
echo "========================================================"
echo " Starting CYCLO-AI Real-Time ML Backend (Port 8000)..."
echo "========================================================"
cd "$(dirname "$0")"
python3 server.py

