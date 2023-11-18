# -*- coding: utf-8 -*-

import http.server
import socketserver

# 設定伺服器的主機和埠號
host = "localhost"
port = 8000

# 切換到指定目錄，這裡使用當前目錄
directory = "." 

# 建立伺服器的handler
handler = http.server.SimpleHTTPRequestHandler

# 建立伺服器
with socketserver.TCPServer((host, port), handler) as httpd:
    print(f"Serving on http://{host}:{port}/")
    
    # 設定伺服器的根目錄
    httpd.serve_forever()
