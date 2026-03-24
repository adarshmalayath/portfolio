import { normalizeContent } from "./defaultContent";

const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");
const API_CONFIGURED = Boolean(API_BASE);

function looksLikeHtml(value) {
  return /<\s*(!doctype|html|head|body)\b/i.test(String(value || ""));
}

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${normalizedPath}` : normalizedPath;
}

async function request(path, options = {}) {
  if (!API_CONFIGURED) {
    throw new Error("API is not configured for this deployment.");
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const bodyText = await response.text();
  let body = null;
  if (bodyText) {
    try {
      body = JSON.parse(bodyText);
    } catch (error) {
      body = { message: bodyText };
    }
  }

  if (!response.ok) {
    const message =
      body?.message && !looksLikeHtml(body.message)
        ? body.message
        : bodyText && !looksLikeHtml(bodyText)
          ? bodyText
          : `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return body;
}

export async function fetchPublicContent() {
  if (!API_CONFIGURED) {
    return normalizeContent();
  }
  const payload = await request("/api/content/public", { method: "GET" });
  return normalizeContent(payload);
}

export async function fetchAdminContent(token) {
  const payload = await request("/api/content/admin", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return normalizeContent(payload);
}

export async function saveAdminContent(token, content) {
  const payload = await request("/api/content/admin", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(content)
  });
  return normalizeContent(payload);
}

export async function googleSignIn(googleIdToken) {
  return request("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken: googleIdToken })
  });
}
