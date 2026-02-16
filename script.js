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

function bindSkillsCarousel() {
  const carousel = document.getElementById("skillsCarousel");
  const viewport = document.getElementById("skillsViewport");
  const track = document.getElementById("skillsGrid");
  const prevButton = document.getElementById("skillsPrev");
  const nextButton = document.getElementById("skillsNext");
  const dotsRoot = document.getElementById("skillsDots");

  if (!carousel || !viewport || !track || !prevButton || !nextButton || !dotsRoot) {
    return;
  }

  let currentPage = 0;
  let isScrollTicking = false;

  function normalizePageIndex(pageIndex, pageCount) {
    if (pageCount <= 1) {
      return 0;
    }
    return ((pageIndex % pageCount) + pageCount) % pageCount;
  }

  function getCards() {
    return Array.from(track.querySelectorAll(":scope > .card"));
  }

  function getMetrics() {
    const cards = getCards();
    if (cards.length === 0) {
      return {
        pageCount: 1,
        visibleCount: 1,
        step: 0
      };
    }

    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
    const step = cards[0].getBoundingClientRect().width + gap;
    const visibleCount = Math.max(1, Math.floor((viewport.clientWidth + gap) / step));
    const pageCount = Math.max(1, Math.ceil(cards.length / visibleCount));

    return { pageCount, visibleCount, step };
  }

  function setActiveDot() {
    const dots = Array.from(dotsRoot.querySelectorAll(".skills-dot"));
    dots.forEach((dot, index) => {
      const isActive = index === currentPage;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  function renderDots(pageCount) {
    dotsRoot.innerHTML = "";

    for (let index = 0; index < pageCount; index += 1) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "skills-dot";
      dot.setAttribute("aria-label", `Go to skills slide ${index + 1}`);
      dot.addEventListener("click", () => {
        goToPage(index);
      });
      dotsRoot.appendChild(dot);
    }
  }

  function syncControls() {
    const { pageCount } = getMetrics();
    currentPage = normalizePageIndex(currentPage, pageCount);

    const singlePage = pageCount <= 1;
    carousel.classList.toggle("is-single-page", singlePage);
    dotsRoot.classList.toggle("is-hidden", singlePage);

    if (dotsRoot.childElementCount !== pageCount) {
      renderDots(pageCount);
    }

    prevButton.disabled = singlePage;
    nextButton.disabled = singlePage;
    setActiveDot();
  }

  function goToPage(pageIndex) {
    const { pageCount, visibleCount, step } = getMetrics();
    currentPage = normalizePageIndex(pageIndex, pageCount);

    const targetIndex = currentPage * visibleCount;
    const targetLeft = targetIndex * step;

    viewport.scrollTo({
      left: Number.isFinite(targetLeft) ? targetLeft : 0,
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });

    syncControls();
  }

  prevButton.addEventListener("click", () => {
    goToPage(currentPage - 1);
  });

  nextButton.addEventListener("click", () => {
    goToPage(currentPage + 1);
  });

  viewport.addEventListener(
    "scroll",
    () => {
      if (isScrollTicking) {
        return;
      }
      isScrollTicking = true;

      window.requestAnimationFrame(() => {
        const { pageCount, visibleCount, step } = getMetrics();

        if (step > 0) {
          const approximateItemIndex = viewport.scrollLeft / step;
          const approximatePage = Math.round(approximateItemIndex / visibleCount);
          currentPage = Math.max(0, Math.min(pageCount - 1, approximatePage));
        }

        syncControls();
        isScrollTicking = false;
      });
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    goToPage(currentPage);
  });

  document.addEventListener("skills:updated", () => {
    currentPage = 0;
    viewport.scrollTo({ left: 0, behavior: "auto" });
    syncControls();
  });

  syncControls();
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

bindSkillsCarousel();
bindSectionLinks();
applyInitialHashScroll();
