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

const googleLoginBtn = document.getElementById("googleLoginBtn");
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
  googleLoginBtn.disabled = true;
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
      GoogleAuthProvider,
      signInWithPopup,
      signInWithRedirect,
      getRedirectResult,
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
      "auth/configuration-not-found":
        "Google Auth configuration missing. In Firebase Console, open Authentication, click Get started, and enable Google provider.",
      "auth/unauthorized-domain":
        "Add adarshmalayath.github.io in Firebase Authentication -> Settings -> Authorized domains.",
      "auth/operation-not-allowed":
        "Enable Google provider in Firebase Authentication -> Sign-in method.",
      "auth/popup-blocked":
        "Popup blocked by browser. Allow popups and retry.",
      "auth/user-disabled":
        "This account is disabled in Firebase Authentication.",
      "auth/internal-error":
        "Internal auth error. Verify Google provider and authorized domain settings.",
      "auth/network-request-failed":
        "Network error. Check your connection and retry."
    };
    return hints[errorCode] || "Check browser console and Firebase Auth settings.";
  }

  async function handleRedirectResult() {
    try {
      await getRedirectResult(auth);
    } catch (error) {
      const code = error?.code || "unknown";
      setStatus("error", `Google sign-in redirect failed (${code}). ${authHint(code)}`);
    }
  }

  await handleRedirectResult();

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

  googleLoginBtn.addEventListener("click", async () => {
    try {
      setStatus("info", "Opening Google sign-in...");
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      const code = error?.code || "unknown";
      if (code === "auth/popup-blocked") {
        await signInWithRedirect(auth, new GoogleAuthProvider());
        return;
      }
      setStatus("error", `Google sign-in failed (${code}). ${authHint(code)}`);
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
        "Private page. Sign in with your admin Google account."
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
