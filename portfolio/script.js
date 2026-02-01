/* =========================
   3D CARD LOOP ANIMATION
   ========================= */
const card = document.querySelector(".profile-card");
let angle = 0;
let isNavOpen = false;

function animateCard() {
    if (!card || isNavOpen) {
        requestAnimationFrame(animateCard);
        return;
    }

    const isMobile = window.innerWidth < 768;
    angle += isMobile ? 0.12 : 0.25;

    const rotateY = Math.sin(angle * Math.PI / 180) * (isMobile ? 3 : 5);
    const rotateX = Math.cos(angle * Math.PI / 180) * (isMobile ? 2 : 3);
    const translateY = Math.sin(angle * Math.PI / 180) * (isMobile ? 3 : 5);

    card.style.transform = `
        rotateY(${rotateY}deg)
        rotateX(${rotateX}deg)
        translateY(${translateY}px)
    `;

    requestAnimationFrame(animateCard);
}

animateCard();

/* =========================
   SCROLL REVEAL
   ========================= */
const reveals = document.querySelectorAll(".reveal");

function revealOnScroll() {
    const windowHeight = window.innerHeight;
    reveals.forEach(section => {
        if (section.getBoundingClientRect().top < windowHeight - 120) {
            section.classList.add("active");
        }
    });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();

/* =========================
   NAVBAR PERFECT LOGIC
   ========================= */
const hamburger = document.getElementById("hamburger");
const slideNav = document.getElementById("slideNav");
const layout = document.querySelector(".layout");

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

/* Hamburger toggle */
hamburger.addEventListener("click", (e) => {
    e.stopPropagation(); // important
    slideNav.classList.contains("active") ? closeNav() : openNav();
});

/* 🔥 MAIN FIX: LANDING PAGE CLICK = CLOSE */
layout.addEventListener("click", () => {
    if (isNavOpen) {
        closeNav();
    }
});

/* Sidebar ke andar click pe close NA ho */
slideNav.addEventListener("click", (e) => {
    e.stopPropagation();
});

/* Sidebar link click → close */
document.querySelectorAll(".slide-nav a").forEach(link => {
    link.addEventListener("click", closeNav);
});
/* =========================
   PROFILE IMAGE VIEWER
   ========================= */
document.addEventListener("DOMContentLoaded", () => {

    const profilePic = document.getElementById("profilePic");
    const imageViewer = document.getElementById("imageViewer");
    const closeImage = document.getElementById("closeImage");

    if (!profilePic || !imageViewer || !closeImage) {
        console.log("Image viewer elements missing");
        return;
    }

    profilePic.addEventListener("click", () => {
        imageViewer.classList.add("active");
    });

    closeImage.addEventListener("click", () => {
        imageViewer.classList.remove("active");
    });

    imageViewer.addEventListener("click", (e) => {
        if (e.target === imageViewer) {
            imageViewer.classList.remove("active");
        }
    });
});

/* =========================
   MOBILE SWIPE TO CLOSE
   ========================= */
let startY = 0;
let currentY = 0;
let isSwiping = false;

const viewerImg = document.querySelector(".viewer-img");

imageViewer.addEventListener("touchstart", (e) => {
    if (!imageViewer.classList.contains("active")) return;

    startY = e.touches[0].clientY;
    isSwiping = true;
});

imageViewer.addEventListener("touchmove", (e) => {
    if (!isSwiping) return;

    currentY = e.touches[0].clientY;
    const diffY = currentY - startY;

    if (diffY > 0) {
        viewerImg.style.transform = `translateY(${diffY}px) scale(${1 - diffY / 600})`;
    }
});

imageViewer.addEventListener("touchend", () => {
    if (!isSwiping) return;

    const diffY = currentY - startY;

    if (diffY > 120) {
        imageViewer.classList.remove("active");
    } else {
        viewerImg.style.transform = "translateY(0) scale(1)";
    }

    isSwiping = false;
    startY = 0;
    currentY = 0;
});
