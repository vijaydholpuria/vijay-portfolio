/* =========================
   3D TOUCH INTERACTION
   Adds pointer-based tilt to selected blocks.
========================= */
let isNavOpen = false;
/* FILE LINK MAP
   HTML IDs/classes used here:
   - #hamburger, #slideNav (mobile nav)
   - .hero (parallax), .hero-content (tilt)
   - .reveal (scroll reveal state)
   - #profilePic, #imageViewer, #closeImage (image modal)
   - #sliderTrack, .slider-card (contact slider)
   CSS classes toggled by JS:
   - .active on .slide-nav / .hamburger / .image-viewer
   - .active on .reveal for enter animation
   - CSS custom props for .tilt-target and .hero parallax */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function add3DTilt(element, options = {}) {
    if (!element || prefersReducedMotion) return;

    const {
        maxTilt = 6,
        scale = 1.01,
        lift = 8
    } = options;

    let frameId = null;

    element.classList.add("tilt-target");

    function resetTilt() {
        element.style.setProperty("--rx", "0deg");
        element.style.setProperty("--ry", "0deg");
        element.style.setProperty("--tz", "0px");
        element.style.setProperty("--scale", "1");
    }

    function setTilt(clientX, clientY) {
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;

        const rotateY = (x - 0.5) * (maxTilt * 2);
        const rotateX = (0.5 - y) * (maxTilt * 2);

        element.style.setProperty("--rx", `${rotateX.toFixed(2)}deg`);
        element.style.setProperty("--ry", `${rotateY.toFixed(2)}deg`);
        element.style.setProperty("--tz", `${lift}px`);
        element.style.setProperty("--scale", String(scale));
    }

    resetTilt();

    element.addEventListener("pointermove", (event) => {
        if (event.pointerType === "touch") return;

        if (frameId) cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(() => setTilt(event.clientX, event.clientY));
    });

    element.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "touch") return;
        setTilt(event.clientX, event.clientY);
    });

    element.addEventListener("pointerleave", resetTilt);
    element.addEventListener("pointercancel", resetTilt);
}

function init3DTilt() {
    // Hero text and profile card are primary interactive surfaces.
    add3DTilt(document.querySelector(".hero-content"), { maxTilt: 4, scale: 1.008, lift: 8 });
    add3DTilt(document.querySelector(".profile-card"), { maxTilt: 5, scale: 1.008, lift: 8 });

    // Contact cards also get subtle tilt.
    document.querySelectorAll(".slider-card").forEach((card) => {
        add3DTilt(card, { maxTilt: 4, scale: 1.006, lift: 6 });
    });
}

init3DTilt();

/* =========================
   HERO PARALLAX
   Moves hero background image via --hero-shift CSS variable.
========================= */
const hero = document.querySelector(".hero");

function updateHeroParallax() {
    if (!hero || prefersReducedMotion) return;
    const rect = hero.getBoundingClientRect();
    const maxShift = 26;
    const shift = Math.max(-maxShift, Math.min(maxShift, rect.top * -0.08));
    hero.style.setProperty("--hero-shift", `${shift}px`);
}

window.addEventListener("scroll", updateHeroParallax, { passive: true });
updateHeroParallax();

/* =========================
   SCROLL REVEAL
   Activates .reveal sections when they enter viewport.
========================= */
const reveals = document.querySelectorAll(".reveal");

function revealOnScroll() {
    const windowHeight = window.innerHeight;
    reveals.forEach((section) => {
        if (section.getBoundingClientRect().top < windowHeight - 120) {
            section.classList.add("active");
        }
    });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

/* =========================
   NAVBAR
   Controls mobile nav open/close states.
========================= */
const hamburger = document.getElementById("hamburger");
const slideNav = document.getElementById("slideNav");

function openNav() {
    isNavOpen = true;
    hamburger.classList.add("active");
    slideNav.classList.add("active");
}

function closeNav() {
    isNavOpen = false;
    hamburger.classList.remove("active");
    slideNav.classList.remove("active");
}

if (hamburger && slideNav) {
    hamburger.addEventListener("click", (e) => {
        e.stopPropagation();
        slideNav.classList.contains("active") ? closeNav() : openNav();
    });

    slideNav.addEventListener("click", (e) => e.stopPropagation());

    document.querySelectorAll(".slide-nav a").forEach((link) => {
        link.addEventListener("click", closeNav);
    });
    
    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!isNavOpen) return;
        if (slideNav.contains(target) || hamburger.contains(target)) return;
        closeNav();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && isNavOpen) {
            closeNav();
        }
    });
}

/* =========================
   IMAGE VIEWER
   Profile image modal open/close logic.
========================= */
const profilePic = document.getElementById("profilePic");
const imageViewer = document.getElementById("imageViewer");
const closeImage = document.getElementById("closeImage");

if (profilePic && imageViewer && closeImage) {
    profilePic.addEventListener("click", () => {
        imageViewer.classList.add("active");
    });

    closeImage.addEventListener("click", () => {
        imageViewer.classList.remove("active");
    });

    imageViewer.addEventListener("click", () => {
        imageViewer.classList.remove("active");
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            imageViewer.classList.remove("active");
        }
    });
}

/* =========================
   SLIDER (ARROWS + AUTO)
   Contact cards auto-slide every 3s in loop + manual controls.
========================= */
const track = document.getElementById("sliderTrack");
const AUTO_SLIDE_DELAY = 3000;
let autoInterval = null;
let scrollSyncTimeout = null;
let normalizeTimeout = null;
let loopWidth = 0;
let slideStep = 0;
let baseCardCount = 0;

function setupSliderLoop() {
    if (!track) return;

    // Duplicate original cards once for seamless infinite looping.
    const originalCards = Array.from(track.querySelectorAll(".slider-card"));
    if (!originalCards.length) return;

    if (!track.dataset.loopReady) {
        const fragment = document.createDocumentFragment();
        originalCards.forEach((card) => {
            const clone = card.cloneNode(true);
            clone.setAttribute("aria-hidden", "true");
            fragment.appendChild(clone);
            add3DTilt(clone, { maxTilt: 4, scale: 1.006, lift: 6 });
        });
        track.appendChild(fragment);
        track.dataset.loopReady = "true";
    }

    const allCards = Array.from(track.querySelectorAll(".slider-card"));
    baseCardCount = Math.floor(allCards.length / 2);
    if (!baseCardCount) return;

    const firstCard = allCards[0];
    const secondCard = allCards[1] || allCards[0];
    slideStep = Math.max(1, secondCard.offsetLeft - firstCard.offsetLeft || firstCard.offsetWidth);
    loopWidth = allCards[baseCardCount].offsetLeft - firstCard.offsetLeft;

    if (loopWidth <= 0) {
        loopWidth = slideStep * baseCardCount;
    }

    normalizeLoopPosition(true);
}

function normalizeLoopPosition(force = false) {
    if (!track || !loopWidth) return;

    if (force) {
        while (track.scrollLeft >= loopWidth) {
            track.scrollLeft -= loopWidth;
        }
        while (track.scrollLeft < 0) {
            track.scrollLeft += loopWidth;
        }
        return;
    }

    if (track.scrollLeft >= loopWidth) {
        track.scrollLeft -= loopWidth;
    } else if (track.scrollLeft < 0) {
        track.scrollLeft += loopWidth;
    }
}

function moveSlider(direction = 1, smooth = true) {
    if (!track || !slideStep) return;

    if (direction < 0 && track.scrollLeft <= 2 && loopWidth) {
        track.scrollLeft += loopWidth;
    }

    track.scrollBy({
        left: direction * slideStep,
        behavior: smooth ? "smooth" : "auto"
    });

    clearTimeout(normalizeTimeout);
    normalizeTimeout = setTimeout(() => normalizeLoopPosition(), smooth ? 420 : 20);
}

function stopAutoSlide() {
    if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
    }
}

function startAutoSlide() {
    if (!track || baseCardCount <= 1) return;

    stopAutoSlide();
    autoInterval = setInterval(() => {
        moveSlider(1, true);
    }, AUTO_SLIDE_DELAY);
}

function restartAutoSlide() {
    normalizeLoopPosition(true);
    startAutoSlide();
}

function scrollLeftBtn() {
    if (!track || !slideStep) return;
    stopAutoSlide();
    moveSlider(-1, true);
    startAutoSlide();
}

function scrollRightBtn() {
    if (!track || !slideStep) return;
    stopAutoSlide();
    moveSlider(1, true);
    startAutoSlide();
}

if (track) {
    // Initialize loop + autoplay and keep loop consistent on interaction/resize.
    setupSliderLoop();
    startAutoSlide();

    track.addEventListener("mouseenter", stopAutoSlide);
    track.addEventListener("mouseleave", restartAutoSlide);
    track.addEventListener("touchstart", stopAutoSlide, { passive: true });
    track.addEventListener("touchend", restartAutoSlide, { passive: true });

    track.addEventListener("scroll", () => {
        clearTimeout(scrollSyncTimeout);
        scrollSyncTimeout = setTimeout(() => normalizeLoopPosition(), 120);
    }, { passive: true });

    window.addEventListener("resize", () => {
        setupSliderLoop();
        restartAutoSlide();
    });
}