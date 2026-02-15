import { createClient } from "https://esm.sh/@supabase/supabase-js@2?bundle";
import {
  defaultPortfolioContent,
  normalizePortfolioContent
} from "./portfolio-content.js?v=20260215v14";
import {
  supabaseAdmin,
  supabaseConfig,
  supabaseReady
} from "./supabase-config.js?v=20260215v14";

const TABLE = "portfolio_content";
const ROW_ID = 1;
const QUERY_TIMEOUT_MS = 12000;
const SAVE_QUERY_TIMEOUT_MS = 18000;

const statusBox = document.getElementById("status");
const loginPanel = document.getElementById("loginPanel");
const editorPanel = document.getElementById("editorPanel");
const userText = document.getElementById("userText");

const googleLoginBtn = document.getElementById("googleLoginBtn");
const signOutBtn = document.getElementById("signOutBtn");
const loadBtn = document.getElementById("loadBtn");
const resetBtn = document.getElementById("resetBtn");
const saveBtn = document.getElementById("saveBtn");
const customSectionsContainer = document.getElementById("customSectionsContainer");
const addCustomSectionBtn = document.getElementById("addCustomSectionBtn");

const SECTION_TITLE_INPUTS = {
  experience: "sectionTitleExperience",
  skills: "sectionTitleSkills",
  projects: "sectionTitleProjects",
  education: "sectionTitleEducation",
  certifications: "sectionTitleCertifications",
  profile: "sectionTitleProfile"
};

let supabase = null;
let currentUser = null;
let customSectionCounter = 0;
let keepAliveTimer = null;
let lastSavedSnapshot = "";
let loadedUserId = "";
let loadRequestSequence = 0;

function getAdminRedirectUrl() {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  return url.toString();
}

function setStatus(type, message) {
  statusBox.className = `status ${type}`;
  statusBox.textContent = message;
}

function withTimeout(promise, timeoutMs, label) {
  let timerId = 0;
  const timeoutPromise = new Promise((_resolve, reject) => {
    timerId = window.setTimeout(() => {
      reject(new Error(`${label} timed out after ${Math.round(timeoutMs / 1000)}s`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timerId) {
      window.clearTimeout(timerId);
    }
  });
}

async function withRetry(action, retries = 1, pauseMs = 700) {
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        throw error;
      }
      await new Promise((resolve) => {
        window.setTimeout(resolve, pauseMs);
      });
    }
  }
  throw lastError || new Error("Unknown retry failure");
}

function enrichDatabaseError(error) {
  const message = String(error?.message || error || "Unknown database error");
  const lower = message.toLowerCase();

  if (lower.includes("timed out")) {
    return `${message}. Supabase free-tier may be cold. Retry once after 10-20 seconds.`;
  }

  if (
    lower.includes("row-level security") ||
    lower.includes("permission denied") ||
    lower.includes("forbidden")
  ) {
    return `${message}. SQL policy is blocking writes for this account. Update RLS policy to allow your Google email.`;
  }

  return message;
}

function contentSnapshot(content) {
  return JSON.stringify(normalizePortfolioContent(content));
}

function stopKeepAlive() {
  if (keepAliveTimer) {
    window.clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

async function pingDatabase() {
  if (!supabase || !currentUser) {
    return;
  }

  await withTimeout(
    supabase.from(TABLE).select("id").eq("id", ROW_ID).limit(1),
    5000,
    "Keep-alive"
  );
}

function startKeepAlive() {
  stopKeepAlive();
  pingDatabase().catch(() => {
    // Ignore keep-alive warm-up failures.
  });
  keepAliveTimer = window.setInterval(() => {
    pingDatabase().catch(() => {
      // Silent keep-alive ping to reduce free-tier wake-up delays.
    });
  }, 120000);
}

function setEditorView(isAuthenticated) {
  loginPanel.classList.toggle("hidden", isAuthenticated);
  editorPanel.classList.toggle("hidden", !isAuthenticated);
}

function lockDownPage(message) {
  document.body.innerHTML = `
    <main class="admin-shell">
      <section class="panel">
        <header class="panel-header">
          <p class="eyebrow">Access Restricted</p>
          <h1>404</h1>
          <p class="subtext">${message}</p>
          <p class="back-link"><a href="/portfolio">Back to Portfolio</a></p>
        </header>
      </section>
    </main>
  `;
}

function inputValue(id, fallback = "") {
  const element = document.getElementById(id);
  return element ? element.value.trim() || fallback : fallback;
}

function setInputValue(id, value = "") {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }
  element.value = value;
}

function linesToArray(value) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function arrayToLines(value) {
  return Array.isArray(value) ? value.join("\n") : "";
}

function getSectionTitlesFromForm() {
  return {
    experience: inputValue(
      SECTION_TITLE_INPUTS.experience,
      defaultPortfolioContent.sectionTitles.experience
    ),
    skills: inputValue(SECTION_TITLE_INPUTS.skills, defaultPortfolioContent.sectionTitles.skills),
    projects: inputValue(
      SECTION_TITLE_INPUTS.projects,
      defaultPortfolioContent.sectionTitles.projects
    ),
    education: inputValue(
      SECTION_TITLE_INPUTS.education,
      defaultPortfolioContent.sectionTitles.education
    ),
    certifications: inputValue(
      SECTION_TITLE_INPUTS.certifications,
      defaultPortfolioContent.sectionTitles.certifications
    ),
    profile: inputValue(
      SECTION_TITLE_INPUTS.profile,
      defaultPortfolioContent.sectionTitles.profile
    )
  };
}

function fillSectionTitles(sectionTitles) {
  setInputValue(
    SECTION_TITLE_INPUTS.experience,
    sectionTitles.experience || defaultPortfolioContent.sectionTitles.experience
  );
  setInputValue(
    SECTION_TITLE_INPUTS.skills,
    sectionTitles.skills || defaultPortfolioContent.sectionTitles.skills
  );
  setInputValue(
    SECTION_TITLE_INPUTS.projects,
    sectionTitles.projects || defaultPortfolioContent.sectionTitles.projects
  );
  setInputValue(
    SECTION_TITLE_INPUTS.education,
    sectionTitles.education || defaultPortfolioContent.sectionTitles.education
  );
  setInputValue(
    SECTION_TITLE_INPUTS.certifications,
    sectionTitles.certifications || defaultPortfolioContent.sectionTitles.certifications
  );
  setInputValue(
    SECTION_TITLE_INPUTS.profile,
    sectionTitles.profile || defaultPortfolioContent.sectionTitles.profile
  );
}

function bindSectionTitleToggles() {
  const toggles = Array.from(document.querySelectorAll(".section-title-toggle"));
  toggles.forEach((toggle) => {
    const targetId = toggle.getAttribute("data-target");
    if (!targetId) {
      return;
    }

    const wrapper = document.getElementById(targetId);
    if (!wrapper) {
      return;
    }

    toggle.addEventListener("click", () => {
      const isHidden = wrapper.classList.contains("hidden");
      wrapper.classList.toggle("hidden", !isHidden);
      toggle.setAttribute("aria-expanded", String(isHidden));
      if (isHidden) {
        const input = wrapper.querySelector("input");
        if (input) {
          input.focus();
          input.select();
        }
      }
    });
  });
}

function refreshCustomSectionOrder() {
  if (!customSectionsContainer) {
    return;
  }

  const editors = customSectionsContainer.querySelectorAll(".custom-section-editor");
  editors.forEach((editor, index) => {
    const heading = editor.querySelector(".custom-section-heading");
    if (heading) {
      heading.textContent = `Custom Section ${index + 1}`;
    }
  });
}

function updateCustomSectionsEmptyState() {
  if (!customSectionsContainer) {
    return;
  }

  const editorCount = customSectionsContainer.querySelectorAll(".custom-section-editor").length;
  const existingNote = customSectionsContainer.querySelector(".empty-custom-note");

  if (editorCount === 0) {
    if (!existingNote) {
      const note = document.createElement("p");
      note.className = "empty-custom-note";
      note.textContent = "No custom sections yet. Click Add Section to create one.";
      customSectionsContainer.appendChild(note);
    }
    return;
  }

  if (existingNote) {
    existingNote.remove();
  }
}

function createCustomSectionEditor(section = { title: "", lines: [] }) {
  customSectionCounter += 1;
  const suffix = String(customSectionCounter);

  const wrapper = document.createElement("article");
  wrapper.className = "custom-section-editor";

  const row = document.createElement("div");
  row.className = "custom-section-row";

  const heading = document.createElement("h3");
  heading.className = "custom-section-heading";
  heading.textContent = "Custom Section";

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "btn btn-ghost";
  removeBtn.textContent = "Remove";
  removeBtn.addEventListener("click", () => {
    wrapper.remove();
    refreshCustomSectionOrder();
    updateCustomSectionsEmptyState();
  });

  row.appendChild(heading);
  row.appendChild(removeBtn);
  wrapper.appendChild(row);

  const grid = document.createElement("div");
  grid.className = "form-grid";

  const titleLabel = document.createElement("label");
  titleLabel.setAttribute("for", `customSectionTitle${suffix}`);
  titleLabel.textContent = "Section Title";

  const titleInput = document.createElement("input");
  titleInput.id = `customSectionTitle${suffix}`;
  titleInput.className = "custom-section-title-input";
  titleInput.type = "text";
  titleInput.value = String(section.title || "");

  const linesLabel = document.createElement("label");
  linesLabel.setAttribute("for", `customSectionLines${suffix}`);
  linesLabel.textContent = "Lines (one item per line)";

  const linesInput = document.createElement("textarea");
  linesInput.id = `customSectionLines${suffix}`;
  linesInput.className = "custom-section-lines-input";
  linesInput.rows = 5;
  linesInput.value = arrayToLines(section.lines);

  grid.appendChild(titleLabel);
  grid.appendChild(titleInput);
  grid.appendChild(linesLabel);
  grid.appendChild(linesInput);
  wrapper.appendChild(grid);

  return wrapper;
}

function addCustomSectionEditor(section = { title: "", lines: [] }) {
  if (!customSectionsContainer) {
    return;
  }

  const editor = createCustomSectionEditor(section);
  customSectionsContainer.appendChild(editor);
  refreshCustomSectionOrder();
  updateCustomSectionsEmptyState();
}

function fillCustomSections(customSections) {
  if (!customSectionsContainer) {
    return;
  }

  customSectionsContainer.innerHTML = "";
  customSectionCounter = 0;

  customSections.forEach((section) => addCustomSectionEditor(section));
  updateCustomSectionsEmptyState();
}

function getCustomSectionsFromForm() {
  if (!customSectionsContainer) {
    return [];
  }

  const editors = customSectionsContainer.querySelectorAll(".custom-section-editor");
  const sections = [];

  editors.forEach((editor) => {
    const title = String(
      editor.querySelector(".custom-section-title-input")?.value || ""
    ).trim();
    const lines = linesToArray(editor.querySelector(".custom-section-lines-input")?.value || "");

    if (title && lines.length > 0) {
      sections.push({ title, lines });
    }
  });

  return sections;
}

function isAllowedUser(user) {
  if (!user) {
    return false;
  }

  const email = String(user.email || "").toLowerCase();
  const id = String(user.id || "");
  const allowedEmails = Array.isArray(supabaseAdmin.allowedEmails)
    ? supabaseAdmin.allowedEmails.map((item) => item.toLowerCase())
    : [];
  const allowedIds = Array.isArray(supabaseAdmin.allowedIds) ? supabaseAdmin.allowedIds : [];

  return allowedEmails.includes(email) || allowedIds.includes(id);
}

function authHint(errorCode) {
  const hints = {
    access_denied:
      "Google sign-in was denied. Make sure your admin Google account is selected.",
    unauthorized_domain:
      "Add adarshmalayath.github.io in Supabase Authentication URL configuration.",
    invalid_request:
      "Check Supabase Google provider config and redirect URL."
  };
  return hints[errorCode] || "Check Supabase Auth provider configuration.";
}

function getStatsFromForm() {
  const stats = [];
  for (let i = 0; i < 4; i += 1) {
    const value = inputValue(`stat${i}Value`);
    const label = inputValue(`stat${i}Label`);
    if (value && label) {
      stats.push({ value, label });
    }
  }
  return stats;
}

function getSkillsFromForm() {
  const skills = [];
  for (let i = 0; i < 6; i += 1) {
    const title = inputValue(`skill${i}Title`);
    const description = inputValue(`skill${i}Description`);
    if (title && description) {
      skills.push({ title, description });
    }
  }
  return skills;
}

function getProjectsFromForm() {
  const projects = [];
  for (let i = 0; i < 4; i += 1) {
    const title = inputValue(`project${i}Title`);
    const tech = inputValue(`project${i}Tech`);
    const description = inputValue(`project${i}Description`);
    if (title && description) {
      projects.push({ title, tech, description });
    }
  }
  return projects;
}

function getEducationFromForm() {
  const education = [];
  for (let i = 0; i < 2; i += 1) {
    const title = inputValue(`education${i}Title`);
    const meta = inputValue(`education${i}Meta`);
    const detail = inputValue(`education${i}Detail`);
    if (title && meta) {
      education.push({ title, meta, detail });
    }
  }
  return education;
}

function collectContentFromForm() {
  const raw = {
    profile: {
      name: inputValue("profileName"),
      role: inputValue("profileRole"),
      headline: inputValue("profileHeadline"),
      summary: inputValue("profileSummary"),
      location: inputValue("profileLocation"),
      email: inputValue("profileEmail"),
      phone: inputValue("profilePhone"),
      linkedin: inputValue("profileLinkedin"),
      github: inputValue("profileGithub"),
      cvUrl: inputValue("profileCvUrl")
    },
    stats: getStatsFromForm(),
    experience: {
      role: inputValue("experienceRoleInput"),
      meta: inputValue("experienceMetaInput"),
      bullets: linesToArray(inputValue("experienceBulletsInput"))
    },
    skills: getSkillsFromForm(),
    projects: getProjectsFromForm(),
    education: getEducationFromForm(),
    certifications: linesToArray(inputValue("certificationsInput")),
    profileDetails: linesToArray(inputValue("profileDetailsInput")),
    sectionTitles: getSectionTitlesFromForm(),
    customSections: getCustomSectionsFromForm()
  };

  return normalizePortfolioContent(raw);
}

function fillStats(stats) {
  for (let i = 0; i < 4; i += 1) {
    setInputValue(`stat${i}Value`, stats[i]?.value || "");
    setInputValue(`stat${i}Label`, stats[i]?.label || "");
  }
}

function fillSkills(skills) {
  for (let i = 0; i < 6; i += 1) {
    setInputValue(`skill${i}Title`, skills[i]?.title || "");
    setInputValue(`skill${i}Description`, skills[i]?.description || "");
  }
}

function fillProjects(projects) {
  for (let i = 0; i < 4; i += 1) {
    setInputValue(`project${i}Title`, projects[i]?.title || "");
    setInputValue(`project${i}Tech`, projects[i]?.tech || "");
    setInputValue(`project${i}Description`, projects[i]?.description || "");
  }
}

function fillEducation(education) {
  for (let i = 0; i < 2; i += 1) {
    setInputValue(`education${i}Title`, education[i]?.title || "");
    setInputValue(`education${i}Meta`, education[i]?.meta || "");
    setInputValue(`education${i}Detail`, education[i]?.detail || "");
  }
}

function fillForm(content) {
  const normalized = normalizePortfolioContent(content);

  setInputValue("profileName", normalized.profile.name);
  setInputValue("profileRole", normalized.profile.role);
  setInputValue("profileHeadline", normalized.profile.headline);
  setInputValue("profileSummary", normalized.profile.summary);
  setInputValue("profileLocation", normalized.profile.location);
  setInputValue("profileEmail", normalized.profile.email);
  setInputValue("profilePhone", normalized.profile.phone);
  setInputValue("profileLinkedin", normalized.profile.linkedin);
  setInputValue("profileGithub", normalized.profile.github);
  setInputValue("profileCvUrl", normalized.profile.cvUrl);
  fillSectionTitles(normalized.sectionTitles);

  fillStats(normalized.stats);
  setInputValue("experienceRoleInput", normalized.experience.role);
  setInputValue("experienceMetaInput", normalized.experience.meta);
  setInputValue("experienceBulletsInput", arrayToLines(normalized.experience.bullets));
  fillSkills(normalized.skills);
  fillProjects(normalized.projects);
  fillEducation(normalized.education);
  setInputValue("certificationsInput", arrayToLines(normalized.certifications));
  setInputValue("profileDetailsInput", arrayToLines(normalized.profileDetails));
  fillCustomSections(normalized.customSections);
}

async function loadFromDatabase() {
  const requestId = ++loadRequestSequence;
  setStatus("info", "Loading content from SQL database (free-tier wake-up may take a few seconds)...");

  const { data, error } = await withRetry(
    () =>
      withTimeout(
        supabase.from(TABLE).select("content,updated_at").eq("id", ROW_ID).maybeSingle(),
        QUERY_TIMEOUT_MS,
        "SQL load"
      ),
    1,
    900
  );

  if (error) {
    throw new Error(error.message);
  }
  if (requestId !== loadRequestSequence) {
    return;
  }

  if (!data || !data.content) {
    fillForm(defaultPortfolioContent);
    lastSavedSnapshot = contentSnapshot(defaultPortfolioContent);
    setStatus("warn", "No SQL row found yet. Loaded default template.");
    return;
  }

  const normalized = normalizePortfolioContent(data.content);
  fillForm(normalized);
  lastSavedSnapshot = contentSnapshot(normalized);
  const updatedAt = data.updated_at ? new Date(data.updated_at).toLocaleString() : "unknown";
  setStatus("ok", `Loaded latest content from SQL (updated: ${updatedAt}).`);
}

async function saveToDatabase() {
  const content = collectContentFromForm();
  const snapshot = contentSnapshot(content);
  if (snapshot === lastSavedSnapshot) {
    setStatus("ok", "No changes to save.");
    return;
  }

  const startedAt = performance.now();
  const writePayload = {
    content
  };

  let updatedAt = "";

  const { data: updatedRow, error: updateError } = await withRetry(
    () =>
      withTimeout(
        supabase.from(TABLE).update(writePayload).eq("id", ROW_ID).select("updated_at").maybeSingle(),
        SAVE_QUERY_TIMEOUT_MS,
        "SQL save"
      ),
    1,
    900
  );

  if (updateError) {
    throw new Error(updateError.message);
  }

  if (!updatedRow) {
    const { data: rowCheck, error: rowCheckError } = await withTimeout(
      supabase.from(TABLE).select("id").eq("id", ROW_ID).maybeSingle(),
      QUERY_TIMEOUT_MS,
      "SQL row check"
    );

    if (rowCheckError) {
      throw new Error(rowCheckError.message);
    }

    if (rowCheck?.id) {
      throw new Error(
        "Write blocked by SQL policy for the signed-in user (row exists but cannot be updated)."
      );
    }

    const { data: insertedRow, error: insertError } = await withRetry(
      () =>
        withTimeout(
          supabase.from(TABLE).insert({ id: ROW_ID, ...writePayload }).select("updated_at").maybeSingle(),
          SAVE_QUERY_TIMEOUT_MS,
          "SQL insert"
        ),
      1,
      900
    );

    if (insertError) {
      throw new Error(insertError.message);
    }

    updatedAt = insertedRow?.updated_at || "";
  } else {
    updatedAt = updatedRow.updated_at || "";
  }

  lastSavedSnapshot = snapshot;
  const elapsedMs = Math.round(performance.now() - startedAt);
  const updatedText = updatedAt ? new Date(updatedAt).toLocaleTimeString() : "now";
  const perfHint = elapsedMs > 2500 ? " (free-tier wake-up can cause delay)" : "";
  setStatus("ok", `Saved in ${elapsedMs} ms at ${updatedText}${perfHint}.`);
}

async function handleSession(session, options = {}) {
  const forceLoad = Boolean(options.forceLoad);
  const user = session?.user || null;

  if (!user) {
    currentUser = null;
    stopKeepAlive();
    loadedUserId = "";
    setEditorView(false);
    userText.textContent = "";
    setStatus("info", "Private page. Sign in with your admin Google account.");
    return;
  }

  if (!isAllowedUser(user)) {
    await supabase.auth.signOut();
    stopKeepAlive();
    loadedUserId = "";
    const usedEmail = user.email || "unknown";
    setStatus(
      "error",
      `This Google account is not authorized: ${usedEmail}. Use adarshmalayath@gmail.com.`
    );
    setEditorView(false);
    userText.textContent = "";
    return;
  }

  const previousUserId = currentUser?.id || "";
  currentUser = user;
  startKeepAlive();
  setEditorView(true);
  userText.textContent = `Signed in as ${user.email || user.id}`;

  const shouldLoad = forceLoad || loadedUserId !== user.id || previousUserId !== user.id;
  if (!shouldLoad) {
    setStatus("ok", "Ready. Content loaded.");
    return;
  }

  try {
    await loadFromDatabase();
    loadedUserId = user.id;
  } catch (error) {
    setStatus("error", `Could not load from SQL: ${enrichDatabaseError(error)}`);
  }
}

function bindUi() {
  bindSectionTitleToggles();

  googleLoginBtn.addEventListener("click", async () => {
    try {
      setStatus("info", "Redirecting to Google sign-in...");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAdminRedirectUrl()
        }
      });
      if (error) {
        throw error;
      }
    } catch (error) {
      const code = error?.code || error?.name || "unknown";
      setStatus("error", `Google sign-in failed (${code}). ${authHint(code)}`);
    }
  });

  signOutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
  });

  loadBtn.addEventListener("click", async () => {
    try {
      await loadFromDatabase();
    } catch (error) {
      setStatus("error", `Reload failed: ${enrichDatabaseError(error)}`);
    }
  });

  addCustomSectionBtn.addEventListener("click", () => {
    addCustomSectionEditor();
  });

  resetBtn.addEventListener("click", () => {
    fillForm(defaultPortfolioContent);
    setStatus("warn", "Editor reset to defaults. Save to persist to SQL.");
  });

  saveBtn.addEventListener("click", async () => {
    saveBtn.disabled = true;
    try {
      setStatus("info", "Saving to SQL database...");
      await saveToDatabase();
    } catch (error) {
      setStatus("error", `Save failed: ${enrichDatabaseError(error)}`);
    } finally {
      saveBtn.disabled = false;
    }
  });
}

async function initAdmin() {
  fillForm(defaultPortfolioContent);
  lastSavedSnapshot = contentSnapshot(defaultPortfolioContent);
  if (!supabaseReady) {
    setStatus(
      "warn",
      "Supabase SQL is not configured. Set the anon public key in supabase-config.js (Supabase Dashboard -> Project Settings -> API)."
    );
    googleLoginBtn.disabled = true;
    setEditorView(false);
    return;
  }

  supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  bindUi();

  const {
    data: { session }
  } = await supabase.auth.getSession();
  await handleSession(session, { forceLoad: true });

  supabase.auth.onAuthStateChange(async (event, sessionUpdate) => {
    if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") {
      return;
    }
    await handleSession(sessionUpdate, { forceLoad: event === "SIGNED_IN" });
  });
}

initAdmin().catch((error) => {
  console.error(error);
  setStatus("error", `Initialization failed: ${enrichDatabaseError(error)}`);
});
