import { duffelRequest, handleDuffelError } from "../_lib/duffel.js";

export const config = { maxDuration: 30 };

const CABIN_CLASS = {
  ECONOMY: "economy",
  PREMIUM_ECONOMY: "premium_economy",
  BUSINESS: "business",
  FIRST: "first",
};

// GET /api/flights/search?origin=PRN&destination=FCO&departDate=2026-10-10
//     &returnDate=2026-10-15&adults=2&travelClass=ECONOMY
// Real flight offers from Duffel's Offer Requests API.
export default async function handler(req, res) {
  const { origin, destination, departDate, returnDate, adults = "1", travelClass } = req.query;

  if (!origin || !destination || !departDate) {
    res.status(400).json({ error: "origin, destination and departDate are required." });
    return;
  }

  const slices = [
    {
      origin: String(origin).toUpperCase(),
      destination: String(destination).toUpperCase(),
      departure_date: departDate,
    },
  ];
  if (returnDate) {
    slices.push({
      origin: String(destination).toUpperCase(),
      destination: String(origin).toUpperCase(),
      departure_date: returnDate,
    });
  }

  const passengerCount = Math.max(1, Math.min(9, Number(adults) || 1));
  const passengers = Array.from({ length: passengerCount }, () => ({ type: "adult" }));

  try {
    const data = await duffelRequest("/air/offer_requests", {
      method: "POST",
      params: { return_offers: "true", supplier_timeout: 15000 },
      body: {
        data: {
          slices,
          passengers,
          cabin_class: CABIN_CLASS[travelClass] || "economy",
        },
      },
    });

    res.status(200).json({ offers: (data?.offers || []).slice(0, 20) });
  } catch (err) {
    handleDuffelError(res, err);
  }
}
