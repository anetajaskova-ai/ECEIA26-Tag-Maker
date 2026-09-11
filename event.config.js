/* ==========================================================================
   EVENT SETTINGS  --  this is the only file you need to edit.
   ==========================================================================
   Everything the app shows comes from here: the words, the colours, the
   logos, the stickers and the gallery photos.  Change a value, save, and
   reload the page in your browser.  Nothing else has to be rebuilt.

   Rules of thumb
     * text between "quotes" is what people read on screen;
     * a path like "assets/stickers/dubai.webp" points at a real file in the
       assets folder -- put your own picture there and write its name here;
     * keep the commas and the quotes exactly as they are;
     * if the app shows an error page, you have most likely lost a comma.
   ========================================================================== */

window.EVENT = {

  /* ---- 1. the event ---------------------------------------------------- */
  pageTitle:       "ENAI Tag Maker",                 /* browser tab + bookmark */
  pageDescription: "Make your ENAI Summer School Dubai 2026 name tag and keepsake.",

  /* ---- 2. the words ---------------------------------------------------- */
  text: {
    /* on the tag itself (repeated on every screen) */
    tagTitle:    "ENAI SUMMER SCHOOL 2026",
    tagline:     "Ideas embedded in a declaration.",
    badgeTitle:  "ENAI SUMMER SCHOOL 2026",          /* next to the logo, top of screen 1 */

    /* welcome screen -- <br> starts a new line */
    heroLine1:   "Share your<br>memories",
    heroLine2:   "of our summer<br>school",
    heroLede:    "Your little name tag with ideas, insights, and new friends you're taking away from the ENAI Summer School.",
    pledge:      "I have the courage to promote academic integrity",

    /* the reflection screen */
    journalHeadline:     "This is your place to share your ideas, insights<span class=\"accent\">&hellip; anything you want.</span>",
    captionLead:         "This is your place to share your ideas, insights\u2026 anything you want",

    /* the photo screen */
    picturesHeadline:    "Add your pictures",
    placeName:           "Dubai",                    /* the word under the headline */
    galleryLede:         "Choose from our Dubai gallery, or share your own photo from Dubai.",
    gallerySub:          "Six ready-made Dubai photos",
    galleryUploadLabel:  "Upload your own photo from Dubai",
    galleryQualityNote:  "This is guidance for your own photos \u2014 the gallery photos are already high-resolution originals.",

    /* the sharing screen */
    consent:     "I'm happy for ENAI to share this tag and my words, and I agree to tag @ecaiu_official and @enaiofficial on Instagram and LinkedIn.",
    footerLine:  "ENAI Summer School &middot; Dubai",
    buildStamp:  "Version 1.0"                       /* small grey line at the very bottom */
  },

  /* ---- 3. the colours -------------------------------------------------- */
  /* Any CSS colour works: "#1C8C82", "rgb(28,140,130)", "teal".            */
  palette: {
    "bg":              "#EDF2E6",    /* page background */
    "bg2":             "#E3EBDD",
    "surface":         "#FBFCF9",    /* the card the app sits on */
    "surface2":        "#FFFFFF",
    "panel":           "#F1F4EC",
    "panel2":          "#E7EBE1",
    "ink":             "#123330",    /* main text colour */
    "ink-soft":        "#3F5651",
    "muted":           "#7E8F86",
    "line":            "#D7E1D2",
    "line-strong":     "#C3D1BD",
    "teal":            "#1C8C82",    /* accent: buttons, links, highlights */
    "teal-600":        "#157A71",
    "teal-700":        "#0F655D",
    "teal-100":        "#D9EEE8",
    "cover-teal":      "#8CC3BC",    /* tag cover option 1 */
    "cover-mint":      "#D3E9DE",    /* tag cover option 2 (the default) */
    "cover-lavender":  "#E7E1F3",    /* tag cover option 3 */
    "field-teal":      "rgba(255,255,255,.45)",
    "field-mint":      "rgba(255,255,255,.8)",
    "field-lav":       "rgba(255,255,255,.55)",
    "lav-700":         "#4B3B7C",
    "sand":            "#F1E7D0",
    "sand-ink":        "#5B4A26",
    "shadow":          "18,51,48",    /* R,G,B of the drop shadow colour */
    "danger":          "#B3554B",
  },

  /* ---- 4. the logos ---------------------------------------------------- */
  /* Drop your own files into assets/brand/ and point at them here.
     Use "" to leave one out completely -- the app removes the image.
     Transparent PNG works best.                                            */
  brand: {
    tagLogo:    "assets/brand/tag-logo.png",   /* small logo in the corner of every tag */
    badge:      "assets/brand/badge.png",      /* round event badge on the tag + header */
    check:      "assets/brand/check.png",      /* organisation mark at the bottom of the tag */
    partners:   "assets/brand/partners.png",   /* the partner logo strip next to the stickers */
    pledgeIcon: "assets/brand/pledge.png"      /* icon next to the pledge line on screen 1 */
  },

  /* ---- 5. the stickers ------------------------------------------------- */
  /* Files live in assets/stickers/. Transparent PNG or WEBP, roughly square,
     about 400-600 px. "title" is the heading people see above the group;
     add, remove or reorder freely -- "id" only has to be unique.            */
  stickerGroups: [
    { title: "Integrity & values", items: [
      { id: "puzzle",              img: "assets/stickers/puzzle.png",              label: "Working together" },
      { id: "enai-blob-teal",      img: "assets/stickers/enai-blob-teal.webp",     label: "All of that is ENAI (teal)" },
      { id: "enai-blob-cream",     img: "assets/stickers/enai-blob-cream.webp",    label: "All of that is ENAI (cream)" },
      { id: "enai-seal",           img: "assets/stickers/enai-seal-round.webp",    label: "ENAI seal" },
      { id: "enai-circles",        img: "assets/stickers/enai-circles.webp",       label: "ENAI values" },
      { id: "community-globe",     img: "assets/stickers/community.webp",          label: "Community" },
      { id: "courage-fist",        img: "assets/stickers/courage-fist.webp",       label: "I have the courage" },
      { id: "integrity-brain",     img: "assets/stickers/integrity-brain.webp",    label: "Integrity is key" },
      { id: "stay-original",       img: "assets/stickers/stay-original.webp",      label: "Stay original" },
      { id: "proper-citation",     img: "assets/stickers/proper-citation.webp",    label: "Credit where it's due" },
      { id: "your-choice",         img: "assets/stickers/your-choice.webp",        label: "Your choice is important" }
    ]},
    { title: "Dubai", items: [
      { id: "enai-logo",           img: "assets/brand/check.png",                  label: "ENAI logo" },
      { id: "uow-dubai",           img: "assets/stickers/uow.png",                 label: "University of Wollongong in Dubai" },
      { id: "summer-crest",        img: "assets/stickers/summer-crest.webp",       label: "ENAI Summer School Dubai 2026" },
      { id: "dubai",               img: "assets/stickers/dubai.webp",              label: "Dubai" },
      { id: "cud",                 img: "assets/stickers/cud.webp",                label: "Canadian University Dubai" },
      { id: "ue-dubai",            img: "assets/stickers/ue-dubai.webp",           label: "University of Europe Dubai" },
      { id: "turnitin",            img: "assets/stickers/turnitin.webp",           label: "Turnitin" },
      { id: "mi",                  img: "assets/stickers/mi.webp",                 label: "Mi" },
      { id: "curveup",             img: "assets/stickers/curveup.webp",            label: "Curve Up" },
      { id: "marwan",              img: "assets/stickers/marwan.webp",             label: "Marwan" }
    ]}
  ],

  /* ---- 6. the gallery photos ------------------------------------------- */
  /* Files live in assets/gallery/. Landscape 16:9, at least 1200 px wide.
     Leave the list empty ( gallery: [], ) and people just upload their own.  */
  gallery: [
    { img: "assets/gallery/frame.jpg",            label: "Dubai Frame" },
    { img: "assets/gallery/museum.jpg",           label: "Museum of the Future" },
    { img: "assets/gallery/night.jpg",            label: "Downtown at night" },
    { img: "assets/gallery/harbour.jpg",          label: "Dubai Harbour" },
    { img: "assets/gallery/marasi.jpg",           label: "Marasi Bay" },
    { img: "assets/gallery/szr.jpg",              label: "Sheikh Zayed Road" }
  ],

  /* ---- 7. sharing ------------------------------------------------------ */
  share: {
    handles:      "@ecaiu_official @enaiofficial",              /* added to every caption */
    hashtags:     "#ENAI #ENAISummerSchool #academicintegrity",
    instagramUrl: "https://www.instagram.com/enaiofficial/",    /* opened by the Instagram button */
    fileSlug:     "enai"        /* saved file is called e.g. anna-enai-keepsake.jpg */
  },

  /* ---- 8. technical ---------------------------------------------------- */
  /* Half-finished tags are kept in the visitor's browser under this key.
     Give each new event its own key so old drafts do not reappear.          */
  storageKey: "enai-tag-state-v5"
};
