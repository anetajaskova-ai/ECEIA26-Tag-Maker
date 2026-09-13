"""Print-ready QR material for the ECEIA26 tag maker."""
import os
import qrcode
from qrcode.constants import ERROR_CORRECT_Q
from PIL import Image, ImageDraw, ImageFont

URL   = "https://anetajaskova-ai.github.io/ECEIA26-Tag-Maker/"
SHORT = "anetajaskova-ai.github.io/ECEIA26-Tag-Maker"

CREAM, CIRCLE, INK, SOFT, TEAL = "#FFFCF3", "#F8F5EB", "#3A3A3C", "#5F6868", "#009999"
SERIF   = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
SANS    = "/System/Library/Fonts/Avenir Next.ttc"
REGULAR, MEDIUM, DEMI = 7, 5, 2


def qr_image(px, fg=INK, bg="white"):
    q = qrcode.QRCode(error_correction=ERROR_CORRECT_Q, box_size=10, border=2)
    q.add_data(URL)
    q.make(fit=True)
    im = q.make_image(fill_color=fg, back_color=bg).convert("RGB")
    return im.resize((px, px), Image.NEAREST), q.version, q.modules_count


def fit(draw, text, path, target_w, start, index=None):
    """largest size at which the line still fits the column"""
    size = start
    while size > 10:
        font = (ImageFont.truetype(path, size, index=index) if index is not None
                else ImageFont.truetype(path, size))
        if draw.textlength(text, font=font) <= target_w:
            return font
        size -= 2
    return font


def card(W, H, name, out_dir):
    im = Image.new("RGB", (W, H), CREAM)
    d = ImageDraw.Draw(im)
    COL = W * 0.80                      # text column, so nothing touches the edge

    # the pale circle from the name tag, sitting behind the code
    r = W * 0.60
    d.ellipse([W / 2 - r, H * 0.56 - r, W / 2 + r, H * 0.56 + r], fill=CIRCLE)

    # ECEIA26 mark, top right
    blob = Image.open("assets/brand/eceia26.png").convert("RGBA")
    bw = int(W * 0.19)
    blob = blob.resize((bw, int(bw * blob.height / blob.width)), Image.LANCZOS)
    im.paste(blob, (int(W - bw - W * 0.08), int(H * 0.045)), blob)

    def centre(text, font, y, fill):
        d.text(((W - d.textlength(text, font=font)) / 2, y), text, font=font, fill=fill)
        return y + (font.getbbox("Ay")[3] - font.getbbox("Ay")[1]) * 1.5

    head1 = fit(d, "Share your memories", SERIF, COL, int(W * 0.09))
    head2 = fit(d, "of the conference", SERIF, COL, head1.size)
    sub   = ImageFont.truetype(SANS, int(W * 0.030), index=REGULAR)
    small = ImageFont.truetype(SANS, int(W * 0.021), index=MEDIUM)
    foot  = ImageFont.truetype(SANS, int(W * 0.019), index=DEMI)

    y = H * 0.175                                    # clear of the mark above
    y = centre("Share your memories", head1, y, INK)
    y = centre("of the conference", head2, y - W * 0.012, TEAL)
    y += H * 0.012
    y = centre("Scan the code, type your name, pick your stickers", sub, y, SOFT)
    y = centre("— and take a keepsake picture home.", sub, y - W * 0.004, SOFT)

    # the code, on white so any scanner is happy
    qpx = int(W * 0.46)
    pad = int(W * 0.040)
    qr, version, modules = qr_image(qpx)
    box = Image.new("RGB", (qpx + pad * 2, qpx + pad * 2), "white")
    box.paste(qr, (pad, pad))
    mask = Image.new("L", box.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, box.size[0] - 1, box.size[1] - 1],
                                           radius=int(W * 0.028), fill=255)
    qy = int(y + H * 0.030)
    im.paste(box, (int((W - box.size[0]) / 2), qy), mask)

    centre(SHORT, small, qy + box.size[1] + H * 0.025, SOFT)
    centre("ECEIA 2026  ·  BATUMI", foot, H * 0.94, TEAL)

    png, pdf = os.path.join(out_dir, name + ".png"), os.path.join(out_dir, name + ".pdf")
    im.save(png, dpi=(300, 300))
    im.save(pdf, "PDF", resolution=300.0)
    print("  %-20s %4d x %4d px   QR v%d (%d modules), %.0f mm wide   %.0f KB"
          % (name, W, H, version, modules, qpx / 300 * 25.4, os.path.getsize(png) / 1024))


if __name__ == "__main__":
    out = "qr"
    os.makedirs(out, exist_ok=True)
    plain, v, m = qr_image(2000)
    plain.save(os.path.join(out, "eceia26-qr.png"), dpi=(300, 300))
    print("  %-20s 2000 x 2000 px   QR v%d (%d modules)" % ("eceia26-qr", v, m))
    card(1748, 2480, "eceia26-card-a5", out)      # 148 x 210 mm at 300 dpi
    card(2480, 3508, "eceia26-poster-a4", out)    # 210 x 297 mm at 300 dpi
