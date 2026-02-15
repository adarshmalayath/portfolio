import { createClient } from "https://esm.sh/@supabase/supabase-js@2?bundle";
import {
  defaultPortfolioContent,
  normalizePortfolioContent
} from "./portfolio-content.js";
import {
  supabaseAdmin,
  supabaseConfig,
  supabaseReady
} from "./supabase-config.js?v=20260215";

const TABLE = "portfolio_content";
const ROW_ID = 1;

const statusBox = document.getElementById("status");
const loginPanel = document.getElementById("loginPanel");
const editorPanel = document.getElementById("editorPanel");
const userText = document.getElementById("userText");

const googleLoginBtn = document.getElementById("googleLoginBtn");
const signOutBtn = document.getElementById("signOutBtn");
const loadBtn = document.getElementById("loadBtn");
const resetBtn = document.getElementById("resetBtn");
const saveBtn = document.getElementById("saveBtn");

let supabase = null;
let currentUser = null;

function setStatus(type, message) {
  statusBox.className = `status ${type}`;
  statusBox.textContent = message;
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
          <p class="back-link"><a href="index.html">Back to Portfolio</a></p>
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
    profileDetails: linesToArray(inputValue("profileDetailsInput"))
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

  fillStats(normalized.stats);
  setInputValue("experienceRoleInput", normalized.experience.role);
  setInputValue("experienceMetaInput", normalized.experience.meta);
  setInputValue("experienceBulletsInput", arrayToLines(normalized.experience.bullets));
  fillSkills(normalized.skills);
  fillProjects(normalized.projects);
  fillEducation(normalized.education);
  setInputValue("certificationsInput", arrayToLines(normalized.certifications));
  setInputValue("profileDetailsInput", arrayToLines(normalized.profileDetails));
}

async function loadFromDatabase() {
  setStatus("info", "Loading content from SQL database...");

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", ROW_ID)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || !data.content) {
    fillForm(defaultPortfolioContent);
    setStatus("warn", "No SQL row found yet. Loaded default template.");
    return;
  }

  fillForm(data.content);
  const updatedAt = data.updated_at ? new Date(data.updated_at).toLocaleString() : "unknown";
  setStatus("ok", `Loaded latest content from SQL (updated: ${updatedAt}).`);
}

async function saveToDatabase() {
  const content = collectContentFromForm();
  const payload = {
    id: ROW_ID,
    content
  };

  const { error } = await supabase.from(TABLE).upsert(payload, { onConflict: "id" });
  if (error) {
    throw new Error(error.message);
  }

  setStatus("ok", "Saved to SQL database successfully.");
}

async function handleSession(session) {
  const user = session?.user || null;

  if (!user) {
    currentUser = null;
    setEditorView(false);
    userText.textContent = "";
    setStatus("info", "Private page. Sign in with your admin Google account.");
    return;
  }

  if (!isAllowedUser(user)) {
    await supabase.auth.signOut();
    setStatus("error", "This account is not authorized.");
    lockDownPage("This route is private.");
    return;
  }

  currentUser = user;
  setEditorView(true);
  userText.textContent = `Signed in as ${user.email || user.id}`;
  try {
    await loadFromDatabase();
  } catch (error) {
    setStatus("error", `Could not load from SQL: ${error.message}`);
  }
}

function bindUi() {
  googleLoginBtn.addEventListener("click", async () => {
    try {
      setStatus("info", "Redirecting to Google sign-in...");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.href
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
      setStatus("error", `Reload failed: ${error.message}`);
    }
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
      setStatus("error", `Save failed: ${error.message}`);
    } finally {
      saveBtn.disabled = false;
    }
  });
}

async function initAdmin() {
  fillForm(defaultPortfolioContent);
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
  await handleSession(session);

  supabase.auth.onAuthStateChange(async (_event, sessionUpdate) => {
    await handleSession(sessionUpdate);
  });
}

initAdmin().catch((error) => {
  console.error(error);
  setStatus("error", `Initialization failed: ${error.message}`);
});
