const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Burbujas del hero: tamaños, posiciones y velocidades aleatorias
const bubblesEl = document.getElementById("bubbles");

if (bubblesEl && !reduceMotion) {
  // Chrome y Edge admiten filtros SVG en backdrop-filter, que dan el efecto lupa
  if (window.chrome) document.documentElement.classList.add("lens-ok");

  const small = window.innerWidth < 600;
  const count = small ? 9 : 16;
  const rise = bubblesEl.parentElement.offsetHeight + 120;
  const rand = (min, max) => min + Math.random() * (max - min);

  for (let i = 0; i < count; i++) {
    // Más burbujas medianas que grandes, como en la realidad
    const size = Math.round(small ? rand(26, 80) : rand(30, 60) * (Math.random() < 0.35 ? 2 : 1));
    const dur = rand(11, 22);
    const bubble = document.createElement("span");
    bubble.className = size >= 55 ? "bubble is-big" : "bubble";
    bubble.style.setProperty("--size", `${size}px`);
    bubble.style.setProperty("--x", `${rand(-2, 96)}%`);
    bubble.style.setProperty("--dur", `${dur}s`);
    // Retraso negativo para que al cargar ya haya burbujas a medio camino
    bubble.style.setProperty("--delay", `${-rand(0, dur)}s`);
    bubble.style.setProperty("--rise", `${rise}px`);
    bubble.style.setProperty("--sway", `${rand(8, 26)}px`);
    bubble.style.setProperty("--sway-dur", `${rand(2.5, 5)}s`);
    bubble.style.setProperty("--spin-dur", `${rand(6, 14)}s`);
    bubble.innerHTML = '<span class="bubble-body"></span>';
    bubblesEl.appendChild(bubble);
  }
}

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
