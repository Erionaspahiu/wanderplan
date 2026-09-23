// One-off local smoke test for the /api/flights/* serverless handlers.
// Run with: node --env-file=.env scripts/test-flight-handlers.mjs
// (plain `node` doesn't auto-load .env the way Vite/Vercel do).
// Not part of the app; safe to delete anytime.
import locationsHandler from "../api/flights/locations.js";
import searchHandler from "../api/flights/search.js";
import inspirationHandler from "../api/flights/inspiration.js";

function mockRes(label, onBody) {
  return {
    _status: 200,
    status(code) {
      this._status = code;
      return this;
    },
    json(body) {
      console.log(`\n=== ${label} (status ${this._status}) ===`);
      onBody(body, this._status);
    },
  };
}

await locationsHandler(
  { query: { keyword: "Pristina" } },
  mockRes("locations", (body) => {
    if (body.error) return console.log("ERROR:", body.error);
    body.results.forEach((a) => console.log(`  ${a.iataCode}  ${a.cityName} — ${a.name}`));
  })
);

await searchHandler(
  { query: { origin: "PRN", destination: "FCO", departDate: "2026-10-10", returnDate: "2026-10-15", adults: "1" } },
  mockRes("search PRN -> FCO", (body) => {
    if (body.error) return console.log("ERROR:", body.error);
    console.log(`  ${body.offers.length} offers`);
    body.offers.slice(0, 5).forEach((o) => {
      const seg = o.slices[0].segments[0];
      const stops = o.slices[0].segments.length - 1;
      console.log(
        `  ${seg.marketing_carrier.name} (${seg.marketing_carrier.iata_code}) — ` +
          `${o.total_amount} ${o.total_currency} — ${seg.origin.iata_code}->${o.slices[0].segments.at(-1).destination.iata_code} — ` +
          `${o.slices[0].duration} — ${stops} stop(s)`
      );
    });
  })
);

await inspirationHandler(
  { query: { origin: "PRN" } },
  mockRes("inspiration from PRN", (body) => {
    if (body.error) return console.log("ERROR:", body.error);
    body.results.forEach((r) => console.log(`  ${r.destination}: ${r.price} ${r.currency} on ${r.departureDate}`));
  })
);
