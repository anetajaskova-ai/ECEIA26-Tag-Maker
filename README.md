# Tag Maker — a skeleton for any event

A small web app where people at your event type their name, build their own
name tag, add stickers and photos, write a few words, and take away a 4:5
keepsake image they can save or post.

It started as the ENAI Summer School Dubai 2026 tag maker
([live](https://anetajaskova-ai.github.io/ENAI-Tag-Maker/)); this repository is
the same app with every event-specific thing pulled out into one file you edit.

---

## Rychlý start (česky)

1. Zkopíruj celou složku a pojmenuj ji podle nové akce.
2. Do `assets/stickers/`, `assets/gallery/` a `assets/brand/` dej svoje obrázky
   (staré klidně smaž).
3. Otevři `event.config.js` a přepiš texty, barvy a seznamy obrázků.
4. Spusť `python3 -m http.server 8000` a otevři `http://localhost:8000`.
5. Až budeš spokojená, nahraj složku na GitHub a zapni Pages (postup níže).

Nic jiného se upravovat nemusí — `app.js`, `styles.css` a `index.html` zůstávají
pro každou akci stejné.

---

## Making it your event

### 1. The words, the colours, the pictures

Everything lives in **`event.config.js`**, in eight numbered sections:

| Section | What it controls |
| --- | --- |
| 1. the event | browser tab title and description |
| 2. the words | every headline, the text on the tag, the consent line |
| 3. the colours | the whole palette, including the three tag covers |
| 4. the logos | the five logo slots |
| 5. the stickers | the sticker menu, in groups |
| 6. the gallery photos | the ready-made photos people can pick |
| 7. sharing | handles, hashtags, the Instagram link, the file name |
| 8. technical | the key half-finished tags are stored under |

Two shortcuts worth knowing:

* **`""` removes something.** An empty logo, an empty pledge line or an empty
  `placeName` makes that element disappear instead of showing a blank box.
* **Leave `gallery: []` empty** and the "choose from our gallery" option is
  hidden — people just upload their own photo.

Starting a brand new event? Copy the blank config over the ENAI one:

```bash
cp event.config.blank.js event.config.js
```

Keep a copy of the old file first if you want the ENAI wording as a reference.

### 2. The pictures

| Folder | What goes there | Format |
| --- | --- | --- |
| `assets/brand/` | logos that appear on every tag | transparent PNG |
| `assets/stickers/` | the sticker menu | transparent PNG or WEBP, roughly square, 400–600 px |
| `assets/gallery/` | ready-made photos | landscape JPEG, at least 1200 px wide |

Drop the files in, then write their names in `event.config.js`. Stickers with a
white or coloured background look wrong on the tag — cut the background out
first.

### 3. Run it

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Change the config, save, reload — that is the
whole loop. (Opening `index.html` straight from Finder also works in Safari, but
a small server matches what your visitors will get.)

---

## Publishing

The folder is a plain static site, so anything that serves files will do.
GitHub Pages, step by step:

1. Push this folder to a GitHub repository.
2. **Settings → Pages**.
3. **Source:** Deploy from a branch · **Branch:** `main` / `/ (root)` · **Save**.
4. A minute later it is live at `https://<user>.github.io/<repo>/`.

Republished and still seeing the old version? That is the browser cache —
open the page with `?v=2` on the end once.

### One file instead of a folder

```bash
python3 build-single-file.py
```

writes `dist/index.html` with the stylesheet, the scripts and every picture
baked in — about 6 MB, no folder needed. You do not need this for GitHub Pages
(the folder version loads faster); it is for e-mailing the app, putting it on a
USB stick, or pasting it somewhere that accepts a single HTML file.

---

## What the visitor gets

1. **Their name** — typed on the welcome screen.
2. **A cover** — teal, mint or lavender.
3. **A tag of their own** — a portrait photo plus stickers, each one dragged,
   resized and rotated by hand.
4. **A few words** — a reflection page with prompts, which becomes the first
   part of their caption.
5. **Pictures** — one from the gallery or their own, plus a photo from the
   sessions (single or a four-photo collage), cropped by dragging inside a fixed
   frame.
6. **A keepsake** — the finished 4:5 card, exported at 1800 × 2250 px, saved to
   the phone's photo library through the share sheet, or downloaded on a laptop.
   Instagram, LinkedIn and WhatsApp buttons open with the caption ready.

Everything happens in the visitor's browser. There is no backend, no accounts
and no analytics; photos never leave the device, and a half-finished tag is kept
in that browser's `localStorage` so a reload does not lose it.

## How it is put together

| File | What it is |
| --- | --- |
| `index.html` | the seven screens, as plain markup |
| `styles.css` | all the styling; the palette here is just the default |
| `app.js` | all the behaviour — drag, crop, export, sharing |
| `event.config.js` | **your event** |
| `event.config.blank.js` | an empty config to start a new event from |
| `build-single-file.py` | optional: bundle everything into `dist/index.html` |

Anything in the markup carrying `data-text`, `data-html` or `data-img` is filled
in from the config when the page loads, so edit those in `event.config.js`
rather than in `index.html`.

Two libraries load from a CDN, so the app needs an internet connection:
**Google Fonts** (Fraunces + Figtree) and **html2canvas** for the export.

## Assets and credits

The tag design, layout and wording come from the ENAI Summer School design deck.
The artwork shipped in `assets/` belongs to its respective owners — ECAI, ENAI,
the partner universities and the organisers' Dubai photography — and was
included for that event.

**If you reuse this for a different event, replace those files with your own.**
They are not covered by any licence you may add to the code, and a public
repository publishes them to everyone.
