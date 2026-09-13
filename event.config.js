/* ==========================================================================
   EVENT SETTINGS  --  ECEIA 2026, Batumi
   ==========================================================================
   Everything the app shows comes from here: the words, the colours, the
   logos, the stickers and the gallery photos.  Change a value, save, and
   reload the page in your browser.  Nothing else has to be rebuilt.

   Rules of thumb
     * text between "quotes" is what people read on screen;
     * a path like "assets/stickers/sponsor.png" points at a real file in the
       assets folder -- put your own picture there and write its name here;
     * "" means "we do not have this" -- that element disappears;
     * keep the commas and the quotes exactly as they are.
   ========================================================================== */

window.EVENT = {

  /* ---- 1. the event ---------------------------------------------------- */
  pageTitle:       "ECEIA26 Tag Maker",
  pageDescription: "Make your ECEIA 2026 Batumi name tag and keepsake.",

  /* ---- 2. the words ---------------------------------------------------- */
  text: {
    /* the tag carries the printed design, so it needs no extra text */
    tagTitle:    "",
    tagline:     "",
    badgeTitle:  "ECEIA 2026 · BATUMI",

    /* welcome screen -- <br> starts a new line */
    heroLine1:   "Share your<br>memories",
    heroLine2:   "of the conference",
    heroLede:    "Your little name tag with ideas, insights and new colleagues you're taking away from ECEIA 2026 in Batumi.",
    pledge:      "",                    /* "" removes the badge under the tags */

    /* the reflection screen */
    journalHeadline: "This is your place to share your ideas, insights<span class=\"accent\">&hellip; anything you want.</span>",
    captionLead:     "This is your place to share your ideas, insights… anything you want",

    /* the photo screen */
    picturesHeadline:   "Add your pictures",
    placeName:          "Batumi",
    galleryLede:        "Choose from our Batumi gallery, or share your own photo from the conference.",
    gallerySub:         "Five ready-made Batumi photos",
    galleryUploadLabel: "Upload your own photo from Batumi",
    galleryQualityNote: "This is guidance for your own photos — the gallery photos are already high-resolution originals.",

    /* the sharing screen */
    consent:    "I'm happy for ENAI to share this tag and my words, and I agree to tag @enaiofficial on Instagram and LinkedIn.",
    footerLine: "ECEIA 2026 &middot; Batumi",
    buildStamp: "Version 1.0"
  },

  /* ---- 3. the tag itself ----------------------------------------------- */
  tag: {
    background:  "assets/brand/name-tag.png",  /* the printed design, behind everything */
    ratio:       1.41,                         /* 1748 x 1240 px = the design's shape */
    nameBox:     false,                        /* false = the name sits straight on the design */
    chooseCover: false                         /* false = skip the "Pick your cover" screen */
  },

  /* ---- 4. the colours -------------------------------------------------- */
  /* taken from the name tag: cream, the pale circle, and the ENAI teal      */
  palette: {
    "bg":               "#FFFCF3",    /* page background: the tag's cream */
    "bg2":              "#F8F5EB",    /* the pale circle on the tag */
    "surface":          "#FFFEFA",    /* the card the app sits on */
    "surface2":         "#FFFFFF",
    "panel":            "#F8F5EB",
    "panel2":           "#F1ECDC",
    "ink":              "#3A3A3C",    /* main text colour, as in ECEIA26 */
    "ink-soft":         "#5F6868",
    "muted":            "#8E8C80",
    "line":             "#E9E3D2",
    "line-strong":      "#DAD3BE",
    "teal":             "#009999",    /* accent: buttons, links, highlights */
    "teal-600":         "#078A8A",
    "teal-700":         "#0B7070",
    "teal-100":         "#DDF0EF",
    "cover-teal":       "#94CAC3",    /* the blob teal, kept for fallbacks */
    "cover-mint":       "#F8F5EB",
    "cover-lavender":   "#E7E1F3",
    "field-teal":       "rgba(255,255,255,.45)",
    "field-mint":       "rgba(255,255,255,.8)",
    "field-lav":        "rgba(255,255,255,.55)",
    "lav-700":          "#4B3B7C",
    "sand":             "#F8F5EB",
    "sand-ink":         "#5B4A26",
    "shadow":           "58,58,60",   /* R,G,B of the drop shadow colour */
    "danger":           "#B3554B"
  },

  /* ---- 5. the logos ---------------------------------------------------- */
  /* The tag's own branding is printed into the background image above, so
     the three tag slots are empty here.                                     */
  brand: {
    tagLogo:    "",                          /* corner of the tag */
    tagBadge:   "",                          /* watermark on the tag */
    tagCheck:   "",                          /* mark at the bottom of the tag */
    badge:      "assets/brand/eceia26.png",  /* header and footer of the app */
    partners:   "",                          /* partner strip next to the stickers */
    pledgeIcon: ""                           /* icon next to the pledge line */
  },

  /* ---- 6. the stickers ------------------------------------------------- */
  stickerGroups: [
    { title: "Who are you?", items: [
      { id: "attendee",   img: "assets/stickers/attendee-first-time.png", label: "First-time attendee" },
      { id: "keynote",    img: "assets/stickers/keynote-speaker.png",     label: "Keynote speaker" },
      { id: "organiser",  img: "assets/stickers/organiser.png",           label: "Organiser" },
      { id: "sponsor",    img: "assets/stickers/sponsor.png",             label: "Sponsor" },
      { id: "enai-member",img: "assets/stickers/enai-member.png",         label: "ENAI member" },
      { id: "local",      img: "assets/stickers/local.png",               label: "Local — ask me about Batumi" },
      { id: "etics",      img: "assets/stickers/etics-partner.png",       label: "ETICS project partner" }
    ]},
    { title: "ECEIA 2026 Batumi", items: [
      { id: "eceia26",    img: "assets/stickers/eceia26.png",             label: "ECEIA26 Batumi" },
      { id: "enai",       img: "assets/stickers/enai.png",                label: "European Network for Academic Integrity" },
      { id: "university", img: "assets/stickers/batumi-university.png",   label: "Batumi Shota Rustaveli State University" },
      { id: "enai-blob",  img: "assets/stickers/enai-blob-teal.webp",     label: "All of that is ENAI" },
      { id: "enai-values",img: "assets/stickers/enai-circles.webp",       label: "ENAI values" },
      { id: "enai-seal",  img: "assets/stickers/enai-seal-round.webp",    label: "ENAI seal" },
      { id: "brain",      img: "assets/stickers/integrity-brain.webp",    label: "Integrity is key" }
    ]},
    { title: "Partners & sponsors", items: [
      { id: "turnitin",   img: "assets/stickers/turnitin.png",            label: "Turnitin" },
      { id: "strike",     img: "assets/stickers/strikeplagiarism.png",    label: "StrikePlagiarism" },
      { id: "trinka",     img: "assets/stickers/trinka.png",              label: "Trinka by Enago" },
      { id: "uniwise",    img: "assets/stickers/uniwise.png",             label: "UNIwise" },
      { id: "copyleaks",  img: "assets/stickers/copyleaks.png",           label: "Copyleaks" },
      { id: "ebsco",      img: "assets/stickers/ebsco.png",               label: "EBSCO" },
      { id: "compilatio", img: "assets/stickers/compilatio.png",          label: "Compilatio" },
      { id: "etined",     img: "assets/stickers/etined.png",              label: "ETINED — Council of Europe" }
    ]}
  ],

  /* ---- 7. the gallery photos ------------------------------------------- */
  gallery: [
    { img: "assets/gallery/beach.jpg",        label: "Batumi beach" },
    { img: "assets/gallery/seafront.jpg",     label: "Seafront at dusk" },
    { img: "assets/gallery/skyline.jpg",      label: "The new skyline" },
    { img: "assets/gallery/boulevard.jpg",    label: "Batumi Boulevard" },
    { img: "assets/gallery/holy-trinity.jpg", label: "Holy Trinity Church" }
  ],

  /* ---- 8. sharing ------------------------------------------------------ */
  share: {
    handles:      "@enaiofficial",
    hashtags:     "#ECEIA2026 #ENAI #academicintegrity",
    instagramUrl: "https://www.instagram.com/enaiofficial/",
    fileSlug:     "eceia26"
  },

  /* ---- 9. technical ---------------------------------------------------- */
  /* Half-finished tags are kept in the visitor's browser under this key.
     Give each new event its own key so old drafts do not reappear.          */
  storageKey: "eceia26-tag-state-v1",

  /* How long a half-finished tag is kept, in minutes. It survives a reload
     or a detour to the camera, but after that the next person to open the
     app starts with a clean one.
       20    -- the default, sensible for phones
       0     -- never resume: every visit starts fresh (a shared tablet)
       false -- keep it until "Make another one" is pressed                  */
  resumeMinutes: 20
};
