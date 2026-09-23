/**
 * Builds a ticket-purchase link for an attraction. Uses an explicit
 * `ticket_url` when the place data provides one (a handful of major
 * landmarks are curated); otherwise falls back to a search for the
 * official ticket page, since deep-linking to a specific vendor for
 * every attraction risks pointing at a stale or wrong site.
 */
export function getTicketLink(place) {
  if (place.ticket_url) return place.ticket_url;
  const query = [place.name, place.location, "official tickets"].filter(Boolean).join(" ");
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

/** Only paid attractions need a ticket link — free sights and other categories don't. */
export function needsTicket(place) {
  return place.category === "Attractions" && Number(place.estimated_price) > 0;
}
