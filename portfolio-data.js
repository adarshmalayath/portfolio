import { supabaseConfig, supabaseReady } from "./supabase-config.js?v=20260215v23";
import {
  normalizePortfolioContent
} from "./portfolio-content.js?v=20260215v23";

const CONTENT_TABLE = "portfolio_content";
const CONTENT_ROW_ID = 1;
const FETCH_TIMEOUT_MS = 30000;
const APP_BASE_PATH = new URL(".", import.meta.url).pathname;
const SKILL_ICON_BASE_PATH = `${APP_BASE_PATH}skill-icons/`;
const SKILL_ICON_MAP = {
  java: "java.svg",
  javascript: "javascript.svg",
  python: "python.svg",
  plsql: "plsql.svg",
  react: "react.svg",
  reactjs: "react.svg",
  html5: "html5.svg",
  css3: "css3.svg",
  bootstrap: "bootstrap.svg",
  spring: "spring.svg",
  springboot: "springboot.svg",
  oracle: "oracle.svg",
  sqlserver: "sqlserver.svg",
  mysql: "mysql.svg",
  git: "git.svg",
  intellijidea: "intellijidea.svg",
  vscode: "vscode.svg",
  servicenow: "servicenow.svg",
  jira: "jira.svg",
  obdx: "obdx.svg",
  bankingplatforms: "banking.svg",
  fraudrisk: "fraud.svg",
  apiintegration: "api.svg",
  compliance: "compliance.svg"
};
const PREFERRED_CV_URL = "https://adarshmalayath.github.io/portfolio/CV%20IT.pdf";
const CV_EDUCATION_ADDITIONS = [
  {
    title: "Higher Secondary Education (Plus Two)",
    meta: "Government Higher Secondary School Kuttippuram, India | Jul 2016 – Mar 2018",
    detail: "Percentage: 85.25%"
  },
  {
    title: "Secondary Education (10th)",
    meta: "Technical Higher Secondary School Vattamkulam, India | Jun 2015 – Mar 2016",
    detail: "Percentage: 95%"
  }
];

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

function normalizeCvUrl(path) {
  const value = String(path || "").trim();
  if (!value) {
    return PREFERRED_CV_URL;
  }

  if (
    value === "https://adarshmalayath.github.io/CV%20IT.pdf" ||
    value === "https://adarshmalayath.github.io/CV IT.pdf" ||
    value === "/CV%20IT.pdf" ||
    value === "/CV IT.pdf" ||
    value === "CV%20IT.pdf" ||
    value === "CV IT.pdf"
  ) {
    return PREFERRED_CV_URL;
  }

  const normalized = normalizeLocalPath(value, PREFERRED_CV_URL);
  if (
    normalized === "/CV%20IT.pdf" ||
    normalized === "/CV IT.pdf" ||
    normalized === "/portfolio/CV%20IT.pdf" ||
    normalized === "/portfolio/CV IT.pdf"
  ) {
    return PREFERRED_CV_URL;
  }

  return normalized;
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

function normalizeSkillToken(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\+/g, "plus")
    .replace(/[^a-z0-9]/g, "");
}

function getSkillItems(description) {
  return String(description || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getSkillIconPath(skillItem) {
  const key = normalizeSkillToken(skillItem);
  const iconFile = SKILL_ICON_MAP[key] || "generic.svg";
  return `${SKILL_ICON_BASE_PATH}${iconFile}`;
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
    const article = document.createElement("article");
    article.className = "card";

    const heading = document.createElement("h3");
    heading.textContent = skill.title;
    article.appendChild(heading);

    const items = getSkillItems(skill.description);
    if (items.length === 0) {
      const paragraph = document.createElement("p");
      paragraph.textContent = skill.description;
      article.appendChild(paragraph);
      grid.appendChild(article);
      return;
    }

    const list = document.createElement("ul");
    list.className = "skill-list";

    items.forEach((itemText) => {
      const row = document.createElement("li");
      row.className = "skill-list-item";

      const icon = document.createElement("img");
      icon.className = "skill-item-icon";
      icon.src = getSkillIconPath(itemText);
      icon.alt = `${itemText} logo`;
      icon.loading = "lazy";
      icon.decoding = "async";
      icon.addEventListener("error", () => {
        if (icon.src.endsWith("/generic.svg")) {
          return;
        }
        icon.src = `${SKILL_ICON_BASE_PATH}generic.svg`;
      });

      const text = document.createElement("span");
      text.textContent = itemText;

      row.appendChild(icon);
      row.appendChild(text);
      list.appendChild(row);
    });

    article.appendChild(list);
    grid.appendChild(article);
  });

  document.dispatchEvent(new CustomEvent("skills:updated"));
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

  const mergedEducation = [...education];
  const existingTitles = new Set(
    mergedEducation.map((item) => String(item?.title || "").trim().toLowerCase())
  );

  CV_EDUCATION_ADDITIONS.forEach((item) => {
    const key = String(item.title).trim().toLowerCase();
    if (!existingTitles.has(key)) {
      mergedEducation.push(item);
    }
  });

  mergedEducation.forEach((item) => {
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

function renderCertifications(certifications) {
  const wrapper = document.getElementById("certificationsGrid");
  if (!wrapper) {
    return;
  }

  wrapper.innerHTML = "";
  certifications.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card certification-card";

    const paragraph = document.createElement("p");
    paragraph.textContent = item;

    card.appendChild(paragraph);
    wrapper.appendChild(card);
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
  const cv = normalizeCvUrl(profile.cvUrl);

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
  renderCertifications(normalized.certifications);
  renderSimpleLines("profileCard", normalized.profileDetails);
  renderSectionTitles(normalized.sectionTitles);
  renderCustomSections(normalized.customSections);
}

function setSectionsVisible(isVisible) {
  const sections = document.querySelectorAll("main .stats, main .section, #customSectionsRoot");
  sections.forEach((element) => {
    element.style.display = isVisible ? "" : "none";
  });
}

function setHeroDetailsVisible(isVisible) {
  const actions = document.querySelector(".hero-actions");
  const contact = document.querySelector(".quick-contact");
  if (actions) {
    actions.style.display = isVisible ? "" : "none";
  }
  if (contact) {
    contact.style.display = isVisible ? "" : "none";
  }
}

function setLoadingState() {
  textById("brandName", "Portfolio");
  textById("heroRole", "Loading");
  textById("heroHeadline", "Loading portfolio data from database...");
  textById("heroSummary", "Please wait while the latest saved content is fetched.");
}

function setDatabaseErrorState(error) {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "Could not load saved portfolio data from database.";

  textById("brandName", "Portfolio");
  textById("heroRole", "Database Error");
  textById("heroHeadline", "Saved portfolio data could not be loaded.");
  textById("heroSummary", message);
}

async function fetchRemotePortfolio() {
  if (!supabaseReady) {
    throw new Error("Supabase is not configured. Update supabase-config.js.");
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const endpoint =
      `${supabaseConfig.url}/rest/v1/${CONTENT_TABLE}` +
      `?id=eq.${CONTENT_ROW_ID}&select=content,updated_at`;

    try {
      const response = await fetchWithTimeout(
        endpoint,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            apikey: supabaseConfig.anonKey,
            Authorization: `Bearer ${supabaseConfig.anonKey}`,
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
        throw new Error("No saved portfolio content found in database.");
      }

      return rows[0].content;
    } catch (error) {
      if (attempt === 2) {
        throw error;
      }
      const retryDelayMs = attempt === 0 ? 1400 : 2600;
      await wait(retryDelayMs);
    }
  }

  throw new Error("Could not load saved portfolio content from database.");
}

async function initPortfolio() {
  setHeroDetailsVisible(false);
  setSectionsVisible(false);
  setLoadingState();

  try {
    const content = await fetchRemotePortfolio();
    renderPortfolioContent(content);
    setHeroDetailsVisible(true);
    setSectionsVisible(true);
  } catch (error) {
    console.error("Portfolio load failed:", error);
    setDatabaseErrorState(error);
  }
}

initPortfolio();
