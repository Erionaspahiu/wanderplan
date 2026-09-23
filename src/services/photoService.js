const API_URL = "https://en.wikipedia.org/w/api.php";

const photoCache = new Map();

/**
 * Finds a real photo for a destination via Wikipedia/Wikimedia's free,
 * keyless public API. A curated image list can't scale to every city
 * a user might type, but Wikipedia has decent photo coverage even for
 * small towns, so it's used as the general-purpose fallback.
 *
 * Combines the page search and the thumbnail lookup into a single
 * request (generator=search), and asks for a 1200px-wide thumbnail
 * rather than the full-resolution original, which can be several MB
 * and slow to load for what's just a trip-card background image.
 */
export async function getDestinationPhoto(destination, country) {
  const key = `${destination}|${country || ""}`.toLowerCase().trim();
  if (photoCache.has(key)) return photoCache.get(key);

  const photo = await lookupPhoto(destination, country);
  photoCache.set(key, photo);
  return photo;
}

async function lookupPhoto(destination, country) {
  const query = [destination, country].filter(Boolean).join(" ");
  try {
    const params = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: query,
      gsrlimit: "1",
      prop: "pageimages",
      piprop: "thumbnail",
      pithumbsize: "1200",
      format: "json",
      origin: "*",
    });
    const res = await fetch(`${API_URL}?${params.toString()}`);
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;
    const page = Object.values(pages)[0];
    return page?.thumbnail?.source || null;
  } catch {
    return null;
  }
}
