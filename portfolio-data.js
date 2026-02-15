import { supabaseConfig, supabaseReady } from "./supabase-config.js?v=20260215v12";
import {
  defaultPortfolioContent,
  normalizePortfolioContent
} from "./portfolio-content.js?v=20260215v12";

const CONTENT_TABLE = "portfolio_content";
const CONTENT_ROW_ID = 1;
const FETCH_TIMEOUT_MS = 12000;
const APP_BASE_PATH = new URL(".", import.meta.url).pathname;

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timerId = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    window.clearTimeout(timerId);
  }
}

function textById(id, value) {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }
  element.textContent = value;
}

function setLink(id, href, text, fallbackHref = "#") {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }
  element.href = href || fallbackHref;
  if (text) {
    element.textContent = text;
  }
}

function normalizeExternalHttps(url, fallback) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch (error) {
    // Ignore and return fallback.
  }
  return fallback;
}

function normalizeMailto(email, fallback) {
  const value = String(email || "").trim();
  if (value.includes("@")) {
    return `mailto:${value}`;
  }
  return fallback;
}

function normalizeTel(phone, fallback) {
  const value = String(phone || "").trim();
  if (value) {
    return `tel:${value.replace(/\s+/g, "")}`;
  }
  return fallback;
}

function normalizeLocalPath(path, fallback) {
  const value = String(path || "").trim() || String(fallback || "").trim();
  if (!value) {
    return fallback;
  }
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return encodeURI(value);
  }

  const relativePath = encodeURI(value.replace(/^\/+/, ""));
  return `${APP_BASE_PATH}${relativePath}`;
}

function createCard(title, body, meta = "") {
  const article = document.createElement("article");
  article.className = "card";

  const heading = document.createElement("h3");
  heading.textContent = title;
  article.appendChild(heading);

  if (meta) {
    const metaText = document.createElement("p");
    metaText.className = "meta";
    metaText.textContent = meta;
    article.appendChild(metaText);
  }

  if (body) {
    const paragraph = document.createElement("p");
    paragraph.textContent = body;
    article.appendChild(paragraph);
  }

  return article;
}

function renderStats(stats) {
  const grid = document.getElementById("statsGrid");
  if (!grid) {
    return;
  }
  grid.innerHTML = "";

  stats.forEach((item) => {
    const article = document.createElement("article");
    article.className = "card";

    const value = document.createElement("h2");
    value.textContent = item.value;

    const label = document.createElement("p");
    label.textContent = item.label;

    article.appendChild(value);
    article.appendChild(label);
    grid.appendChild(article);
  });
}

function renderExperience(experience) {
  textById("experienceRole", experience.role);
  textById("experienceMeta", experience.meta);

  const list = document.getElementById("experienceBullets");
  if (!list) {
    return;
  }
  list.innerHTML = "";
  experience.bullets.forEach((bullet) => {
    const item = document.createElement("li");
    item.textContent = bullet;
    list.appendChild(item);
  });
}

function renderSkills(skills) {
  const grid = document.getElementById("skillsGrid");
  if (!grid) {
    return;
  }
  grid.innerHTML = "";
  skills.forEach((skill) => {
    grid.appendChild(createCard(skill.title, skill.description));
  });
}

function renderProjects(projects) {
  const grid = document.getElementById("projectsGrid");
  if (!grid) {
    return;
  }
  grid.innerHTML = "";
  projects.forEach((project) => {
    grid.appendChild(createCard(project.title, project.description, project.tech));
  });
}

function renderEducation(education) {
  const wrapper = document.getElementById("educationGrid");
  if (!wrapper) {
    return;
  }
  wrapper.innerHTML = "";

  education.forEach((item) => {
    const card = createCard(item.title, item.detail, item.meta);
    wrapper.appendChild(card);
  });
}

function renderSimpleLines(cardId, lines) {
  const card = document.getElementById(cardId);
  if (!card) {
    return;
  }
  card.innerHTML = "";
  lines.forEach((line) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = line;
    card.appendChild(paragraph);
  });
}

function renderSectionTitles(sectionTitles) {
  textById("experienceHeading", sectionTitles.experience);
  textById("skillsHeading", sectionTitles.skills);
  textById("projectsHeading", sectionTitles.projects);
  textById("educationHeading", sectionTitles.education);
  textById("certificationsHeading", sectionTitles.certifications);
  textById("profileHeading", sectionTitles.profile);

  textById("navExperience", sectionTitles.experience);
  textById("navSkills", sectionTitles.skills);
  textById("navProjects", sectionTitles.projects);
  textById("navEducation", sectionTitles.education);
}

function renderCustomSections(customSections) {
  const root = document.getElementById("customSectionsRoot");
  if (!root) {
    return;
  }

  root.innerHTML = "";

  customSections.forEach((section) => {
    const sectionElement = document.createElement("section");
    sectionElement.className = "section";

    const heading = document.createElement("h2");
    heading.textContent = section.title;
    sectionElement.appendChild(heading);

    const card = document.createElement("article");
    card.className = "card";

    section.lines.forEach((line) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = line;
      card.appendChild(paragraph);
    });

    sectionElement.appendChild(card);
    root.appendChild(sectionElement);
  });
}

function renderPortfolioContent(content) {
  const normalized = normalizePortfolioContent(content);
  const profile = normalized.profile;

  textById("brandName", profile.name);
  textById("heroRole", profile.role);
  textById("heroHeadline", profile.headline);
  textById("heroSummary", profile.summary);
  textById("contactLocation", profile.location);
  textById("footerName", profile.name);

  const mailto = normalizeMailto(profile.email, "mailto:adarshmalayath@gmail.com");
  const tel = normalizeTel(profile.phone, "tel:+447721445027");
  const linkedin = normalizeExternalHttps(profile.linkedin, "https://linkedin.com/in/adarshmalayath");
  const github = normalizeExternalHttps(profile.github, "https://github.com/adarshmalayath");
  const cv = normalizeLocalPath(profile.cvUrl, "CV IT.pdf");

  setLink("contactEmailButton", mailto);
  setLink("contactEmail", mailto, profile.email || "adarshmalayath@gmail.com");
  setLink("contactPhone", tel, profile.phone || "+44 7721 445027");
  setLink("contactLinkedin", linkedin, "LinkedIn");
  setLink("contactGithub", github, "GitHub");
  setLink("cvButton", cv, "View CV");

  renderStats(normalized.stats);
  renderExperience(normalized.experience);
  renderSkills(normalized.skills);
  renderProjects(normalized.projects);
  renderEducation(normalized.education);
  renderSimpleLines("certificationsCard", normalized.certifications);
  renderSimpleLines("profileCard", normalized.profileDetails);
  renderSectionTitles(normalized.sectionTitles);
  renderCustomSections(normalized.customSections);
}

async function fetchRemotePortfolio() {
  if (!supabaseReady) {
    return defaultPortfolioContent;
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const endpoint =
      `${supabaseConfig.url}/rest/v1/${CONTENT_TABLE}` +
      `?id=eq.${CONTENT_ROW_ID}&select=content,updated_at&_=${Date.now()}`;

    try {
      const response = await fetchWithTimeout(
        endpoint,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            apikey: supabaseConfig.anonKey,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Accept: "application/json"
          }
        },
        FETCH_TIMEOUT_MS
      );

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`SQL read failed (${response.status}): ${body}`);
      }

      const rows = await response.json();
      if (!Array.isArray(rows) || rows.length === 0 || !rows[0].content) {
        return defaultPortfolioContent;
      }

      return rows[0].content;
    } catch (error) {
      if (attempt === 1) {
        console.warn("SQL content fetch failed; using local default.", error);
        return defaultPortfolioContent;
      }
      await wait(900);
    }
  }

  return defaultPortfolioContent;
}

async function initPortfolio() {
  const content = await fetchRemotePortfolio();
  renderPortfolioContent(content);
}

initPortfolio();
