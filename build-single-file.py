#!/usr/bin/env python3
"""
Bundle the app into one self-contained file: dist/index.html

You do not need this to publish the app -- GitHub Pages serves the folder as
it is, and that loads faster. Use it when you need a single file you can
e-mail, open straight off a USB stick, or paste somewhere that only takes
one HTML file.

    python3 build-single-file.py
"""
import base64, mimetypes, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "dist")


def read(name):
    with open(os.path.join(HERE, name), encoding="utf-8") as fh:
        return fh.read()


def data_uri(rel_path):
    full = os.path.join(HERE, rel_path)
    if not os.path.exists(full):
        print("  ! missing file, left as a path:", rel_path)
        return rel_path
    mime = mimetypes.guess_type(full)[0] or "application/octet-stream"
    with open(full, "rb") as fh:
        return "data:%s;base64,%s" % (mime, base64.b64encode(fh.read()).decode())


def inline_assets(text):
    """turn every assets/... reference into the picture itself"""
    return re.sub(r'(["\'])(assets/[^"\']+)\1',
                  lambda m: m.group(1) + data_uri(m.group(2)) + m.group(1), text)


def main():
    html = read("index.html")
    css = read("styles.css")
    config = read("event.config.js")
    app = read("app.js")

    html = html.replace('<link rel="stylesheet" href="styles.css">',
                        "<style>\n" + css + "\n</style>")
    html = html.replace('<script src="event.config.js"></script>\n<script src="app.js"></script>',
                        "<script>\n" + config + "\n</script>\n<script>\n" + app + "\n</script>")
    if "styles.css" in html or "app.js" in html:
        sys.exit("could not inline the css/js -- did the <link>/<script> tags in index.html change?")

    html = inline_assets(html)
    if re.search(r'["\']assets/', html):
        print("  ! some assets could not be inlined")

    os.makedirs(OUT_DIR, exist_ok=True)
    out = os.path.join(OUT_DIR, "index.html")
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(html)
    print("written %s  (%.1f MB)" % (out, os.path.getsize(out) / 1e6))


if __name__ == "__main__":
    main()
