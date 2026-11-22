import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent


class Utf8Handler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".html": "text/html; charset=UTF-8",
        ".css": "text/css; charset=UTF-8",
        ".js": "text/javascript; charset=UTF-8",
        ".json": "application/json; charset=UTF-8",
        ".svg": "image/svg+xml; charset=UTF-8",
        ".xml": "application/xml; charset=UTF-8",
        ".txt": "text/plain; charset=UTF-8",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8087)
    args = parser.parse_args()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), Utf8Handler)
    print(f"FITFUUX: http://127.0.0.1:{args.port}/index.html")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
