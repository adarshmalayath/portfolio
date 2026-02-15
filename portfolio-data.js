import { firebaseConfig, firebaseReady } from "./firebase-config.js";
import {
  defaultPortfolioContent,
  normalizePortfolioContent
} from "./portfolio-content.js";

const CONTENT_COLLECTION = "portfolio";
const CONTENT_DOC = "siteContent";

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
  const value = String(path || "").trim();
  if (!value) {
    return fallback;
  }
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return value.replace(/^\/+/, "");
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
  const cv = normalizeLocalPath(profile.cvUrl, "CV%20IT.pdf");

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
}

async function fetchRemotePortfolio() {
  if (!firebaseReady) {
    return defaultPortfolioContent;
  }

  try {
    const [{ initializeApp }, { getFirestore, doc, getDoc }] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js")
    ]);

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const ref = doc(db, CONTENT_COLLECTION, CONTENT_DOC);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) {
      return defaultPortfolioContent;
    }
    return snapshot.data();
  } catch (error) {
    console.warn("Portfolio content fallback to local default:", error);
    return defaultPortfolioContent;
  }
}

async function initPortfolio() {
  const content = await fetchRemotePortfolio();
  renderPortfolioContent(content);
}

initPortfolio();
