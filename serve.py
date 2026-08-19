#!/usr/bin/env python3
"""
serve.py — chạy ba prototype ở http://localhost:8000 và giữ API key ở phía server.

Cách dùng:
    1. copy .env.example .env      rồi dán OPENAI_API_KEY thật vào .env
    2. python serve.py
    3. mở http://localhost:8000/proA.html  (hoặc proB.html / proC.html)

Vì sao cần file này:
    - Trình duyệt không đọc được file .env, nên phải có một tiến trình đọc hộ.
    - Key chỉ nằm trong tiến trình Python này, KHÔNG bao giờ đi xuống trình duyệt.
    - Trang web gọi /api/chat cùng origin nên hết luôn lỗi CORS của file://

Chỉ dùng thư viện chuẩn của Python 3 — không phải cài gì thêm.
"""

import http.server
import json
import os
import pathlib
import socketserver
import sys
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent
API_URL = "https://api.openai.com/v1/chat/completions"
DEFAULT_MODEL = "gpt-4o"


def load_env() -> dict:
    """Đọc .env (và .env.local nếu có) theo kiểu KEY=VALUE, bỏ qua dòng trống/# ."""
    data = {}
    for name in (".env", ".env.local"):
        path = ROOT / name
        if not path.exists():
            continue
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            data[key.strip()] = value.strip().strip('"').strip("'")
    return data


ENV = load_env()
API_KEY = ENV.get("OPENAI_API_KEY", "") or os.environ.get("OPENAI_API_KEY", "")
MODEL = ENV.get("OPENAI_MODEL", "") or DEFAULT_MODEL
PORT = int(ENV.get("PORT", "") or os.environ.get("PORT", "") or 8000)

# Key mẫu trong .env.example không tính là key thật
if API_KEY.startswith("sk-dan-key"):
    API_KEY = ""


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    # --- tiện ích ---
    def send_json(self, code: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def send_raw(self, code: int, body: bytes) -> None:
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):          # bớt ồn, chỉ in lỗi
        if not str(args[0] if args else "").startswith(("GET", "POST")):
            super().log_message(fmt, *args)

    # --- route ---
    def do_GET(self):
        if self.path.split("?")[0].endswith("/api/status"):
            return self.send_json(200, {"ready": bool(API_KEY), "model": MODEL})
        return super().do_GET()

    def do_POST(self):
        if not self.path.split("?")[0].endswith("/api/chat"):
            return self.send_json(404, {"error": {"message": "Không có route này."}})

        if not API_KEY:
            return self.send_json(400, {"error": {"message":
                "Chưa có OPENAI_API_KEY. Copy .env.example thành .env, "
                "dán key thật vào rồi chạy lại serve.py."}})

        length = int(self.headers.get("content-length") or 0)
        raw = self.rfile.read(length) if length else b"{}"
        try:
            payload = json.loads(raw.decode("utf-8"))
        except ValueError:
            return self.send_json(400, {"error": {"message": "Body không phải JSON hợp lệ."}})

        payload["model"] = MODEL          # model do server quyết định, theo .env

        req = urllib.request.Request(
            API_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "content-type": "application/json",
                "authorization": "Bearer " + API_KEY,
            },
            method="POST")

        streaming = bool(payload.get("stream"))

        try:
            with urllib.request.urlopen(req, timeout=180) as res:
                if not streaming:
                    return self.send_raw(res.status, res.read())

                # Chế độ trò chuyện thời gian thực: đẩy từng mẩu SSE xuống
                # trình duyệt ngay khi nhận được, không chờ trả lời xong.
                self.send_response(res.status)
                self.send_header("Content-Type", "text/event-stream; charset=utf-8")
                self.send_header("Cache-Control", "no-store")
                self.send_header("X-Accel-Buffering", "no")
                self.end_headers()
                while True:
                    chunk = res.read(512)
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    self.wfile.flush()
        except urllib.error.HTTPError as e:
            # trả nguyên lỗi của OpenAI để giao diện hiện đúng thông báo
            self.send_raw(e.code, e.read())
        except (BrokenPipeError, ConnectionResetError):
            pass                          # người dùng đóng tab giữa chừng
        except Exception as e:            # mất mạng, timeout...
            if not streaming:
                self.send_json(502, {"error": {"message": "Không gọi được API: %s" % e}})


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


def main() -> None:
    # Console Windows mặc định là cp1252, in tiếng Việt sẽ lỗi — ép sang UTF-8.
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    print("=" * 62)
    print("  Prototype Day 18 — server nội bộ")
    print("  Thư mục :", ROOT)
    print("  Model   :", MODEL)
    print("  API key :", "đã đọc từ .env ✓" if API_KEY
          else "CHƯA CÓ — copy .env.example thành .env rồi dán key vào")
    print("-" * 62)
    print("  Mở:  http://localhost:%d/proA.html" % PORT)
    print("       http://localhost:%d/proB.html" % PORT)
    print("       http://localhost:%d/proC.html" % PORT)
    print("  Dừng server: Ctrl + C")
    print("=" * 62)
    try:
        with Server(("127.0.0.1", PORT), Handler) as httpd:
            httpd.serve_forever()
    except OSError as e:
        print("Không mở được cổng %d (%s). Đổi PORT trong .env rồi chạy lại." % (PORT, e))
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nĐã dừng server.")


if __name__ == "__main__":
    main()
