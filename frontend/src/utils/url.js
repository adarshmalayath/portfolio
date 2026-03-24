const BASE_URL = import.meta.env.BASE_URL || "/";

export function withBaseUrl(path) {
  if (!path) return path;
  if (/^(?:[a-z]+:)?\/\//i.test(path) || /^(mailto:|tel:|#|data:)/i.test(path)) {
    return path;
  }

  const normalized = String(path).replace(/^\/+/, "");
  return `${BASE_URL}${normalized}`;
}
