#!/usr/bin/env python3
"""
CYCLO-AI Central Backend Server
Real-Time Machine Learning API Service for Meteorological Telemetry,
Multispectral Pattern Classification, and Physics-Informed Trajectory Projections.

Port: 8000 (Matches NEXT_PUBLIC_API_URL)
Dual Mode:
  1. Standard Library Mode (Zero external dependencies required)
  2. FastAPI / Uvicorn Mode (Automatically enabled if packages are installed)
"""

import sys
import os
import json
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

# Ensure local imports
CURRENT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(CURRENT_DIR))

from api import routes
from core import config

PORT = config.PORT
HOST = config.HOST

class CycloAiHttpHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept")

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path in ["/", "/health", "/api/v1/health"]:
            self._respond_json(200, routes.get_health())

        elif path == "/api/v1/storms/active":
            self._respond_json(200, routes.get_active_storms())

        elif path == "/api/v1/ticker/feed":
            self._respond_json(200, routes.get_ticker_feed())

        elif path == "/api/v1/metrics/benchmarks":
            self._respond_json(200, routes.get_metrics_benchmarks())

        elif path == "/api/v1/satellite/realtime-feed":
            self._respond_json(200, routes.get_satellite_feed())

        elif path == "/api/v1/dashboard/telemetry":
            self._respond_json(200, routes.get_dashboard_telemetry())

        else:
            self._respond_json(404, {"error": "Endpoint Not Found", "path": path})

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        content_len = int(self.headers.get("Content-Length", 0))
        post_body = self.rfile.read(content_len) if content_len > 0 else b"{}"

        try:
            payload = json.loads(post_body.decode("utf-8")) if post_body else {}
        except json.JSONDecodeError:
            payload = {}

        if path == "/api/v1/analyzer/inference":
            status_code, res = routes.run_analyzer_inference(payload)
            self._respond_json(status_code, res)

        elif path == "/api/v1/forecast/predict":
            status_code, res = routes.run_forecast_prediction(payload)
            self._respond_json(status_code, res)

        else:
            self._respond_json(404, {"error": "Endpoint Not Found", "path": path})

    def _respond_json(self, status: int, data: dict):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        # Professional minimal logging
        print(f"[CYCLO-AI BACKEND] {self.address_string()} - {format % args}")

def run_server():
    server_address = (HOST, PORT)
    httpd = HTTPServer(server_address, CycloAiHttpHandler)
    print("=" * 75)
    print(f"🌪️  CYCLO-AI Real-Time ML Backend Running on http://localhost:{PORT}")
    print("=" * 75)
    print("Available Endpoints:")
    print(f"  • Health Check:     GET  http://localhost:{PORT}/api/v1/health")
    print(f"  • Active Storms:    GET  http://localhost:{PORT}/api/v1/storms/active")
    print(f"  • Live Ticker Feed: GET  http://localhost:{PORT}/api/v1/ticker/feed")
    print(f"  • Model Metrics:    GET  http://localhost:{PORT}/api/v1/metrics/benchmarks")
    print(f"  • Satellite Feed:   GET  http://localhost:{PORT}/api/v1/satellite/realtime-feed")
    print(f"  • Analyzer Model 1: POST http://localhost:{PORT}/api/v1/analyzer/inference")
    print(f"  • Forecast Model 2: POST http://localhost:{PORT}/api/v1/forecast/predict")
    print("-" * 75)
    print("Anti-Hallucination Guardrails: ACTIVE (Atkinson-Holliday, PINN Kinematic Bounds)")
    print("=" * 75)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping CYCLO-AI Backend...")
        httpd.server_close()

if __name__ == "__main__":
    run_server()

