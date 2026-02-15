import { firebaseConfig, firebaseReady, adminAccess } from "./firebase-config.js";
import {
  defaultPortfolioContent,
  normalizePortfolioContent
} from "./portfolio-content.js";

const COLLECTION = "portfolio";
const DOC_ID = "siteContent";

const statusBox = document.getElementById("status");
const loginPanel = document.getElementById("loginPanel");
const editorPanel = document.getElementById("editorPanel");
const userText = document.getElementById("userText");
const editor = document.getElementById("contentEditor");

const loginEmailInput = document.getElementById("loginEmail");
const loginPasswordInput = document.getElementById("loginPassword");
const passwordLoginBtn = document.getElementById("passwordLoginBtn");
const signOutBtn = document.getElementById("signOutBtn");
const loadBtn = document.getElementById("loadBtn");
const resetBtn = document.getElementById("resetBtn");
const saveBtn = document.getElementById("saveBtn");

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

function prettyPrint(content) {
  return JSON.stringify(normalizePortfolioContent(content), null, 2);
}

function isAllowedUser(user) {
  if (!user) {
    return false;
  }
  const allowedEmails = Array.isArray(adminAccess.allowedEmails)
    ? adminAccess.allowedEmails.map((email) => email.toLowerCase())
    : [];
  const allowedUids = Array.isArray(adminAccess.allowedUids) ? adminAccess.allowedUids : [];
  const email = (user.email || "").toLowerCase();

  return allowedEmails.includes(email) || allowedUids.includes(user.uid);
}

if (!firebaseReady) {
  setStatus(
    "warn",
    "Firebase is not configured. Update firebase-config.js before using login and editing."
  );
  loginEmailInput.disabled = true;
  loginPasswordInput.disabled = true;
  passwordLoginBtn.disabled = true;
  editor.value = prettyPrint(defaultPortfolioContent);
  setEditorView(false);
} else {
  initAdmin().catch((error) => {
    console.error(error);
    setStatus("error", "Failed to initialize admin panel. Check console for details.");
  });
}

async function initAdmin() {
  const [
    { initializeApp },
    {
      getAuth,
      signInWithEmailAndPassword,
      signOut,
      onAuthStateChanged,
      setPersistence,
      browserSessionPersistence
    },
    { getFirestore, doc, getDoc, setDoc }
  ] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js")
  ]);

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const contentRef = doc(db, COLLECTION, DOC_ID);

  await setPersistence(auth, browserSessionPersistence);

  function authHint(errorCode) {
    const hints = {
      "auth/operation-not-allowed":
        "Enable Email/Password provider in Firebase Authentication -> Sign-in method.",
      "auth/invalid-login-credentials":
        "Invalid email or password.",
      "auth/invalid-email":
        "Invalid email address format.",
      "auth/user-disabled":
        "This account is disabled in Firebase Authentication.",
      "auth/too-many-requests":
        "Too many login attempts. Wait a bit and retry.",
      "auth/network-request-failed":
        "Network error. Check your connection and retry."
    };
    return hints[errorCode] || "Check browser console and Firebase Auth settings.";
  }

  async function loadContentIntoEditor() {
    setStatus("info", "Loading content from database...");
    const snapshot = await getDoc(contentRef);
    if (snapshot.exists()) {
      editor.value = prettyPrint(snapshot.data());
      setStatus("ok", "Loaded latest portfolio content.");
      return;
    }
    editor.value = prettyPrint(defaultPortfolioContent);
    setStatus("warn", "No content in Firestore yet. Loaded default template.");
  }

  async function saveEditorToFirestore() {
    let parsed;
    try {
      parsed = JSON.parse(editor.value);
    } catch (error) {
      setStatus("error", `Invalid JSON: ${error.message}`);
      return;
    }

    const normalized = normalizePortfolioContent(parsed);
    await setDoc(contentRef, normalized, { merge: false });
    editor.value = prettyPrint(normalized);
    setStatus("ok", "Saved successfully. Portfolio site will reflect changes after refresh.");
  }

  passwordLoginBtn.addEventListener("click", async () => {
    const email = (loginEmailInput.value || "").trim().toLowerCase();
    const password = loginPasswordInput.value || "";
    if (!email || !password) {
      setStatus("warn", "Enter the admin password to continue.");
      return;
    }

    try {
      setStatus("info", "Signing in securely...");
      await signInWithEmailAndPassword(auth, email, password);
      loginPasswordInput.value = "";
    } catch (error) {
      const code = error?.code || "unknown";
      loginPasswordInput.value = "";
      setStatus("error", `Sign-in failed (${code}). ${authHint(code)}`);
    }
  });

  signOutBtn.addEventListener("click", async () => {
    await signOut(auth);
  });

  loadBtn.addEventListener("click", async () => {
    try {
      await loadContentIntoEditor();
    } catch (error) {
      setStatus("error", `Reload failed: ${error.message}`);
    }
  });

  resetBtn.addEventListener("click", () => {
    editor.value = prettyPrint(defaultPortfolioContent);
    setStatus("warn", "Editor reset to default template. Save to publish.");
  });

  saveBtn.addEventListener("click", async () => {
    saveBtn.disabled = true;
    try {
      setStatus("info", "Saving changes...");
      await saveEditorToFirestore();
    } catch (error) {
      setStatus("error", `Save failed: ${error.message}`);
    } finally {
      saveBtn.disabled = false;
    }
  });

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      setEditorView(false);
      userText.textContent = "";
      setStatus(
        "info",
        "Private page. Sign in with your admin email/password. Credentials are handled by Firebase Auth over TLS."
      );
      return;
    }

    if (!isAllowedUser(user)) {
      setStatus("error", "This account is not authorized.");
      await signOut(auth);
      lockDownPage("This route is private.");
      return;
    }

    setEditorView(true);
    userText.textContent = `Signed in as ${user.email || user.uid}`;
    try {
      await loadContentIntoEditor();
    } catch (error) {
      setStatus("error", `Could not load content: ${error.message}`);
    }
  });
}
