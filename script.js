const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

function getCleanPortfolioPath() {
  const withoutIndex = window.location.pathname.replace(/\/index\.html$/, "");
  if (!withoutIndex || withoutIndex === "/") {
    return "/";
  }
  return withoutIndex.endsWith("/") ? withoutIndex.slice(0, -1) : withoutIndex;
}

function keepCleanUrl() {
  const cleanPath = getCleanPortfolioPath();
  const needsUpdate = window.location.pathname !== cleanPath || window.location.hash;
  if (needsUpdate) {
    window.history.replaceState(null, "", cleanPath);
  }
}

function bindSectionLinks() {
  const links = Array.from(document.querySelectorAll('a[href^="#"]'));
  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetSelector = link.getAttribute("href");
      if (!targetSelector || targetSelector === "#") {
        return;
      }

      const target = document.querySelector(targetSelector);
      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start"
      });
      keepCleanUrl();
    });
  });
}

function applyInitialHashScroll() {
  const targetSelector = window.location.hash;
  if (!targetSelector) {
    keepCleanUrl();
    return;
  }

  const target = document.querySelector(targetSelector);
  if (target) {
    target.scrollIntoView({ behavior: "auto", block: "start" });
  }
  keepCleanUrl();
}

const revealElements = Array.from(document.querySelectorAll(".reveal"));

if (prefersReducedMotion) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  revealElements.forEach((element, index) => {
    const delay = (index % 6) * 60;
    element.style.setProperty("--reveal-delay", `${delay}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -20px 0px" }
  );

  revealElements.forEach((element) => observer.observe(element));
}

bindSectionLinks();
applyInitialHashScroll();
