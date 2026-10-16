(() => {
  "use strict";
  const config = window.BIRTHDAY_CONFIG;
  if (!config) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const chapters = $$(".chapter");
  const dots = $$(".dot");
  const langButtons = $$(".lang-button");
  const toast = $("#toast");
  let language = "es";
  let currentChapter = 0;
  let currentPhoto = 0;
  let wishMade = false;
  let letterRevealed = false;
  let toastTimer;

  const t = (key, vars = {}) => {
    let value = (config.copy[language] && config.copy[language][key]) || config.copy.es[key] || key;
    Object.entries(vars).forEach(([name, replacement]) => { value = value.replaceAll(`{${name}}`, replacement); });
    return value;
  };
  const safeText = (value) => String(value ?? "");
  const recipient = () => config.recipientName?.trim() || (language === "es" ? "mi niña" : "my girl");

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function renderTranslations() {
    document.documentElement.lang = language;
    $$("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      const value = t(key, { name: recipient() });
      if (key === "welcomeTitle") {
        const name = document.createElement("span");
        name.className = "name-slot";
        // name.textContent = recipient();
        el.replaceChildren(document.createTextNode(value.split("{name}")[0]), name, document.createTextNode(value.split("{name}")[1] || ""));
      } else {
        el.textContent = value;
      }
    });
    langButtons.forEach(button => {
      const active = button.dataset.lang === language;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    $("#chapterCounter").textContent = t("chapter", { current: currentChapter + 1 });
    $("#progressCaption").textContent = t("progressCaption");
    renderNotes();
    renderGallery();
    updateMusicButton();
    $("#wishMessage").textContent = wishMade ? t("wishAfter") : t("wishPrompt");
  }

  function goTo(index) {
    const nextIndex = Math.max(0, Math.min(chapters.length - 1, Number(index)));
    if (nextIndex === currentChapter) return;
    if (nextIndex === 5) createCelebration();
    chapters[currentChapter].classList.remove("active");
    chapters[currentChapter].hidden = true;
    currentChapter = nextIndex;
    chapters[currentChapter].hidden = false;
    chapters[currentChapter].classList.remove("active");
    // Reflow lets the chapter entrance animation run after the hidden state changes.
    void chapters[currentChapter].offsetWidth;
    chapters[currentChapter].classList.add("active");
    dots.forEach((dot, i) => {
      dot.classList.toggle("current", i === currentChapter);
      dot.classList.toggle("visited", i < currentChapter);
      dot.setAttribute("aria-current", i === currentChapter ? "step" : "false");
    });
    $("#chapterCounter").textContent = t("chapter", { current: currentChapter + 1 });
    $("#progressCaption").textContent = t("progressCaption");
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    syncMusicForChapter();
  }

  function renderNotes() {
    const grid = $("#noteGrid");
    const existingOpen = new Set($$(".note-card.open", grid).map(card => card.dataset.index));
    grid.replaceChildren();
    config.loveNotes.forEach((note, index) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "note-card" + (existingOpen.has(String(index)) ? " open" : "");
      card.dataset.index = index;
      card.setAttribute("aria-expanded", String(existingOpen.has(String(index))));
      const icon = document.createElement("span"); icon.className = "note-icon"; icon.textContent = note.icon || "♡";
      const title = document.createElement("span"); title.className = "note-title"; title.textContent = (language === "en" ? note.titleEn : note.title) || note.title || "";
      const hint = document.createElement("span"); hint.className = "note-hint"; hint.textContent = existingOpen.has(String(index)) ? "" : (language === "es" ? "toca para abrir ♡" : "tap to open ♡");
      card.append(icon, title, hint);
      if (existingOpen.has(String(index))) {
        const body = document.createElement("span"); body.className = "note-body"; body.textContent = (language === "en" ? note.bodyEn : note.body) || note.body || ""; card.append(body);
      }
      card.addEventListener("click", () => {
        const open = card.classList.toggle("open");
        card.setAttribute("aria-expanded", String(open));
        if (open) {
          const body = document.createElement("span"); body.className = "note-body"; body.textContent = (language === "en" ? note.bodyEn : note.body) || note.body || ""; card.append(body);
          hint.textContent = "";
        } else {
          $(".note-body", card)?.remove();
          hint.textContent = language === "es" ? "toca para abrir ♡" : "tap to open ♡";
        }
      });
      grid.append(card);
    });
  }

  function imageFallback(img, caption) {
    img.removeAttribute("src");
    img.alt = t("photoMissing");
    img.classList.add("missing-image");
    const parent = img.parentElement;
    if (parent && !$(".missing-placeholder", parent)) {
      const placeholder = document.createElement("div");
      placeholder.className = "missing-placeholder";
      placeholder.textContent = t("photoMissing");
      parent.append(placeholder);
    }
  }

  
function galleryItems() {
  const photos = (config.photos || []).map(item => ({
    ...item,
    kind: "photo"
  }));

  const videos = (config.videos || []).map(item => ({
    ...item,
    kind: "video"
  }));

  return [...photos, ...videos];
}

function renderGallery() {
  const items = galleryItems();
  if (!items.length) return;

  currentPhoto = Math.max(
    0,
    Math.min(currentPhoto, items.length - 1)
  );

  const item = items[currentPhoto];
  const photo = document.getElementById("mainPhoto");
  const video = document.getElementById("mainVideo");

  // Stop the previous video when changing gallery items.
 // Stop the previous video when changing gallery items.
  video.pause();

  const showingVideo = item.kind === "video";

  // Explicitly control visibility to prevent the photo
  // and video from appearing at the same time.
  photo.hidden = showingVideo;
  photo.style.display = showingVideo ? "none" : "";

  video.hidden = !showingVideo;
  video.style.display = showingVideo ? "block" : "none";

  if (item.kind === "video") {
    photo.removeAttribute("src");

    if (video.dataset.src !== item.src) {
      video.src = item.src;
      video.dataset.src = item.src;
      video.load();
    }

    video.poster = item.poster || "";
    video.setAttribute(
      "aria-label",
      item.alt || "Gallery video"
    );
  } else {
    video.pause();
    video.removeAttribute("src");
    delete video.dataset.src;

    photo.onerror = () => {
      photo.alt = t("photoMissing");
    };

    photo.src = item.src;
    photo.alt = item.alt || "";
  }

  const caption = language === "en"
    ? (item.captionEn || item.caption || "")
    : (item.caption || "");

  document.getElementById("photoCaption").textContent =
    caption;

  document.getElementById("photoCount").textContent =
    `${currentPhoto + 1} / ${items.length}`;

  // Show thumbnails for both photos and videos.
  const row = document.getElementById("thumbnailRow");
  row.replaceChildren();

  items.forEach((entry, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "thumbnail" + (index === currentPhoto ? " active" : "");

    button.setAttribute("aria-pressed", String(index === currentPhoto));
    button.setAttribute(
      "aria-label",
      `${entry.kind === "video" ? "Video" : "Foto"} ${index + 1}`
    );

    if (entry.kind === "video") {
      if (entry.poster) {
        const img = document.createElement("img");
        img.src = entry.poster;
        img.alt = "";
        img.loading = "lazy";
        button.appendChild(img);
      } else {
        button.classList.add("video-thumbnail");
        button.textContent = "▶";
      }
    } else {
      const img = document.createElement("img");
      img.src = entry.src;
      img.alt = "";
      img.loading = "lazy";
      button.appendChild(img);
    }

    button.addEventListener("click", () => {
      currentPhoto = index;
      renderGallery();
    });

    row.appendChild(button);
  });

  document.getElementById("expandPhoto").hidden =
    item.kind === "video";
}

  function movePhoto(delta) {
    const total = galleryItems().length;
    if (!total) return;

    currentPhoto =
      (currentPhoto + delta + total) % total;

    renderGallery();
  }


  // One soundtrack player is used for all chapters so tracks never overlap.
  const audio = $("#audioPlayer");
  let birthdayStarted = false;
  let userPausedMusic = false;
  let pendingAutoplay = false;

  function updateMusicButton() {
    const playing = !audio.paused && !audio.ended;
    $("#musicShortcut").textContent = playing ? "Ⅱ" : "♫";
    $("#musicShortcut").setAttribute(
      "aria-label",
      playing
        ? (language === "es" ? "Pausar música" : "Pause music")
        : (language === "es" ? "Reanudar música" : "Resume music")
    );
    $("#musicShortcut").title = playing
      ? (language === "es" ? "Pausar música" : "Pause music")
      : (language === "es" ? "Reanudar música" : "Resume music");
  }

  function stopMusic() {
    audio.pause();
    audio.currentTime = 0;
    pendingAutoplay = false;
    updateMusicButton();
  }

  async function playTrack(track, { restart = false } = {}) {
    userPausedMusic = false;
    if (!track?.src) {
      stopMusic();
      return false;
    }

    const isLetterVoice = Boolean(config.letterVoiceNote?.src && track.src === config.letterVoiceNote.src);
    audio.loop = !isLetterVoice;
    if (audio.dataset.src !== track.src) {
      audio.pause();
      audio.src = track.src;
      audio.dataset.src = track.src;
      audio.load();
      restart = true;
    }
    if (restart || audio.ended) audio.currentTime = 0;

    try {
      await audio.play();
      pendingAutoplay = false;
      userPausedMusic = false;
      updateMusicButton();
      return true;
    } catch (error) {
      // Browsers may block audible autoplay until the visitor interacts.
      pendingAutoplay = true;
      updateMusicButton();
      return false;
    }
  }

  function trackForChapter() {
    if (currentChapter >= 0 && currentChapter <= 2) return config.songs?.[0];
    if (currentChapter === 3) return config.songs?.[1];
    if ((currentChapter === 4 || currentChapter === 5) && birthdayStarted) return config.birthdaySong;
    return null;
  }

  function syncMusicForChapter() {
    const track = trackForChapter();
    if (!track) {
      stopMusic();
      return;
    }
    if (userPausedMusic) {
      // Keep the user's pause choice until they tap the corner control again.
      if (audio.dataset.src === track.src) {
        audio.pause();
        updateMusicButton();
        return;
      }
      userPausedMusic = false;
    }
    if (audio.dataset.src !== track.src) {
      void playTrack(track, { restart: true });
    } else if (audio.paused) {
      void playTrack(track);
    }
  }

  $("#musicShortcut").addEventListener("click", async () => {
    if (!audio.paused && !audio.ended) {
      userPausedMusic = true;
      audio.pause();
      updateMusicButton();
      return;
    }
    userPausedMusic = false;
    const track = trackForChapter();
    if (track) await playTrack(track);
    else updateMusicButton();
  });

  audio.addEventListener("play", updateMusicButton);
  audio.addEventListener("pause", updateMusicButton);
  audio.addEventListener("ended", () => {
    // loop=true normally handles this; restart defensively for supported tracks.
    if (audio.loop && trackForChapter()) {
      audio.currentTime = 0;
      void audio.play().catch(() => { pendingAutoplay = true; });
    }
    updateMusicButton();
  });
  audio.addEventListener("error", () => {
    // If the optional voice-note file was not added, gracefully fall back to Amor.
    if (currentChapter === 2 && config.letterVoiceNote?.src && audio.dataset.src === config.letterVoiceNote.src && config.songs?.[0]?.src) {
      audio.dataset.src = "";
      void playTrack(config.songs[0], { restart: true });
      return;
    }
    updateMusicButton();
  });

  function createCelebration() {
    const burst = $("#celebrationBurst");
    if (burst.dataset.created === "true") return;
    burst.dataset.created = "true";
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      ["✦", "♡", "✧", "✿", "♡", "✦"].forEach((symbol, i) => {
        const spark = document.createElement("span"); spark.className = "spark-burst"; spark.textContent = symbol;
        spark.style.left = `${8 + i * 16}%`; spark.style.top = `${12 + (i % 3) * 18}%`; burst.append(spark);
      });
      return;
    }
    for (let i = 0; i < 70; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = ["#ed9db8", "#d2b9ed", "#f7c7a9", "#b8e2cf", "#f4d879"][i % 5];
      piece.style.setProperty("--duration", `${3.5 + Math.random() * 4}s`);
      piece.style.setProperty("--delay", `${Math.random() * -7}s`);
      piece.style.setProperty("--rotate", `${Math.random() * 240}deg`);
      piece.style.setProperty("--drift", `${Math.random() * 130 - 65}px`);
      burst.append(piece);
    }
    ["✦", "♡", "✧", "✿", "♡", "✦", "🦋"].forEach((symbol, i) => {
      const spark = document.createElement("span"); spark.className = "spark-burst"; spark.textContent = symbol;
      spark.style.left = `${5 + i * 14}%`; spark.style.top = `${8 + (i % 3) * 20}%`; spark.style.animationDelay = `${i * -.3}s`; burst.append(spark);
    });

    // Decorative fireworks behind the birthday message.
    [
      { left: "16%", top: "24%", delay: "0s" },
      { left: "82%", top: "20%", delay: ".7s" },
      { left: "70%", top: "47%", delay: "1.3s" },
      { left: "27%", top: "53%", delay: "1.8s" }
    ].forEach((position, index) => {
      const firework = document.createElement("span");
      firework.className = "firework";
      firework.setAttribute("aria-hidden", "true");
      firework.style.left = position.left;
      firework.style.top = position.top;
      firework.style.animationDelay = position.delay;
      firework.style.setProperty("--firework-hue", `${325 + index * 38}deg`);
      burst.append(firework);
    });
  }

  langButtons.forEach(button => button.addEventListener("click", () => {
    language = button.dataset.lang;
    renderTranslations();
  }));
  $("#startButton").addEventListener("click", () => goTo(1));
  $$("[data-next]").forEach(button => button.addEventListener("click", () => goTo(currentChapter + 1)));
  $$("[data-back]").forEach(button => button.addEventListener("click", () => goTo(currentChapter - 1)));
  dots.forEach(dot => dot.addEventListener("click", () => goTo(Number(dot.dataset.go))));
  $("#homeLink").addEventListener("click", event => { event.preventDefault(); goTo(0); });

  function revealLetterText() {
    const paragraphs = $$("#loveLetterCard .letter-body p");
    const parts = paragraphs.map(node => ({ node, text: node.textContent }));
    parts.forEach(({ node }) => { node.textContent = ""; });
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      parts.forEach(({ node, text }) => { node.textContent = text; });
      return;
    }
    let partIndex = 0;
    let charIndex = 0;
    const typeNext = () => {
      if (partIndex >= parts.length) return;
      const part = parts[partIndex];
      part.node.textContent = part.text.slice(0, ++charIndex);
      if (charIndex >= part.text.length) { partIndex++; charIndex = 0; }
      if (partIndex < parts.length) setTimeout(typeNext, 23);
    };
    typeNext();
  }

  $("#openLetterButton").addEventListener("click", () => {
    if (letterRevealed) return;
    letterRevealed = true;
    // The optional spoken letter begins on the deliberate envelope tap; if its file is missing, Amor continues.
    if (config.letterVoiceNote?.src) void playTrack(config.letterVoiceNote, { restart: true });
    const button = $("#openLetterButton");
    const card = $("#loveLetterCard");
    button.classList.add("is-opening");
    button.disabled = true;
    setTimeout(() => {
      button.hidden = true;
      card.hidden = false;
      card.classList.add("letter-opening");
      void card.offsetWidth;
      card.classList.add("is-open");
      revealLetterText();
    }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 620);
  });
  $("#prevPhoto").addEventListener("click", () => movePhoto(-1));
  $("#nextPhoto").addEventListener("click", () => movePhoto(1));

  // Touch swipe on the featured image; vertical scrolling remains available.
  let touchStartX = null, touchStartY = null;
  $("#featuredPhoto").addEventListener("touchstart", event => {
    const touch = event.changedTouches[0]; touchStartX = touch.clientX; touchStartY = touch.clientY;
  }, { passive: true });
  $("#featuredPhoto").addEventListener("touchend", event => {
    if (touchStartX === null) return;
    const touch = event.changedTouches[0], dx = touch.clientX - touchStartX, dy = touch.clientY - touchStartY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.25) movePhoto(dx < 0 ? 1 : -1);
    touchStartX = touchStartY = null;
  }, { passive: true });

  
function openCurrentPhoto() {
  const photo = galleryItems()[currentPhoto];

  // Do not enlarge videos.
  if (!photo || photo.kind !== "photo") return;

  const dialog = $("#photoDialog");

  // Avoid opening the dialog twice.
  if (dialog.open) return;

  $("#largePhoto").src = photo.src;
  $("#largePhoto").alt = photo.alt || "";

  $("#largeCaption").textContent =
    (language === "en"
      ? photo.captionEn
      : photo.caption) || photo.caption || "";

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    window.open(photo.src, "_blank", "noopener");
  }
}

// Enlarge by clicking the main photo.
$("#mainPhoto").addEventListener("click", openCurrentPhoto);

// Keep the existing enlarge icon working.
$("#expandPhoto").addEventListener("click", openCurrentPhoto);

// Allow keyboard users to open the photo too.
$("#mainPhoto").addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openCurrentPhoto();
  }
});

  $("#closePhotoDialog").addEventListener("click", () => $("#photoDialog").close());
  $("#photoDialog").addEventListener("click", event => { if (event.target === $("#photoDialog")) $("#photoDialog").close(); });

  $("#wishButton").addEventListener("click", () => {
    if (wishMade) { birthdayStarted = true; void playTrack(config.birthdaySong, { restart: true }); goTo(5); return; }
    wishMade = true;
    birthdayStarted = true;
    $("#chapter-4").classList.add("blown");
    $("#wishMessage").textContent = t("wishAfter");
    $("#wishButton").innerHTML = `<span>${language === "es" ? "¡Vamos a celebrar!" : "Let's celebrate!"}</span> <span aria-hidden="true">✨</span>`;
    // Start the birthday song on this deliberate tap, then reveal page 6.
    void playTrack(config.birthdaySong, { restart: true });
    $("#wishButton").disabled = true;
    setTimeout(() => { $("#wishButton").disabled = false; goTo(5); }, 1250);
  });
  $("#replayButton").addEventListener("click", () => {
    if (currentChapter === 5 && birthdayStarted) void playTrack(config.birthdaySong, { restart: true });
    createCelebration();
    // Replay just the celebration; no need to restart the whole experience.
    $("#celebrationBurst").querySelectorAll(".confetti-piece").forEach(piece => {
      piece.style.animation = "none"; void piece.offsetWidth; piece.style.animation = "";
    });
    showToast(language === "es" ? "¡Que siga la celebración! ♡" : "Let the celebration continue! ♡");
  });
  $("#restartButton").addEventListener("click", () => {
    wishMade = false;
    $("#chapter-4").classList.remove("blown");
    $("#wishButton").disabled = false;
    $("#wishButton").innerHTML = `<span>${t("wishCta")}</span> <span aria-hidden="true">♡</span>`;
    birthdayStarted = false;
    userPausedMusic = false;
    stopMusic();
    goTo(0);
  });

  // Ensure the final celebration doesn't start a previously playing track.
  const originalGoTo = goTo;
  // Browser media events and all state changes are user-triggered; no autoplay.
  renderTranslations();
  dots[0].classList.add("current");
  chapters.forEach((chapter, i) => { chapter.hidden = i !== 0; });
  // Attempt to start Amor on page load. Browsers may require the first tap.
  void playTrack(config.songs?.[0], { restart: true });
  document.addEventListener("pointerdown", () => {
    if (pendingAutoplay && !userPausedMusic) syncMusicForChapter();
  }, { once: true });
})();
