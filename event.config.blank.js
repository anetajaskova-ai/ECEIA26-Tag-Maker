/* ==========================================================================
   A BLANK EVENT  --  copy this over event.config.js to start a new one.
   ==========================================================================
       cp event.config.blank.js event.config.js
   Then fill in the words below, drop your pictures into assets/, and reload
   the page. Every setting is explained in the full config you replaced --
   keep a copy of it if you want the ENAI version as a reference.
   ========================================================================== */

window.EVENT = {

  pageTitle:       "Tag Maker",
  pageDescription: "Make your name tag and keepsake.",

  text: {
    tagTitle:   "MY EVENT 2027",
    tagline:    "A line under the title.",
    badgeTitle: "MY EVENT 2027",

    heroLine1:  "Share your<br>memories",
    heroLine2:  "of our event",
    heroLede:   "Your little name tag with the ideas, insights and new friends you are taking away.",
    pledge:     "",                       /* "" removes the badge; or write your own line */

    journalHeadline: "This is your place to share your ideas, insights<span class=\"accent\">&hellip; anything you want.</span>",
    captionLead:     "Write what you are taking away from this event.",

    picturesHeadline:   "Add your pictures",
    placeName:          "",               /* the city or venue, e.g. "Prague" */
    galleryLede:        "Add your own photo from the event.",
    gallerySub:         "Ready-made photos",
    galleryUploadLabel: "Upload your own photo",
    galleryQualityNote: "Landscape photos of at least 1200 px wide look best.",

    consent:    "I'm happy for the organisers to share this tag and my words.",
    footerLine: "My Event &middot; 2027",
    buildStamp: "Version 1.0"
  },

  /* ---- the tag itself -------------------------------------------------
     background: a ready-made design (PNG/JPG) printed behind everything.
                 Leave "" and the tag is a plain coloured card instead.
     ratio:      the design's width / height, e.g. 1748 x 1240 = 1.41
     nameBox:    false = the name sits straight on the design, no field
     chooseCover:false = skip the "Pick your cover" screen (one cover only)  */
  tag: {
    background:  "",
    ratio:       1.48,
    nameBox:     true,
    chooseCover: true
  },

  /* only the colours you want to change -- the rest stay as they are */
  palette: {
    "teal":           "#1C8C82",
    "cover-teal":     "#8CC3BC",
    "cover-mint":     "#D3E9DE",
    "cover-lavender": "#E7E1F3"
  },

  brand: {
    tagLogo:    "assets/brand/tag-logo.png",   /* corner of the tag */
    tagBadge:   "",                            /* watermark on the tag */
    tagCheck:   "",                            /* mark at the bottom of the tag */
    badge:      "assets/brand/badge.png",      /* header and footer of the app */
    partners:   "",                            /* "" removes the partner strip */
    pledgeIcon: ""                             /* "" removes the pledge icon */
  },

  /* put your own PNG/WEBP files in assets/stickers/ and list them here */
  stickerGroups: [
    { title: "Stickers", items: [
      /* { id: "hello", img: "assets/stickers/hello.png", label: "Hello" }, */
    ]}
  ],

  /* leave empty and everyone simply uploads their own photo */
  gallery: [],

  share: {
    handles:      "",
    hashtags:     "#myevent",
    instagramUrl: "https://www.instagram.com/",
    fileSlug:     "myevent"
  },

  storageKey: "myevent-tag-state-v1"
};
