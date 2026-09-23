async function request(path, params = {}) {
  const url = new URL(path, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const res = await fetch(url);
  const isJson = (res.headers.get("content-type") || "").includes("application/json");

  // Under plain `vite dev` (no serverless functions running), a request
  // to /api/* is served the SPA's index.html instead of a real 404 —
  // fail clearly here instead of silently returning garbage data.
  if (!isJson) {
    const err = new Error(
      "Flight search API isn't running. Use `vercel dev` instead of `npm run dev` to test this locally."
    );
    err.code = "NOT_CONFIGURED";
    throw err;
  }

  const body = await res.json();
  if (!res.ok) {
    const err = new Error(body.error || "Flight search request failed.");
    err.code = body.code;
    err.status = res.status;
    throw err;
  }
  return body;
}

export async function searchAirports(keyword) {
  const { results } = await request("/api/flights/locations", { keyword });
  return results;
}

export async function searchFlights(params) {
  return request("/api/flights/search", params);
}

export async function getFlightInspiration(origin) {
  const { results } = await request("/api/flights/inspiration", { origin });
  return results;
}
