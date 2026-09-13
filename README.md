# ECEIA 2026 Batumi — Tag Maker

A small web app for people at **ECEIA 2026 in Batumi**: type your name, build
your own name tag out of the conference design and the sticker set, write a few
words, add photos, and take away a keepsake image you can save or post.

**Live: https://anetajaskova-ai.github.io/ECEIA26-Tag-Maker/**

Built on the reusable
[Tag Maker skeleton](https://github.com/anetajaskova-ai/ENAI-Tag-Maker-Template) —
everything specific to this conference lives in `event.config.js`.

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
| 3. the tag | the printed design behind the tag, its shape, the name field, whether people pick a cover |
| 4. the colours | the whole palette, including the three tag covers |
| 5. the logos | the five logo slots |
| 6. the stickers | the sticker menu, in groups |
| 7. the gallery photos | the ready-made photos people can pick |
| 8. sharing | handles, hashtags, the Instagram link, the file name |
| 9. technical | the key half-finished tags are stored under, and how long they are kept |

**Half-finished tags and privacy.** A tag in progress is kept in the visitor's
own browser so a reload — or a detour to the camera — does not lose it.
`resumeMinutes` says for how long: after that the next person to open the app
starts with a clean one, and nobody sees what someone else was making. The
default is 20 minutes; set `0` for a shared tablet, where every visit should
start fresh.

Three shortcuts worth knowing:

* **A ready-made design can go behind the tag.** Put the artwork in
  `assets/brand/`, set `tag.background` to it and `tag.ratio` to its
  width ÷ height. With `nameBox: false` the name then sits straight on the
  design, and the three logo slots (`tagLogo`, `tagBadge`, `tagCheck`) are
  normally left empty because the design already carries the branding.
* **`chooseCover: false`** skips the "Pick your cover" screen — for events
  where there is only one tag design.

And the two from before:

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

## The QR code

Print-ready material for the conference lives in `qr/`:

| File | What it is |
| --- | --- |
| `eceia26-card-a5.pdf` / `.png` | A5 card — table tents, handouts, badges table |
| `eceia26-poster-a4.pdf` / `.png` | the same as an A4 poster |
| `eceia26-qr.png` | the bare code, 2000 px, for slides or your own layout |
| `make-qr.py` | regenerates all of the above |

The code points at the live address above. Printed at A5 the code is 68 mm
wide, which scans from about a metre away; it still decodes when reduced to
150 px, so smaller reprints are safe.

If the address ever changes, edit `URL` at the top of `qr/make-qr.py` and run:

```bash
python3 qr/make-qr.py
```

## Publishing

The folder is a plain static site, so anything that serves files will do.
GitHub Pages, step by step:

This one is already live from
[anetajaskova-ai/ECEIA26-Tag-Maker](https://github.com/anetajaskova-ai/ECEIA26-Tag-Maker):
push to `main` and GitHub Pages rebuilds it within a minute or two.

For a brand new event:

1. Push the folder to a GitHub repository.
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
3. **A tag of their own** — an instax-style print plus stickers, each one
   dragged, resized and rotated by hand. Select the print and the picture
   inside it can be zoomed and dragged into place; the white border moves the
   print itself.
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

* The name tag design, the ECEIA26 mark and the sticker set come from the
  ECEIA 2026 organisers. `assets/brand/name-tag.png` is the supplied design with
  the ENAI and university logos and the handwriting line taken out, since the
  app prints the name itself.
* Batumi photography: Unsplash (Ivars Utinans, Max, Sergio Guardiola Herrador)
  and Pixabay (svetlbel).
* Partner and sponsor marks belong to their owners and are included for this
  conference.
* The full-size originals stay in `_originals/` on your own machine and are kept
  out of the repository (see `.gitignore`).

**Reusing this for another event?** Replace everything in `assets/` with your
own artwork — none of the above is covered by a licence you can pass on.
