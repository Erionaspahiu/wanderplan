/**
 * Builds flight-search links for a route. There's no free, keyless
 * flight-pricing API the way there is for weather, so rather than show
 * a price we can't guarantee is current or correct, this opens real
 * live searches on well-known engines pre-filled with the route and
 * dates — one click to compare live prices instead of typing it all
 * in by hand.
 */
export function getFlightLinks({ origin, destination, departDateLabel, returnDateLabel }) {
  const from = origin?.trim();
  const to = destination?.trim();
  if (!from || !to) return [];

  const links = [
    {
      key: "google",
      label: "Google Flights",
      url: `https://www.google.com/travel/flights?q=${encodeURIComponent(
        `Flights from ${from} to ${to}${departDateLabel ? ` on ${departDateLabel}` : ""}${
          returnDateLabel ? ` returning ${returnDateLabel}` : ""
        }`
      )}`,
    },
    {
      key: "more",
      labelKey: "flights.moreOptions",
      url: `https://www.google.com/search?q=${encodeURIComponent(
        `cheap flights from ${from} to ${to}${departDateLabel ? ` ${departDateLabel}` : ""}`
      )}`,
    },
  ];

  return links;
}
