const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Aparecer y desaparecer al hacer scroll
const revealItems = document.querySelectorAll(".reveal");

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((el) => el.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  revealItems.forEach((el) => revealObserver.observe(el));
}

// Barra de progreso, parallax de las bandas de fotos y del hero
const progress = document.getElementById("scroll-progress");
const bands = document.querySelectorAll(".band img");
const heroImg = document.querySelector(".hero-bg img");
let ticking = false;

function onScroll() {
  const scrollTop = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollTop / max : 0})`;

  if (!reduceMotion) {
    const vh = window.innerHeight;
    bands.forEach((img) => {
      const rect = img.parentElement.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      const offset = (rect.top + rect.height / 2 - vh / 2) * -0.18;
      img.style.transform = `translate3d(0, ${offset}px, 0)`;
    });

    if (heroImg && scrollTop < vh) {
      heroImg.parentElement.style.transform = `translate3d(0, ${scrollTop * 0.3}px, 0)`;
    }
  }
  ticking = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  },
  { passive: true }
);
window.addEventListener("resize", onScroll);
onScroll();

// Marcar en el menú la sección visible
const navLinks = [...document.querySelectorAll(".nav a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        navLinks.forEach((link) => {
          const active = link.getAttribute("href") === id;
          link.classList.toggle("is-active", active);
          // Desplaza solo el menú en horizontal; scrollIntoView movería también la página
          if (active) {
            const nav = link.parentElement;
            nav.scrollTo({ left: link.offsetLeft - (nav.clientWidth - link.clientWidth) / 2, behavior: "smooth" });
          }
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((section) => spy.observe(section));
}
