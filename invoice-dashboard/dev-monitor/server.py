#!/usr/bin/env python3
"""
Simple development server for Agent Monitor Dashboard
Run this to serve the monitoring interface separately from the main app
"""

import http.server
import socketserver
import webbrowser
import os
import threading
import time

PORT = 9999
DIRECTORY = "."

class MonitorHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Custom logging for agent monitor
        print(f"🎯 Agent Monitor: {format % args}")

def start_server():
    """Start the development monitoring server"""
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MonitorHandler) as httpd:
        print(f"🎯 Agent Development Monitor")
        print(f"📊 Dashboard URL: http://localhost:{PORT}")
        print(f"🚀 Server running on port {PORT}")
        print(f"📁 Serving from: {os.getcwd()}")
        print(f"💡 Press Ctrl+C to stop")
        print("-" * 50)
        
        # Auto-open browser after a short delay
        def open_browser():
            time.sleep(1)
            webbrowser.open(f'http://localhost:{PORT}')
        
        threading.Thread(target=open_browser, daemon=True).start()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Agent Monitor stopped")
            httpd.shutdown()

if __name__ == "__main__":
    start_server()