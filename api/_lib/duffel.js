// Server-only helper for calling the Duffel Flights API
// (https://duffel.com/docs/api). DUFFEL_API_TOKEN lives in Vercel's
// server environment (no VITE_ prefix) and is never sent to the
// browser — only these serverless functions read it.

const BASE_URL = "https://api.duffel.com";

export class DuffelConfigError extends Error {}
export class DuffelApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export function hasDuffelToken() {
  return Boolean(process.env.DUFFEL_API_TOKEN);
}

function getToken() {
  const token = process.env.DUFFEL_API_TOKEN;
  if (!token) {
    throw new DuffelConfigError("Flight search isn't configured yet — DUFFEL_API_TOKEN is missing.");
  }
  return token;
}

/**
 * Calls a Duffel API endpoint and returns the parsed JSON `data` payload.
 * `path` is the endpoint path (e.g. "/air/offer_requests").
 */
export async function duffelRequest(path, { method = "GET", body, params } = {}) {
  const token = getToken();
  const url = new URL(BASE_URL + path);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Duffel-Version": "v2",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const detail =
      json?.errors?.[0]?.message || json?.errors?.[0]?.title || "The flight data provider returned an error.";
    throw new DuffelApiError(detail, res.status);
  }

  return json?.data;
}

/** Shared error → HTTP response mapping for every /api/flights/* handler. */
export function handleDuffelError(res, err) {
  if (err instanceof DuffelConfigError) {
    res.status(501).json({ error: err.message, code: "NOT_CONFIGURED" });
    return;
  }
  if (err instanceof DuffelApiError) {
    res.status(err.status >= 400 && err.status < 600 ? err.status : 502).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: "Unexpected error while searching flights." });
}
