import { duffelRequest, handleDuffelError } from "../_lib/duffel.js";

// GET /api/flights/locations?keyword=Pristina
// Airport/city autocomplete, backed by Duffel's Places Suggestions API.
export default async function handler(req, res) {
  const keyword = String(req.query.keyword || "").trim();
  if (keyword.length < 2) {
    res.status(200).json({ results: [] });
    return;
  }

  try {
    const data = await duffelRequest("/places/suggestions", { params: { query: keyword } });

    const results = (data || [])
      .filter((place) => place.iata_code)
      .slice(0, 8)
      .map((place) => ({
        iataCode: place.iata_code,
        name: place.name,
        cityName: place.city_name || place.city?.name || place.name,
        countryName: place.iata_country_code || "",
        subType: place.type === "city" ? "CITY" : "AIRPORT",
      }));

    res.status(200).json({ results });
  } catch (err) {
    handleDuffelError(res, err);
  }
}
