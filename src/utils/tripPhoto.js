import { findCuratedDestination } from "../data/demoData";
import { getDestinationPhoto } from "../services/photoService";

export const DEFAULT_TRIP_IMAGE = "/images/default-trip.webp";

/** Curated photo when we have a real one, otherwise a live Wikipedia lookup. */
export async function resolveDestinationPhoto(destination, country) {
  const guide = findCuratedDestination(destination);
  if (guide && guide.image !== DEFAULT_TRIP_IMAGE) return { url: guide.image, source: "curated" };
  const found = await getDestinationPhoto(destination, country);
  return found ? { url: found, source: "wikipedia" } : null;
}
