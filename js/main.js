"use strict";

/* ===== 1. Mobile menu toggle ===== */
const menuBtn = document.getElementById("menu-toggle");
const nav = document.getElementById("site-nav");

function closeMenu() {
  nav.classList.add("hidden");
  menuBtn.setAttribute("aria-expanded", "false");
  menuBtn.setAttribute("aria-label", "Open navigation menu");
}

menuBtn.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("hidden") === false;
  menuBtn.setAttribute("aria-expanded", String(isOpen));
  menuBtn.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  if (isOpen) positionNavIndicator();
});
nav.addEventListener("click", (e) => {
  if (e.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menuBtn.focus();
  }
});

/* ===== 2. Active nav highlight (click + scroll) ===== */
const navLinks = document.querySelectorAll(".nav-link");
const navIndicator = nav.querySelector(".nav-indicator");
const sections = Array.from(document.querySelectorAll("main section[id]"));
let clickLock = false;
let lockTimer;

function positionNavIndicator() {
  const activeLink = nav.querySelector('.nav-link[aria-current="true"]');
  if (!activeLink || !navIndicator || window.getComputedStyle(nav).display === "none") return;

  navIndicator.style.width = `${activeLink.offsetWidth}px`;
  navIndicator.style.height = `${activeLink.offsetHeight}px`;
  navIndicator.style.transform = `translate(${activeLink.offsetLeft}px, ${activeLink.offsetTop}px)`;
  navIndicator.classList.add("is-visible");
}

function setActive(id) {
  navLinks.forEach((link) => {
    link.setAttribute("aria-current", String(link.getAttribute("href") === "#" + id));
  });
  positionNavIndicator();
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const id = link.getAttribute("href").slice(1);
    if (!document.getElementById(id)) return;
    setActive(id);
    clickLock = true;
    clearTimeout(lockTimer);
    lockTimer = setTimeout(() => { clickLock = false; updateOnScroll(); }, 1500);
  });
});

window.addEventListener("scrollend", () => {
  clickLock = false;
  clearTimeout(lockTimer);
  updateOnScroll();
});

window.addEventListener("resize", positionNavIndicator);

function updateOnScroll() {
  if (clickLock || sections.length === 0) return;
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  let current = sections[0].id;
  if (atBottom) {
    current = sections[sections.length - 1].id;
  } else {
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= window.innerHeight * 0.35) current = section.id;
    });
  }
  setActive(current);
}

// window.addEventListener('scroll', () => {
//   const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;
//   if (atBottom && sections.length) setActive(sections[sections.length - 1].id);
// }, { passive: true });

let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { updateOnScroll(); ticking = false; });
}, { passive: true });
updateOnScroll();

/* ===== 3. Contact form validation (runs only if the form exists) ===== */
const form = document.getElementById("contact-form");
if (form) {
  const statusEl = document.getElementById("form-status");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const setError = (field, message) => {
    // textContent (not innerHTML) so user input can never inject HTML
    document.getElementById(field.id + "-error").textContent = message;
    field.setAttribute("aria-invalid", message ? "true" : "false");
  };

  const validateForm = () => {
    const f = form.elements;
    const checks = [
      [f.name, f.name.value.trim().length < 2 ? "Enter your name (at least 2 characters)." : ""],
      [f.email, !emailPattern.test(f.email.value.trim()) ? "Enter a valid email, like name@example.com." : ""],
      [f.subject, f.subject.value === "" ? "Choose what this is about." : ""],
      [f.message, f.message.value.trim().length < 10 ? "Write a message of at least 10 characters." : ""],
    ];
    let firstBad = null;
    checks.forEach(([field, msg]) => {
      setError(field, msg);
      if (msg && !firstBad) firstBad = field;
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    statusEl.textContent = "";
    if (!validateForm()) return;
    statusEl.textContent = `Thanks, ${form.elements.name.value.trim()}! Your message is ready (this demo does not send it).`;
    form.reset();
  });
}

/* ===== 4. Project filter by category ===== */
const filterBtns = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");
const countEl = document.getElementById("project-count");

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const category = btn.dataset.filter;
    let shown = 0;
    projectCards.forEach((card) => {
      const show = category === "all" || card.dataset.category === category;
      card.classList.toggle("hidden", !show);
      if (show) shown++;
    });
    filterBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    // textContent (not innerHTML): no HTML is ever built from strings
    if (countEl) countEl.textContent = `Showing ${shown} of ${projectCards.length} projects`;
  });
});

/* ===== 5. Footer year (if present) ===== */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();