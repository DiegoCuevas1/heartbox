import getCSRF from "@/utils/cookie";

/**
 * Base URL for the Django API. Empty by default: the browser calls /api/* on
 * the same origin, and Next.js (dev) or the reverse proxy (prod) forwards it
 * to Django. Set NEXT_PUBLIC_API_URL only if the API lives on another origin.
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

let csrfPromise: Promise<void> | null = null;

/** Make sure the csrftoken cookie exists (Django sets it on check-login). */
async function ensureCsrfCookie() {
  if (getCSRF()) return;
  if (!csrfPromise) {
    csrfPromise = fetch(`${API_BASE}/api/user/check-login`, {
      credentials: "include",
    })
      .then(() => undefined)
      .finally(() => {
        csrfPromise = null;
      });
  }
  await csrfPromise;
}

/**
 * fetch() for the HeartBox API: sends the session cookie and, for requests
 * that change data, the CSRF token Django requires.
 */
export async function apiFetch(path: string, init: RequestInit = {}) {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);

  if (!SAFE_METHODS.includes(method)) {
    await ensureCsrfCookie();
    const token = getCSRF();
    if (token) headers.set("X-CSRFToken", token);
  }

  return fetch(`${API_BASE}${path}`, {
    ...init,
    method,
    headers,
    credentials: "include",
  });
}
