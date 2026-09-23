import { duffelRequest, hasDuffelToken } from "../_lib/duffel.js";

export const config = { maxDuration: 30 };

// Duffel has no single "cheapest destinations from X" endpoint the way
// some other providers do, so this runs real one-way searches against a
// short curated list of popular destinations in parallel and keeps
// whichever ones actually returned a price — still real Duffel data,
// just gathered a different way. Failures for individual destinations
// (route not served, no availability) are swallowed so one bad route
// doesn't break the rest.
const CANDIDATE_DESTINATIONS = ["FCO", "BCN", "IST", "CDG", "LHR", "ATH", "MAD", "PRG", "VIE", "AMS"];

function defaultDepartureDate() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

async function cheapestTo(origin, destination, departureDate) {
  const data = await duffelRequest("/air/offer_requests", {
    method: "POST",
    params: { return_offers: "true", supplier_timeout: 10000 },
    body: {
      data: {
        slices: [{ origin, destination, departure_date: departureDate }],
        passengers: [{ type: "adult" }],
        cabin_class: "economy",
      },
    },
  });

  const offers = data?.offers || [];
  if (offers.length === 0) return null;
  const cheapest = offers.reduce((min, o) => (Number(o.total_amount) < Number(min.total_amount) ? o : min));
  return {
    destination,
    departureDate,
    price: cheapest.total_amount,
    currency: cheapest.total_currency,
  };
}

// GET /api/flights/inspiration?origin=PRN
export default async function handler(req, res) {
  const origin = String(req.query.origin || "").trim().toUpperCase();
  if (!origin) {
    res.status(400).json({ error: "origin is required." });
    return;
  }

  if (!hasDuffelToken()) {
    res.status(501).json({
      error: "Flight search isn't configured yet — DUFFEL_API_TOKEN is missing.",
      code: "NOT_CONFIGURED",
    });
    return;
  }

  const departureDate = defaultDepartureDate();
  const destinations = CANDIDATE_DESTINATIONS.filter((code) => code !== origin);

  const settled = await Promise.allSettled(destinations.map((d) => cheapestTo(origin, d, departureDate)));

  const results = settled
    .filter((r) => r.status === "fulfilled" && r.value)
    .map((r) => r.value)
    .sort((a, b) => Number(a.price) - Number(b.price));

  res.status(200).json({ results });
}
