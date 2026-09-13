(function(){
  "use strict";
  var EVENT = window.EVENT;
  if(!EVENT){ document.body.innerHTML = '<p style="padding:40px;font:16px system-ui">event.config.js is missing or has a syntax error — open the browser console for details.</p>'; return; }
  /* fill in anything the config leaves out, so a half-finished config still runs */
  EVENT.text = EVENT.text || {};
  EVENT.share = EVENT.share || {};
  EVENT.tag = EVENT.tag || {};
  EVENT.brand = EVENT.brand || {};
  EVENT.stickerGroups = EVENT.stickerGroups || [];
  EVENT.gallery = EVENT.gallery || [];
  EVENT.text.captionLead = EVENT.text.captionLead || "Write what you are taking away from this event.";
  EVENT.text.galleryUploadLabel = EVENT.text.galleryUploadLabel || "Upload your own photo";
  EVENT.share.handles = EVENT.share.handles || "";
  EVENT.share.hashtags = EVENT.share.hashtags || "";
  EVENT.share.instagramUrl = EVENT.share.instagramUrl || "https://www.instagram.com/";


  var TOTAL_STEPS = 6;
  var STORAGE_KEY = EVENT.storageKey || "tag-maker-state-v1";

  var STICKER_GROUPS = EVENT.stickerGroups;
  var STICKERS = STICKER_GROUPS.reduce(function(all, g){ return all.concat(g.items); }, []);

  var SCENES = EVENT.gallery;

  var STICKER_MIN = 7, STICKER_MAX = 46;   /* cqw: relative to tag width */
  var PREVIEW_BASE = 432;                  /* px width of the keepsake at scale 1 */

  var state = {
    name: "", cover: "mint", stickers: [], journal: "",
    photoSource: "gallery", sceneIndex: 0, customScenePhoto: null,
    sceneCrop: { x:0, y:0, zoom:1 },
    selfieMode: "single", selfiePhoto: null, selfieCollage: [],
    selfieCrop: { x:0, y:0, zoom:1 },
    previewScale: 1, tagPos: { x:50, y:50 }, caption: "", captionEdited: false, step: 0,
    savedAt: 0
  };
  var selectedSticker = null;

  /* A half-finished tag is kept in this browser so a reload does not lose it,
     but only for EVENT.resumeMinutes. After that the next person to open the
     app -- on a shared tablet, say -- starts with a clean one. 0 means never
     resume, false means keep it until "Make another one" is pressed.          */
  function resumeWindow(){
    var m = EVENT.resumeMinutes;
    if(m === false) return Infinity;
    if(m === undefined || m === null) m = 20;
    return Number(m) * 60000;
  }
  function load(){
    try{
      var raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return;
      var saved = JSON.parse(raw);
      var window_ = resumeWindow();
      if(!window_ || (Date.now() - (saved.savedAt || 0)) > window_){
        localStorage.removeItem(STORAGE_KEY);      /* somebody else's, or long forgotten */
        return;
      }
      for(var k in saved){ if(k in state) state[k] = saved[k]; }
    }catch(e){}
  }
  function persist(){
    try{
      if(!resumeWindow()){
        /* nothing is resumed, so leave nothing behind either */
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      state.savedAt = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }catch(e){}
  }

  function $(sel, root){ return (root||document).querySelector(sel); }
  function $all(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }
  function esc(s){ return String(s||"").replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  var toastTimer;
  function toast(msg){
    var t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ t.classList.remove("show"); }, 3200);
  }

  /* ---------- navigation ---------- */
  /* steps switched off in the config are stepped over, in the direction of travel */
  var SKIP_STEP = {};

  function goToStep(n){
    n = Math.max(0, Math.min(TOTAL_STEPS-1, n));
    var dir = (n >= state.step) ? 1 : -1;
    while(SKIP_STEP[n] && n > 0 && n < TOTAL_STEPS-1) n += dir;
    state.step = n;
    $all(".screen").forEach(function(s){ s.classList.toggle("active", parseInt(s.dataset.step,10) === n); });
    $("#backBtn").hidden = (n === 0);
    var body = $(".screen.active .screen-body");
    if(body) body.scrollTop = 0;
    if(n === 5){
      fillCaption();
      deselectSticker(); renderPlacedStickers(); syncKeepsake(); syncConsent();
    }
    persist();
  }

  var CAPTION_LEAD = EVENT.text.captionLead;
  var CAPTION_TAGS = EVENT.share.handles;
  var CAPTION_HASH = EVENT.share.hashtags;

  function composeCaption(){
    var lead = (state.journal || "").replace(/\s+$/, "");
    if(!lead) lead = CAPTION_LEAD;
    return lead + "\n\n" + CAPTION_TAGS + "\n" + CAPTION_HASH;
  }
  /* the reflection follows the user into the caption; once they edit the
     caption by hand we stop overwriting their words */
  function fillCaption(force){
    var box = $("#shareCaption");
    if(!box) return;
    if(state.captionEdited && !force) return;
    box.value = composeCaption();
    state.caption = box.value;
  }

  function captionWithTags(){
    var text = ($("#shareCaption") && $("#shareCaption").value) || "";
    var firstTag = CAPTION_TAGS.split(" ")[0], firstHash = CAPTION_HASH.split(" ")[0];
    if(CAPTION_TAGS && text.indexOf(firstTag) === -1) text += "\n\n" + CAPTION_TAGS;
    if(CAPTION_HASH && text.indexOf(firstHash) === -1) text += "\n" + CAPTION_HASH;
    return text;
  }

  /* ---------- sync ---------- */
  function syncName(){
    var name = state.name.trim();
    ["#tagNameText1","#tagNameText2","#tagNameText5"].forEach(function(sel){
      var el = $(sel); if(!el) return;
      if(name){ el.textContent = name; el.classList.remove("placeholder"); }
      else { el.textContent = "Add your name"; el.classList.add("placeholder"); }
    });
    $("#createBtn").disabled = !name;
  }

  function syncCover(){
    ["#tagPreview1","#tagPreview2","#tagPreview5"].forEach(function(sel){
      var el = $(sel); if(el) el.dataset.cover = state.cover;
    });
    $all(".choose-btn").forEach(function(b){ b.classList.toggle("is-selected", b.dataset.cover === state.cover); });
  }

  function galleryPhoto(i){ var s = SCENES[i] || SCENES[0] || {}; return s.img || ""; }
  function currentScene(){
    if(state.photoSource === "own") return state.customScenePhoto || galleryPhoto(state.sceneIndex);
    return galleryPhoto(state.sceneIndex);
  }

  /* ---------- crop: fixed frame, the image is zoomed and dragged inside it ----------
     x and y are fractions (-0.5 .. 0.5) of the overflow, so the frame is always
     covered no matter how far the user drags or how deep they zoom.            */
  function crop(which){ return which === "scene" ? state.sceneCrop : state.selfieCrop; }

  function coverBox(frame, img, zoom){
    var fw = frame.clientWidth, fh = frame.clientHeight;
    var nw = img.naturalWidth || fw, nh = img.naturalHeight || fh;
    var r = nw / nh, fr = fw / fh, w, h;
    if(r > fr){ h = fh * zoom; w = h * r; }     /* image wider than the frame */
    else { w = fw * zoom; h = w / r; }
    return { w:w, h:h, slackX: Math.max(0, w - fw), slackY: Math.max(0, h - fh) };
  }

  function applyCropTo(frame, img, c){
    if(!frame || !img) return;
    var box = coverBox(frame, img, c.zoom);
    var dx = (c.x || 0) * box.slackX;
    var dy = (c.y || 0) * box.slackY;
    img.style.width = box.w + "px";
    img.style.height = box.h + "px";
    img.style.left = "50%";
    img.style.top = "50%";
    img.style.transform = "translate(-50%,-50%) translate(" + dx.toFixed(2) + "px," + dy.toFixed(2) + "px)";
  }

  function syncCrops(){
    applyCropTo($("#sceneFrame"), $("#sceneHeroImg"), state.sceneCrop);
    applyCropTo($("#bandSceneFrame"), $("#sceneImg"), state.sceneCrop);
    applyCropTo($("#selfieDrop"), $("#selfieDrop img"), state.selfieCrop);
    if(state.selfieMode === "single"){
      applyCropTo($("#selfieImg") && $("#selfieImg").parentElement, $("#selfieImg"), state.selfieCrop);
    }
    var sz = $("#sceneZoom"); if(sz) sz.value = state.sceneCrop.zoom;
    var fz = $("#selfieZoom"); if(fz) fz.value = state.selfieCrop.zoom;
  }

  function initPhotoFrame(frame, which){
    var dragging = false, last = null;

    frame.addEventListener("pointerdown", function(ev){
      var img = frame.querySelector("img");
      if(!img || frame.classList.contains("is-empty")) return;
      dragging = true;
      last = { x: ev.clientX, y: ev.clientY };
      frame.setPointerCapture(ev.pointerId);
      ev.preventDefault();
    });
    frame.addEventListener("pointermove", function(ev){
      if(!dragging) return;
      var img = frame.querySelector("img");
      if(!img) return;
      var c = crop(which), box = coverBox(frame, img, c.zoom);
      var dx = ev.clientX - last.x, dy = ev.clientY - last.y;
      last = { x: ev.clientX, y: ev.clientY };
      if(box.slackX > 0) c.x = Math.max(-0.5, Math.min(0.5, (c.x || 0) + dx / box.slackX));
      if(box.slackY > 0) c.y = Math.max(-0.5, Math.min(0.5, (c.y || 0) + dy / box.slackY));
      syncCrops();
    });
    function stop(){ if(!dragging) return; dragging = false; persist(); }
    frame.addEventListener("pointerup", stop);
    frame.addEventListener("pointercancel", stop);
    frame.addEventListener("dragstart", function(ev){ ev.preventDefault(); });
    frame.addEventListener("wheel", function(ev){
      var img = frame.querySelector("img");
      if(!img || frame.classList.contains("is-empty")) return;
      ev.preventDefault();
      var c = crop(which);
      c.zoom = Math.max(1, Math.min(4, c.zoom * (ev.deltaY > 0 ? 0.94 : 1.06)));
      syncCrops(); persist();
    }, { passive:false });
  }

  function hasCollage(){ return state.selfieMode === "collage" && state.selfieCollage && state.selfieCollage.length === 4; }
  function singleSelfie(){ return state.selfiePhoto; }

  function syncKeepsake(){
    $("#sceneImg").src = currentScene();

    var img = $("#selfieImg"), fallback = $("#selfieFallback"),
        collage = $("#selfieCollage");
    var label = { set textContent(v){} };   /* labels were removed from the preview */

    if(hasCollage()){
      collage.innerHTML = state.selfieCollage.map(function(src){
        return '<div class="collage-cell"><img src="'+src+'" alt=""></div>';
      }).join("");
      collage.hidden = false;
      img.hidden = true;
      fallback.style.display = "none";
      label.textContent = "Your photos";
    } else if(state.selfieMode === "single" && singleSelfie()){
      img.src = singleSelfie(); img.hidden = false;
      collage.hidden = true;
      fallback.style.display = "none";
      label.textContent = "Your photo";
    } else {
      img.hidden = true;
      collage.hidden = true;
      fallback.style.display = "block";
      label.textContent = state.selfieMode === "collage" ? "Add 4 photos" : "Add your photo";
    }
    syncCrops();
    applyPreviewScale();
  }

  function syncKeepsakeCaption(){ /* the exported image carries no name strip */ }

  /* only the tag scales; the photo bands stay exactly as cropped */
  function applyPreviewScale(){
    var box = $("#keepsakeTagBox");
    if(!box) return;
    if(!state.tagPos) state.tagPos = { x:50, y:50 };
    box.style.width = (84 * state.previewScale).toFixed(1) + "%";
    box.style.left = state.tagPos.x + "%";
    box.style.top  = state.tagPos.y + "%";
  }

  /* drag the tag anywhere over the photos; it can never leave the canvas */
  function initTagDrag(){
    var box = $("#keepsakeTagBox"), card = $("#memoryCard");
    if(!box || !card) return;
    var dragging = false, last = null;
    box.addEventListener("pointerdown", function(ev){
      if(ev.target.closest(".tag-resize")) return;     /* that handle resizes */
      dragging = true;
      last = { x: ev.clientX, y: ev.clientY };
      box.setPointerCapture(ev.pointerId);
      ev.preventDefault();
    });
    box.addEventListener("pointermove", function(ev){
      if(!dragging) return;
      var r = card.getBoundingClientRect();
      last = { x: ev.clientX, y: ev.clientY, dx: (ev.clientX - last.x) / r.width * 100, dy: (ev.clientY - last.y) / r.height * 100 };
      state.tagPos.x = Math.max(12, Math.min(88, state.tagPos.x + last.dx));
      state.tagPos.y = Math.max(12, Math.min(88, state.tagPos.y + last.dy));
      applyPreviewScale();
    });
    function stopDrag(){ if(!dragging) return; dragging = false; persist(); }
    box.addEventListener("pointerup", stopDrag);
    box.addEventListener("pointercancel", stopDrag);
  }

  /* drag the corner handle, exactly like resizing a sticker */
  function initTagResize(){
    var handle = $("#tagResize"), box = $("#keepsakeTagBox"), card = $("#memoryCard");
    if(!handle || !box || !card) return;
    var start = null;
    handle.addEventListener("pointerdown", function(ev){
      ev.preventDefault(); ev.stopPropagation();
      var r = box.getBoundingClientRect();
      start = {
        dist: Math.hypot(ev.clientX - (r.left + r.width/2), ev.clientY - (r.top + r.height/2)),
        scale: state.previewScale
      };
      handle.setPointerCapture(ev.pointerId);
    });
    handle.addEventListener("pointermove", function(ev){
      if(!start) return;
      var r = box.getBoundingClientRect();
      var d = Math.hypot(ev.clientX - (r.left + r.width/2), ev.clientY - (r.top + r.height/2));
      var next = start.scale * (d / Math.max(8, start.dist));
      /* 0.5 .. 1.14 of the design width keeps the whole tag inside the keepsake */
      state.previewScale = Math.max(0.5, Math.min(1.14, next));
      applyPreviewScale();
    });
    function end(){ if(!start) return; start = null; persist(); }
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  }

  /* live, croppable preview of the chosen Dubai photo on the pictures page */
  function syncSceneHero(){
    var frame = $("#sceneFrame"), img = $("#sceneHeroImg"),
        empty = $("#sceneFrameEmpty"), hint = $("#sceneFrameHint"), zoomRow = $("#sceneZoomRow");
    var src = (state.photoSource === "own") ? state.customScenePhoto : galleryPhoto(state.sceneIndex);
    if(src){
      img.src = src; img.hidden = false;
      empty.hidden = true; hint.hidden = false;
      frame.classList.remove("is-empty");
      zoomRow.hidden = false;
    } else {
      img.hidden = true;
      empty.hidden = false; hint.hidden = true;
      empty.querySelector("span").textContent = EVENT.text.galleryUploadLabel;
      frame.classList.add("is-empty");
      zoomRow.hidden = true;
    }
    syncCrops();
  }

  function syncPhotoChoices(){
    $all("#sceneChoiceRow .choice-card").forEach(function(b){
      b.classList.toggle("is-active", b.dataset.source === state.photoSource);
    });
    $("#galleryPanel").hidden = state.photoSource !== "gallery";
    $("#ownScenePanel").hidden = state.photoSource !== "own";

    $all("#selfieChoiceRow .choice-card").forEach(function(b){
      b.classList.toggle("is-active", b.dataset.mode === state.selfieMode);
    });
    var dropLabel = $("#selfieDropLabel");
    if(dropLabel){
      dropLabel.textContent = state.selfieMode === "collage"
        ? "Tap to choose exactly 4 photos"
        : "Tap to upload one photo from the conference";
    }
    renderSelfieSlot();
    syncSceneHero();
  }

  /* ---------- stickers ---------- */
  function stickerImg(id){
    var d = STICKERS.filter(function(s){ return s.id===id; })[0];
    return d ? d.img : "";
  }
  function renderStickerTray(){
    var tray = $("#stickerTray");
    tray.innerHTML = "";
    STICKER_GROUPS.forEach(function(group){
      var wrap = document.createElement("div");
      wrap.className = "sticker-group";
      var title = document.createElement("div");
      title.className = "sticker-group-title";
      title.textContent = group.title;
      wrap.appendChild(title);
      var grid = document.createElement("div");
      grid.className = "sticker-grid";
      group.items.forEach(function(s){
        var btn = document.createElement("button");
        btn.className = "sticker-chip"; btn.type = "button";
        btn.title = s.label || "";
        btn.setAttribute("aria-label", "Add sticker: " + (s.label || s.id));
        btn.innerHTML = '<img src="'+s.img+'" alt="">';
        btn.addEventListener("click", function(){ addSticker(s.id); });
        grid.appendChild(btn);
      });
      wrap.appendChild(grid);
      tray.appendChild(wrap);
    });
  }
  function addSticker(id){
    if(state.stickers.length >= 8){ toast("Your tag is full \u2014 remove one first."); return; }
    var j = function(){ return Math.random()*12-6; };
    var item = {
      id:id, uid:Date.now()+"-"+Math.random().toString(36).slice(2),
      x:66+j(), y:30+j(), size:18, rot:0
    };
    state.stickers.push(item);
    selectedSticker = item.uid;
    renderPlacedStickers(); persist();
    toast("Sticker added \u2014 drag to move, use the handles to resize or rotate.");
  }
  /* the portrait lives on the tag as a photo element, alongside the stickers */
  function photoSlot(){
    var found = state.stickers.filter(function(s){ return s.kind === "photo"; })[0];
    if(found) return found;
    var item = {
      kind:"photo", id:"__photo__", uid:"photo-slot",
      src:null, x:14, y:8, size:30, rot:-6,  /* instax prints are tall: start a little smaller */
      crop:{ x:0, y:0, zoom:1 }               /* the picture's position inside the film window */
    };
    state.stickers.push(item);
    return item;
  }
  function setTagPhoto(url){
    var slot = photoSlot();
    slot.src = url;
    slot.crop = { x:0, y:0, zoom:1 };   /* a new picture starts centred */
    selectedSticker = slot.uid;   /* show the handles straight away */
  }
  function clearTagPhoto(){
    var slot = photoSlot();
    slot.src = null;
    if(selectedSticker === slot.uid) selectedSticker = null;
  }

  function removeSticker(uid){
    state.stickers = state.stickers.filter(function(s){ return s.uid !== uid; });
    if(selectedSticker === uid) selectedSticker = null;
    renderPlacedStickers(); persist();
  }

  /* the picture inside the film, cropped the same way as the big photo frames */
  function filmCrop(s){
    if(!s.crop) s.crop = { x:0, y:0, zoom:1 };
    return s.crop;
  }
  function applyFilmCrop(el, s){
    var win = el.querySelector(".film-window"), img = win && win.querySelector("img");
    if(!win || !img) return;
    var put = function(){ applyCropTo(win, img, filmCrop(s)); };
    if(img.complete && img.naturalWidth) put();
    img.addEventListener("load", put);
  }
  function syncFilmCrops(){
    $all(".placed-sticker").forEach(function(el){
      var model = state.stickers.filter(function(s){ return s.uid === el.dataset.uid; })[0];
      if(model && model.kind === "photo" && model.src) applyFilmCrop(el, model);
    });
  }

  function stickerStyle(el, s){
    el.style.left = s.x + "%";
    el.style.top = s.y + "%";
    el.style.width = s.size + "cqw";
    el.style.transform = "translate(-50%,-50%) rotate(" + s.rot + "deg)";
  }

  function buildSticker(s, editable){
    var el = document.createElement("div");
    el.className = "placed-sticker" + (editable && selectedSticker === s.uid ? " selected" : "");
    if(!editable) el.classList.add("sticker-static");
    el.dataset.uid = s.uid;
    stickerStyle(el, s);
    if(s.kind === "photo"){
      el.innerHTML = s.src
        ? '<span class="tag-photo"><span class="film-window"><img src="'+s.src+'" alt="" draggable="false"></span></span>'
        : '<span class="tag-photo is-empty"><span class="photo-drop"><span class="photo-drop-btn">Upload</span></span></span>';
      if(!s.src) el.classList.add("photo-empty");
    } else {
      el.innerHTML = '<img src="'+stickerImg(s.id)+'" alt="" draggable="false">';
    }
    if(editable){
      el.insertAdjacentHTML("beforeend",
        '<span class="sticker-handle del" data-act="del" title="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></span>' +
        '<span class="sticker-handle rotate" data-act="rotate" title="Rotate"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v4h-4"/></svg></span>' +
        '<span class="sticker-handle resize" data-act="resize" title="Resize"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H3v-6"/><path d="M15 3h6v6"/><path d="M3 21L21 3"/></svg></span>');
    }
    return el;
  }

  /* stickers live inside the tag; the photo lives on the stage, so it can
     hang outside the tag and still be composed with it */
  function renderPlacedStickers(){
    var tag = $("#tagPreview2"), stage = $("#tagStage2");
    if(tag && stage){
      $all(".placed-sticker", stage).forEach(function(el){ el.remove(); });
      state.stickers.forEach(function(s){
        var onStage = s.kind === "photo";
        var host = onStage ? stage : tag;
        var el = buildSticker(s, true);
        if(onStage) el.classList.add("on-stage");
        wireSticker(el, host, s);
        host.appendChild(el);
        if(s.kind === "photo" && s.src) applyFilmCrop(el, s);
      });
    }
    var mtag = $("#tagPreview5"), mstage = $("#tagStage5");
    if(mtag && mstage){
      $all(".placed-sticker", mstage).forEach(function(el){ el.remove(); });
      state.stickers.forEach(function(s){
        if(s.kind === "photo" && !s.src) return;    /* nothing uploaded yet */
        var el = buildSticker(s, false);
        if(s.kind === "photo"){ el.classList.add("on-stage"); mstage.appendChild(el); applyFilmCrop(el, s); }
        else mtag.appendChild(el);
      });
    }
  }

  /* move (body) + resize / rotate (handles), aspect ratio always preserved */
  function wireSticker(el, container, model){
    var mode = null, moved = false, start = null;

    function centerPx(){
      var r = container.getBoundingClientRect();
      return { cx: r.left + (model.x/100)*r.width, cy: r.top + (model.y/100)*r.height, r: r };
    }

    el.addEventListener("pointerdown", function(ev){
      var handle = ev.target.closest(".sticker-handle");
      var act = handle ? handle.dataset.act : "move";
      if(act === "del"){
        ev.stopPropagation();
        if(model.kind === "photo"){ clearTagPhoto(); renderPlacedStickers(); persist(); }
        else removeSticker(model.uid);
        return;
      }
      ev.stopPropagation();
      ev.preventDefault();
      /* on a print that is already selected, the window itself pans the picture;
         the white border still moves the whole print                          */
      if(act === "move" && model.kind === "photo" && model.src &&
         selectedSticker === model.uid && ev.target.closest(".film-window")){
        act = "pan";
      }
      selectSticker(model.uid);
      mode = act; moved = false;
      if(act === "pan") start = { x: ev.clientX, y: ev.clientY };
      var c = centerPx();
      if(act === "resize"){
        start = { dist: Math.hypot(ev.clientX - c.cx, ev.clientY - c.cy), size: model.size };
      } else if(act === "rotate"){
        start = { ang: Math.atan2(ev.clientY - c.cy, ev.clientX - c.cx) * 180/Math.PI, rot: model.rot };
      }
      el.setPointerCapture(ev.pointerId);
    });

    el.addEventListener("pointermove", function(ev){
      if(!mode) return;
      moved = true;
      var c = centerPx();
      if(mode === "move"){
        var lo = (model.kind === "photo") ? -30 : 4, hi = (model.kind === "photo") ? 130 : 96;
        model.x = Math.max(lo, Math.min(hi, ((ev.clientX - c.r.left)/c.r.width)*100));
        model.y = Math.max(lo, Math.min(hi, ((ev.clientY - c.r.top)/c.r.height)*100));
      } else if(mode === "resize"){
        var d = Math.hypot(ev.clientX - c.cx, ev.clientY - c.cy);
        var next = start.size * (d / Math.max(6, start.dist));
        model.size = Math.max(STICKER_MIN, Math.min(STICKER_MAX, next));
      } else if(mode === "rotate"){
        var a = Math.atan2(ev.clientY - c.cy, ev.clientX - c.cx) * 180/Math.PI;
        model.rot = Math.round(start.rot + (a - start.ang));
      } else if(mode === "pan"){
        var win = el.querySelector(".film-window"), pic = win && win.querySelector("img");
        if(win && pic){
          var cr = filmCrop(model), box = coverBox(win, pic, cr.zoom);
          var mx = ev.clientX - start.x, my = ev.clientY - start.y;
          start = { x: ev.clientX, y: ev.clientY };
          /* the print can be rotated, so undo that rotation on the drag itself */
          var rad = (model.rot || 0) * Math.PI / 180;
          var dx = mx * Math.cos(rad) + my * Math.sin(rad);
          var dy = -mx * Math.sin(rad) + my * Math.cos(rad);
          if(box.slackX > 0) cr.x = Math.max(-0.5, Math.min(0.5, (cr.x || 0) + dx / box.slackX));
          if(box.slackY > 0) cr.y = Math.max(-0.5, Math.min(0.5, (cr.y || 0) + dy / box.slackY));
          applyCropTo(win, pic, cr);
        }
        return;                       /* the print itself has not moved */
      }
      stickerStyle(el, model);
    });

    function end(){
      if(!mode) return;
      mode = null;
      if(moved){ renderPlacedStickers(); }
      persist();
    }
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
  }

  function selectSticker(uid){
    if(selectedSticker === uid) return;
    selectedSticker = uid;
    $all("#tagStage2 .placed-sticker").forEach(function(el){
      el.classList.toggle("selected", el.dataset.uid === uid);
    });
    syncPhotoZoom();
  }
  function deselectSticker(){
    if(!selectedSticker) return;
    selectedSticker = null;
    $all("#tagStage2 .placed-sticker").forEach(function(el){ el.classList.remove("selected"); });
    syncPhotoZoom();
  }

  /* the zoom slider belongs to the print, so it only shows while that is selected */
  function selectedPhoto(){
    var s = state.stickers.filter(function(x){ return x.uid === selectedSticker; })[0];
    return (s && s.kind === "photo" && s.src) ? s : null;
  }
  function syncPhotoZoom(){
    var row = $("#photoZoomRow");
    if(!row) return;
    var photo = selectedPhoto();
    row.hidden = !photo;
    if(photo) $("#photoZoom").value = filmCrop(photo).zoom;
  }

  /* ---------- journal ---------- */
  function initJournal(){
    var ta = $("#journalText");
    ta.value = state.journal;
    ta.addEventListener("input", function(){
      state.journal = ta.value;
      if(!state.captionEdited) fillCaption();
      persist();
    });
    $all(".idea-chip").forEach(function(chip){
      chip.addEventListener("click", function(){
        var sep = ta.value && !ta.value.endsWith("\n") ? "\n" : "";
        ta.value = ta.value + sep + chip.dataset.line;
        state.journal = ta.value;
        ta.focus(); ta.selectionStart = ta.selectionEnd = ta.value.length;
        persist();
      });
    });
  }

  /* ---------- photos ---------- */
  var MAX_PHOTO_EDGE = 2400;   /* the export is 1800px wide; more is wasted memory */

  /* Phone photos are 12MP and several megabytes. Keeping them at full size makes
     the page crawl and blows the browser's storage budget, so scale them down on
     the way in - well above what the finished image needs. */
  function readAsDataUrl(file, cb){
    function fallback(){
      var r = new FileReader();
      r.onload = function(){ cb(r.result); };
      r.readAsDataURL(file);
    }
    if(!window.createImageBitmap || !file.type || file.type === "image/gif"){ fallback(); return; }
    createImageBitmap(file, { imageOrientation: "from-image" }).then(function(bmp){
      var scale = Math.min(1, MAX_PHOTO_EDGE / Math.max(bmp.width, bmp.height));
      if(scale === 1 && file.size < 1200000){ bmp.close(); fallback(); return; }
      var cv = document.createElement("canvas");
      cv.width = Math.round(bmp.width * scale);
      cv.height = Math.round(bmp.height * scale);
      cv.getContext("2d").drawImage(bmp, 0, 0, cv.width, cv.height);
      bmp.close();
      cb(cv.toDataURL("image/jpeg", 0.9));
    }).catch(fallback);
  }

  function renderGallery(){
    var grid = $("#galleryGrid");
    grid.innerHTML = "";
    SCENES.forEach(function(scene, i){
      var src = scene.img;
      var tile = document.createElement("button");
      tile.type = "button";
      tile.title = scene.label || "";
      tile.setAttribute("aria-label", "Use photo: " + (scene.label || ("Photo " + (i+1))));
      tile.className = "gallery-tile" + (state.photoSource === "gallery" && state.sceneIndex === i ? " selected" : "");
      tile.innerHTML = '<img src="'+src+'" alt="">' +
        '<span class="sel-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>';
      tile.addEventListener("click", function(){
        state.photoSource = "gallery";
        state.sceneIndex = i;
        state.sceneCrop = { x:0, y:0, zoom:1 };
        renderGallery(); syncPhotoChoices(); syncKeepsake(); persist();
      });
      grid.appendChild(tile);
    });
  }

  /* the "Upload your photo" frame: single photo (croppable), 4-photo collage, or empty prompt */
  function renderSelfieSlot(){
    var slot = $("#selfieDrop");
    if(!slot) return;
    $all("img, .collage, .frame-hint", slot).forEach(function(el){ el.remove(); });
    var empty = $("#selfieFrameEmpty"), label = $("#selfieDropLabel"),
        zoomRow = $("#selfieZoomRow"), changeLink = $("#selfieChangeLink");

    function addHint(text){
      var hint = document.createElement("div");
      hint.className = "frame-hint";
      hint.textContent = text;
      slot.appendChild(hint);
    }

    if(hasCollage()){
      var wrap = document.createElement("div");
      wrap.className = "collage";
      wrap.innerHTML = state.selfieCollage.map(function(src){
        return '<div class="collage-cell"><img src="'+src+'" alt=""></div>';
      }).join("");
      slot.insertBefore(wrap, slot.firstChild);
      empty.hidden = true;
      slot.classList.remove("is-empty");
      zoomRow.hidden = true;
      changeLink.hidden = false;
      changeLink.textContent = "Change all 4 photos";
    } else if(state.selfieMode === "single" && singleSelfie()){
      var img = document.createElement("img");
      img.src = singleSelfie();
      slot.insertBefore(img, slot.firstChild);
      empty.hidden = true;
      slot.classList.remove("is-empty");
      zoomRow.hidden = false;
      changeLink.hidden = false;
      changeLink.textContent = "Change this photo";
      addHint("Drag to reposition");
    } else {
      empty.hidden = false;
      if(label) label.style.display = "block";
      slot.classList.add("is-empty");
      zoomRow.hidden = true;
      changeLink.hidden = true;
    }
    syncCrops();
  }

  function initPhotoUploads(){
    function makeInput(onPick, multiple){
      var input = document.createElement("input");
      input.type = "file"; input.accept = "image/*"; input.style.display = "none";
      if(multiple) input.multiple = true;
      input.addEventListener("change", function(){
        var files = Array.prototype.slice.call(input.files || []);
        onPick(files);
        input.value = "";
      });
      document.body.appendChild(input);
      return input;
    }
    function isImage(f){ return f && /^image\//.test(f.type); }

    /* the polaroid beside the tag is both the upload control and the photo */
    var polaroidInput = makeInput(function(files){
      var f = files[0];
      if(!isImage(f)){ toast("Please choose an image file (JPG or PNG)."); return; }
      readAsDataUrl(f, function(url){
        setTagPhoto(url);
        renderPlacedStickers(); persist();
        toast("Drag your photo where you want it, or resize it with the corner handle.");
      });
    });
    /* tapping the empty polaroid opens the picker */
    $("#tagStage2").addEventListener("click", function(ev){
      var host = ev.target.closest(".placed-sticker");
      if(host && host.classList.contains("photo-empty")) polaroidInput.click();
    });

    /* Dubai photo: own upload */
    var sceneInput = makeInput(function(files){
      var f = files[0];
      if(!isImage(f)){ toast("Please choose an image file (JPG or PNG)."); return; }
      readAsDataUrl(f, function(url){
        state.photoSource = "own";
        state.customScenePhoto = url;
        state.sceneCrop = { x:0, y:0, zoom:1 };
        renderGallery(); syncPhotoChoices(); syncKeepsake(); persist();
        toast("Your Dubai photo is set \u2014 drag it inside the frame to choose the crop.");
      });
    });
    $("#ownSceneDrop").addEventListener("click", function(){ sceneInput.click(); });
    $("#sceneFrame").addEventListener("click", function(){
      if($("#sceneFrame").classList.contains("is-empty")) sceneInput.click();
    });

    /* the two Dubai-photo choices */
    $all("#sceneChoiceRow .choice-card").forEach(function(btn){
      btn.addEventListener("click", function(){
        var src = btn.dataset.source;
        state.photoSource = src;
        renderGallery(); syncPhotoChoices(); syncKeepsake(); persist();
        if(src === "own" && !state.customScenePhoto) sceneInput.click();
      });
    });

    /* memory photo: single */
    var selfieInput = makeInput(function(files){
      var f = files[0];
      if(!isImage(f)){ setMsg($("#selfieMsg"), "Please choose an image file.", "error"); return; }
      readAsDataUrl(f, function(url){
        state.selfieMode = "single";
        state.selfiePhoto = url;
        state.selfieCrop = { x:0, y:0, zoom:1 };
        setMsg($("#selfieMsg"), "Photo added \u2014 drag it inside the frame to choose the crop.", "ok");
        syncPhotoChoices(); syncKeepsake(); persist();
      });
    });

    /* memory photo: collage of exactly 4 */
    var collageInput = makeInput(function(files){
      var imgs = files.filter(isImage);
      if(imgs.length !== 4){
        setMsg($("#selfieMsg"), "Please pick exactly 4 photos \u2014 you picked " + imgs.length + ".", "error");
        return;
      }
      var urls = new Array(4), done = 0;
      imgs.forEach(function(f, i){
        readAsDataUrl(f, function(url){
          urls[i] = url; done++;
          if(done === 4){
            state.selfieMode = "collage";
            state.selfieCollage = urls;
            setMsg($("#selfieMsg"), "Collage of 4 photos added.", "ok");
            syncPhotoChoices(); syncKeepsake(); persist();
          }
        });
      });
    }, true);

    function pickSelfie(){
      if(state.selfieMode === "collage") collageInput.click();
      else selfieInput.click();
    }
    /* an empty frame picks a photo; a filled one is for dragging, so use the link */
    $("#selfieDrop").addEventListener("click", function(){
      if($("#selfieDrop").classList.contains("is-empty")) pickSelfie();
    });
    $("#selfieChangeLink").addEventListener("click", pickSelfie);

    $all("#selfieChoiceRow .choice-card").forEach(function(btn){
      btn.addEventListener("click", function(){
        state.selfieMode = btn.dataset.mode;
        setMsg($("#selfieMsg"), state.selfieMode === "collage" ? "Pick exactly 4 photos." : "\u00A0");
        syncPhotoChoices(); syncKeepsake(); persist();
        pickSelfie();
      });
    });

    /* Canva-style crop on both photo windows */
    initPhotoFrame($("#sceneFrame"), "scene");
    initPhotoFrame($("#selfieDrop"), "selfie");
    $("#sceneZoom").addEventListener("input", function(e){
      state.sceneCrop.zoom = parseFloat(e.target.value); syncCrops(); persist();
    });
    $("#selfieZoom").addEventListener("input", function(e){
      state.selfieCrop.zoom = parseFloat(e.target.value); syncCrops(); persist();
    });
    $all(".zoom-reset").forEach(function(btn){
      btn.addEventListener("click", function(){
        var c = { x:0, y:0, zoom:1 };
        if(btn.dataset.reset === "scene") state.sceneCrop = c; else state.selfieCrop = c;
        syncCrops(); persist();
      });
    });

    /* tapping a photo in the keepsake jumps back to change it */
    $("#bandScene").addEventListener("click", function(){ goToStep(4); });
    $("#bandSelfie").addEventListener("click", function(){ goToStep(4); });

    renderSelfieSlot();
  }

  /* Download and Share stay locked until the consent box is ticked */
  function syncConsent(){
    var ok = $("#consentCheck") && $("#consentCheck").checked;
    ["#downloadBtn", "#shareSaveBtn"].forEach(function(sel){
      var b = $(sel); if(b) b.disabled = !ok;
    });
  }

  function initPreviewSize(){
    if(state.previewScale > 1.14 || state.previewScale < 0.5) state.previewScale = 1;
    if(!state.tagPos) state.tagPos = { x:50, y:50 };
    initTagResize();
    initTagDrag();
    applyPreviewScale();
  }

  /* ---------- export ---------- */
  function getDownloads(){
    if(!(window.claude && window.claude.use)) return Promise.resolve(null);
    return window.claude.use("downloads").catch(function(){ return null; });
  }
  function setMsg(el, text, kind){
    el.textContent = text;
    el.className = "save-msg" + (kind ? " " + kind : "");
  }

  var EXPORT_W = 1800;                 /* 4:5 -> 1800 x 2250, above the print minimum */
  var EXPORT_TYPE = "image/jpeg", EXPORT_QUALITY = 0.92, EXPORT_EXT = "jpg";

  function renderBlob(el){
    return new Promise(function(resolve, reject){
      if(typeof html2canvas !== "function"){ reject(new Error("no-html2canvas")); return; }
      document.body.classList.add("is-exporting");
      var done = function(fn){ return function(v){ document.body.classList.remove("is-exporting"); fn(v); }; };
      resolve = done(resolve); reject = done(reject);
      /* pin the render to the element's own box so a small or scrolled window
         can never clip the result */
      var scale = el.offsetWidth ? (EXPORT_W / el.offsetWidth) : 2;
      var opts = {
        backgroundColor: "#ffffff", scale: scale, useCORS: true,
        width: el.offsetWidth, height: el.offsetHeight,
        windowWidth: Math.max(document.documentElement.clientWidth, el.offsetWidth),
        windowHeight: Math.max(document.documentElement.clientHeight, el.offsetHeight),
        scrollX: 0, scrollY: -window.scrollY
      };
      html2canvas(el, opts).then(function(canvas){
        if(!canvas.width || !canvas.height){ reject(new Error("empty-canvas")); return; }
        /* sub-pixel layout can leave the render a pixel off, so copy it onto a
           canvas of exactly the target size before encoding */
        var out = document.createElement("canvas");
        out.width = EXPORT_W;
        out.height = Math.round(EXPORT_W * 5 / 4);
        var ctx = out.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, out.width, out.height);
        ctx.drawImage(canvas, 0, 0, out.width, out.height);
        out.toBlob(function(blob){ blob ? resolve(blob) : reject(new Error("no-blob")); }, EXPORT_TYPE, EXPORT_QUALITY);
      }).catch(reject);
    });
  }

  function fileName(suffix){
    var base = (state.name || "my").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "my";
    return base + "-" + (EVENT.share.fileSlug || "tag") + "-" + suffix + "." + EXPORT_EXT;
  }

  /* saves a blob: artifact download capability first, then a plain browser download */
  /* A web page cannot write into a phone's photo library, but the system share
     sheet offers "Save Image" / "Save to Photos", which does. So on devices that
     support it that route comes first, with the plain download as the fallback. */
  function saveToGallery(blob, filename, msgEl, btn){
    var file = null;
    try{ file = new File([blob], filename, { type: EXPORT_TYPE }); }catch(e){}
    var canSheet = file && navigator.canShare && navigator.canShare({ files:[file] }) && navigator.share;
    if(!canSheet){ saveBlob(blob, filename, msgEl, btn); return; }

    navigator.share({ files:[file] }).then(function(){
      setMsg(msgEl, "Choose \u201cSave Image\u201d in the sheet and it lands in your photos.", "ok");
      if(btn) btn.disabled = false;
    }).catch(function(err){
      if(err && err.name === "AbortError"){
        setMsg(msgEl, "\u00A0");
        if(btn) btn.disabled = false;
        return;
      }
      saveBlob(blob, filename, msgEl, btn);
      showSaveFallback(blob);
    });
  }

  /* last resort on a phone: show the finished image so it can be long-pressed
     and added to the photo library */
  function showSaveFallback(blob){
    var box = $("#saveFallback"), img = $("#saveFallbackImg");
    if(!box || !img) return;
    img.src = URL.createObjectURL(blob);
    box.hidden = false;
  }

  function saveBlob(blob, filename, msgEl, btn){
    function done(text, kind){ setMsg(msgEl, text, kind); if(btn) btn.disabled = false; }
    getDownloads().then(function(api){
      if(api){
        api.save({ filename: filename, data: blob }).then(function(){
          done("Saved! Check your downloads.", "ok");
        }).catch(function(err){
          var code = err && err.code;
          if(code === "declined") done("No problem \u2014 you can save it any time.");
          else if(code === "too_large") done("That image is too large to save.", "error");
          else done("Couldn't save the image. Please try again.", "error");
        });
        return;
      }
      // plain-web fallback (works when the page is opened as a normal web page)
      try{
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
        done("Saved to your device.", "ok");
      }catch(e){
        done("Downloads aren't available in this view.", "error");
      }
    });
  }

  function exportAndSave(el, filename, msgEl, btn, saver){
    if(btn) btn.disabled = true;
    setMsg(msgEl, "Preparing your image\u2026");
    renderBlob(el).then(function(blob){
      (saver || saveBlob)(blob, filename, msgEl, btn);
    }).catch(function(){
      setMsg(msgEl, "Couldn't create the image.", "error");
      if(btn) btn.disabled = false;
    });
  }

  function copyCaption(silent){
    var text = captionWithTags();
    if(navigator.clipboard && navigator.clipboard.writeText){
      return navigator.clipboard.writeText(text).then(function(){
        if(!silent) toast("Caption copied \u2014 paste it in your post.");
        return true;
      }).catch(function(){ return false; });
    }
    return Promise.resolve(false);
  }

  /* native share sheet with the image attached, where the browser allows it */
  function nativeShare(msgEl, btn){
    if(btn) btn.disabled = true;
    setMsg(msgEl, "Preparing your image\u2026");
    syncKeepsakeCaption();
    renderBlob($("#memoryCard")).then(function(blob){
      var file = null;
      try{ file = new File([blob], fileName("keepsake"), { type:EXPORT_TYPE }); }catch(e){}
      if(file && navigator.canShare && navigator.canShare({ files:[file] }) && navigator.share){
        navigator.share({ files:[file], text: captionWithTags() }).then(function(){
          setMsg(msgEl, "Shared!", "ok");
          if(btn) btn.disabled = false;
        }).catch(function(){
          setMsg(msgEl, "Sharing was cancelled \u2014 you can download the image instead.");
          if(btn) btn.disabled = false;
        });
      } else {
        copyCaption(true);
        saveBlob(blob, fileName("keepsake"), msgEl, btn);
        toast("Your device can't share directly \u2014 image saved and caption copied.");
      }
    }).catch(function(){
      setMsg(msgEl, "Couldn't create the image.", "error");
      if(btn) btn.disabled = false;
    });
  }

  /* can this device hand the image straight to Instagram / LinkedIn? */
  function canShareFiles(blob){
    try{
      var f = new File([blob], "t." + EXPORT_EXT, { type: EXPORT_TYPE });
      return !!(navigator.canShare && navigator.canShare({ files:[f] }) && navigator.share) && f;
    }catch(e){ return false; }
  }

  var WEB_COMPOSER = {
    instagram: EVENT.share.instagramUrl,
    linkedin:  "https://www.linkedin.com/feed/?shareActive=true&text=",
    whatsapp:  "https://wa.me/?text="
  };

  function socialAction(kind){
    var msgEl = $("#saveMsg1");
    var label = kind.charAt(0).toUpperCase() + kind.slice(1);
    syncKeepsakeCaption();
    copyCaption(true);
    setMsg(msgEl, "Preparing your image\u2026");

    renderBlob($("#memoryCard")).then(function(blob){
      var file = canShareFiles(blob);
      /* on a phone the share sheet carries the image and the caption straight
         into Instagram or LinkedIn */
      if(file){
        navigator.share({ files:[file], text: captionWithTags() }).then(function(){
          setMsg(msgEl, "Shared to " + label + ".", "ok");
        }).catch(function(err){
          if(err && err.name === "AbortError"){ setMsg(msgEl, " "); return; }
          saveBlob(blob, fileName("keepsake"), msgEl, null);
          toast("Sharing was blocked \u2014 image saved and caption copied.");
        });
        return;
      }
      /* desktop: save the image, copy the caption, open the composer */
      saveBlob(blob, fileName("keepsake"), msgEl, null);
      if(kind === "whatsapp" || kind === "linkedin"){
        window.open(WEB_COMPOSER[kind] + encodeURIComponent(captionWithTags()), "_blank", "noopener");
        toast(label + " opened with your text \u2014 attach the saved image.");
      } else {
        window.open(WEB_COMPOSER.instagram, "_blank", "noopener");
        toast("Image saved and caption copied \u2014 add it as a new Instagram post.");
      }
    }).catch(function(){
      setMsg(msgEl, "Couldn't create the image.", "error");
    });
  }

  /* ---------- init ---------- */
  /* ------------------------------------------------------------------
     Branding pass: everything the event config says overrides what the
     markup ships with. Elements opt in with data-text / data-html /
     data-img; anything the config leaves out keeps the built-in wording.
     ------------------------------------------------------------------ */
  function applyBranding(){
    var T = EVENT.text || {}, B = EVENT.brand || {}, P = EVENT.palette || {};
    var root = document.documentElement;
    for(var v in P){ if(P[v]) root.style.setProperty("--" + v, P[v]); }

    /* "" means "we do not have this" -- the element goes away, and so does
       its box if nothing visible is left inside it */
    function drop(el){
      el.hidden = true;
      var parent = el.parentElement;
      if(parent && !parent.querySelector(":scope > *:not([hidden])")) parent.hidden = true;
    }
    $all("[data-text]").forEach(function(el){
      var val = T[el.getAttribute("data-text")];
      if(val === "") drop(el);
      else if(typeof val === "string") el.textContent = val;
    });
    $all("[data-html]").forEach(function(el){
      var val = T[el.getAttribute("data-html")];
      if(val === "") drop(el);
      else if(typeof val === "string") el.innerHTML = val;
    });
    $all("[data-img]").forEach(function(el){
      var val = B[el.getAttribute("data-img")];
      if(val) el.setAttribute("src", val);
      else drop(el);          /* no picture in the config: no empty slot either */
    });

    /* the tag itself: a ready-made design behind it, its shape, its name field */
    var TAG = EVENT.tag;
    if(TAG.background){
      root.style.setProperty("--tag-bg", 'url("' + TAG.background + '")');
      $all(".tag").forEach(function(el){ el.classList.add("has-bg"); });
    }
    if(TAG.ratio) root.style.setProperty("--tag-ratio", String(TAG.ratio));
    if(TAG.nameBox === false) $all(".tag").forEach(function(el){ el.classList.add("no-namebox"); });
    if(TAG.cover) state.cover = TAG.cover;
    if(TAG.chooseCover === false){          /* one cover only: no "Pick your cover" screen */
      SKIP_STEP[1] = true;
      var coverScreen = document.querySelector('.screen[data-step="1"]');
      if(coverScreen) coverScreen.hidden = true;
    }

    var handles = EVENT.share.handles;
    $all("[data-handles]").forEach(function(el){ if(handles) el.textContent = handles; });
    if(!handles) $all("[data-handles-note]").forEach(drop);

    if(EVENT.pageTitle) document.title = EVENT.pageTitle;
    var meta = document.querySelector('meta[name="description"]');
    if(meta && EVENT.pageDescription) meta.setAttribute("content", EVENT.pageDescription);
    var journal = $("#journalText");
    if(journal && T.journalPlaceholder) journal.placeholder = T.journalPlaceholder;
    var caption = $("#shareCaption");
    if(caption && T.captionLead) caption.placeholder = T.captionLead;
  }

  function init(){
    applyBranding();
    if(!SCENES.length){                 /* no gallery in the config: own photo only */
      var row = $("#sceneChoiceRow");
      if(row) row.hidden = true;
      state.photoSource = "own";
    }
    load();

    $("#nameInput").value = state.name;
    $("#nameInput").addEventListener("input", function(e){ state.name = e.target.value; syncName(); persist(); });
    $("#createBtn").addEventListener("click", function(){ goToStep(1); });
    $("#backBtn").addEventListener("click", function(){ goToStep(state.step - 1); });
    $all(".next-btn").forEach(function(btn){
      btn.addEventListener("click", function(){ goToStep(parseInt(btn.dataset.next,10)); });
    });
    $all(".choose-btn").forEach(function(b){
      b.addEventListener("click", function(){ state.cover = b.dataset.cover; syncCover(); persist(); });
    });

    renderStickerTray();
    photoSlot();                 /* the polaroid is always present, empty or filled */
    renderPlacedStickers();
    initJournal();
    renderGallery();
    initPhotoUploads();
    initPreviewSize();
    syncName();
    syncCover();
    syncPhotoChoices();
    syncKeepsake();
    /* image sizes depend on layout, so refresh once everything has settled */
    window.addEventListener("resize", syncCrops);
    window.addEventListener("resize", syncFilmCrops);

    $("#photoZoom").addEventListener("input", function(){
      var photo = selectedPhoto();
      if(!photo) return;
      filmCrop(photo).zoom = parseFloat(this.value) || 1;
      syncFilmCrops();
    });
    $("#photoZoom").addEventListener("change", persist);
    $("#photoZoomReset").addEventListener("click", function(){
      var photo = selectedPhoto();
      if(!photo) return;
      photo.crop = { x:0, y:0, zoom:1 };
      syncFilmCrops(); syncPhotoZoom(); persist();
    });
    $all("#sceneHeroImg, #sceneImg, #selfieImg").forEach(function(img){
      img.addEventListener("load", syncCrops);
    });
    setTimeout(syncCrops, 300);
    if(state.caption) $("#shareCaption").value = state.caption;
    syncConsent();

    /* clicking anywhere outside a placed sticker clears the selection */
    document.addEventListener("pointerdown", function(ev){
      if(!ev.target.closest(".placed-sticker")) deselectSticker();
    });

    $("#shareCaption").addEventListener("input", function(e){
      state.caption = e.target.value;
      state.captionEdited = true;    /* the user owns the text from now on */
      persist();
    });
    $("#consentCheck").addEventListener("change", function(){ syncConsent(); });

    $("#downloadBtn").addEventListener("click", function(){
      syncKeepsakeCaption();
      copyCaption(true);
      exportAndSave($("#memoryCard"), fileName("keepsake"), $("#saveMsg1"), $("#downloadBtn"), saveToGallery);
    });
    $("#shareSaveBtn").addEventListener("click", function(){
      nativeShare($("#saveMsg1"), $("#shareSaveBtn"));
    });
    $("#copyCaptionBtn").addEventListener("click", function(){
      copyCaption(false).then(function(ok){ if(!ok) toast("Couldn't copy \u2014 select the text manually."); });
    });
    $all(".social-btn").forEach(function(b){
      b.addEventListener("click", function(){ socialAction(b.dataset.social); });
    });

    $("#restartBtn").addEventListener("click", function(){
      if(!confirm("Start a brand new tag? This clears your current one.")) return;
      try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
      location.reload();   /* full reset back to "Make a tag yours" */
    });

    goToStep(state.step || 0);
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
