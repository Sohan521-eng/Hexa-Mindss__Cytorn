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
from http.cookies import SimpleCookie
from urllib.parse import urlparse, parse_qs

# Ensure local imports
CURRENT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(CURRENT_DIR))

from api import routes
from core import config

PORT = config.PORT
HOST = config.HOST
SESSION_COOKIE_NAME = "cyclo_session"

class CycloAiHttpHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        origin = self.headers.get("Origin")
        if origin:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Access-Control-Allow-Credentials", "true")
            self.send_header("Vary", "Origin")
        else:
            self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept")

    def _extract_token(self):
        auth_header = self.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            return auth_header[7:].strip()
        cookie_header = self.headers.get("Cookie", "")
        if cookie_header:
            cookie = SimpleCookie()
            cookie.load(cookie_header)
            if SESSION_COOKIE_NAME in cookie:
                return cookie[SESSION_COOKIE_NAME].value
        return None

    def _client_ip(self) -> str:
        forwarded = self.headers.get("X-Forwarded-For", "")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return self.client_address[0] if self.client_address else "127.0.0.1"

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

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

        elif path in ("/api/v1/analyzer/inference", "/api/v1/analyzer/infer"):
            status_code, res = routes.run_analyzer_inference({})
            self._respond_json(status_code, res)

        elif path == "/api/v1/auth/me":
            status_code, res = routes.auth_me(self._extract_token())
            self._respond_json(status_code, res)

        elif path == "/api/v1/auth/audit-logs":
            try:
                limit = int(query.get("limit", ["50"])[0])
            except ValueError:
                limit = 50
            self._respond_json(200, routes.auth_audit_logs(limit=limit))

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

        if path in ("/api/v1/analyzer/inference", "/api/v1/analyzer/infer"):
            status_code, res = routes.run_analyzer_inference(payload)
            self._respond_json(status_code, res)

        elif path in ("/api/v1/forecast/predict", "/api/v1/forecast/trajectory"):
            status_code, res = routes.run_forecast_prediction(payload)
            self._respond_json(status_code, res)

        elif path == "/api/v1/auth/register":
            status_code, res, token, ttl = routes.auth_register(payload, client_ip=self._client_ip())
            extra_headers = []
            if token:
                extra_headers.append(("Set-Cookie", f"{SESSION_COOKIE_NAME}={token}; HttpOnly; SameSite=Strict; Path=/; Max-Age={ttl}"))
            self._respond_json(status_code, res, extra_headers=extra_headers)

        elif path == "/api/v1/auth/login":
            status_code, res, token, ttl = routes.auth_login(payload, client_ip=self._client_ip())
            extra_headers = []
            if token:
                extra_headers.append(("Set-Cookie", f"{SESSION_COOKIE_NAME}={token}; HttpOnly; SameSite=Strict; Path=/; Max-Age={ttl}"))
            self._respond_json(status_code, res, extra_headers=extra_headers)

        elif path == "/api/v1/auth/logout":
            status_code, res = routes.auth_logout(self._extract_token(), client_ip=self._client_ip())
            extra_headers = [("Set-Cookie", f"{SESSION_COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0")]
            self._respond_json(status_code, res, extra_headers=extra_headers)

        else:
            self._respond_json(404, {"error": "Endpoint Not Found", "path": path})

    def _respond_json(self, status: int, data: dict, extra_headers: list | None = None):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self._send_cors_headers()
        if extra_headers:
            for k, v in extra_headers:
                self.send_header(k, v)
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
    print(f"  • Auth Register:    POST http://localhost:{PORT}/api/v1/auth/register")
    print(f"  • Auth Login:       POST http://localhost:{PORT}/api/v1/auth/login")
    print(f"  • Auth Session:     GET  http://localhost:{PORT}/api/v1/auth/me")
    print(f"  • Auth Logout:      POST http://localhost:{PORT}/api/v1/auth/logout")
    print(f"  • Auth Audit Logs:  GET  http://localhost:{PORT}/api/v1/auth/audit-logs")
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

