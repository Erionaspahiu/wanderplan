/** "PT2H30M" -> "2h 30m" */
export function formatDuration(iso) {
  if (!iso) return "";
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(iso);
  if (!match) return iso;
  const h = match[1] ? `${match[1]}h` : "";
  const m = match[2] ? `${match[2]}m` : "";
  return [h, m].filter(Boolean).join(" ") || "0m";
}

export function formatClock(dateTimeStr) {
  if (!dateTimeStr) return "";
  return new Date(dateTimeStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function durationToMinutes(iso) {
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(iso || "");
  if (!match) return 0;
  return Number(match[1] || 0) * 60 + Number(match[2] || 0);
}

/** Flattens a raw Duffel flight-offer into what the UI needs. */
export function summarizeOffer(offer) {
  const slices = offer.slices || [];
  const outbound = slices[0];
  const inbound = slices.length > 1 ? slices[1] : null;
  const outSegments = outbound?.segments || [];
  const firstSeg = outSegments[0];
  const lastSeg = outSegments[outSegments.length - 1];

  return {
    id: offer.id,
    price: Number(offer.total_amount),
    currency: offer.total_currency,
    airlineCode: firstSeg?.marketing_carrier?.iata_code,
    airlineName: firstSeg?.marketing_carrier?.name || firstSeg?.marketing_carrier?.iata_code || "",
    departureAirport: firstSeg?.origin?.iata_code,
    arrivalAirport: lastSeg?.destination?.iata_code,
    departureTime: firstSeg?.departing_at,
    arrivalTime: lastSeg?.arriving_at,
    duration: outbound?.duration,
    stops: Math.max(outSegments.length - 1, 0),
    isRoundTrip: Boolean(inbound),
    returnDuration: inbound?.duration || null,
    returnDepartureTime: inbound?.segments?.[0]?.departing_at || null,
    returnArrivalTime: inbound?.segments?.[inbound.segments.length - 1]?.arriving_at || null,
    raw: offer,
  };
}

export function sortOffers(offers, sortBy) {
  const list = [...offers];
  if (sortBy === "fastest") {
    const totalMinutes = (o) => durationToMinutes(o.duration) + durationToMinutes(o.returnDuration);
    return list.sort((a, b) => totalMinutes(a) - totalMinutes(b));
  }
  if (sortBy === "best") {
    // Simple heuristic: fewer stops first, then price.
    return list.sort((a, b) => a.stops - b.stops || a.price - b.price);
  }
  return list.sort((a, b) => a.price - b.price); // cheapest (default)
}

/** No direct-booking API in the free tier — this is a real, working search, not a fake link. */
export function googleFlightsUrl({ originLabel, destinationLabel, departDateLabel, returnDateLabel }) {
  const query = `Flights from ${originLabel} to ${destinationLabel}${
    departDateLabel ? ` on ${departDateLabel}` : ""
  }${returnDateLabel ? ` returning ${returnDateLabel}` : ""}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(query)}`;
}

/** Public, keyless airline-logo CDN keyed by IATA carrier code (no logo just renders nothing). */
export function airlineLogoUrl(carrierCode) {
  if (!carrierCode) return null;
  return `https://images.kiwi.com/airlines/64/${carrierCode}.png`;
}
