const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const WEATHER_CODES = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mainly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Fog", icon: "🌫️" },
  48: { label: "Fog", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Dense drizzle", icon: "🌧️" },
  56: { label: "Freezing drizzle", icon: "🌧️" },
  57: { label: "Freezing drizzle", icon: "🌧️" },
  61: { label: "Light rain", icon: "🌦️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  66: { label: "Freezing rain", icon: "🌧️" },
  67: { label: "Freezing rain", icon: "🌧️" },
  71: { label: "Light snow", icon: "🌨️" },
  73: { label: "Snow", icon: "❄️" },
  75: { label: "Heavy snow", icon: "❄️" },
  77: { label: "Snow grains", icon: "❄️" },
  80: { label: "Rain showers", icon: "🌦️" },
  81: { label: "Rain showers", icon: "🌧️" },
  82: { label: "Violent showers", icon: "⛈️" },
  85: { label: "Snow showers", icon: "🌨️" },
  86: { label: "Snow showers", icon: "🌨️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
  96: { label: "Thunderstorm with hail", icon: "⛈️" },
  99: { label: "Thunderstorm with hail", icon: "⛈️" },
};

export function describeWeatherCode(code) {
  return WEATHER_CODES[code] || { label: "Unknown", icon: "🌡️" };
}

const geocodeCache = new Map();

/**
 * Resolves a destination + country to coordinates via Open-Meteo's
 * free geocoding API (no key required).
 */
export async function geocodeDestination(destination, country) {
  const key = `${destination}|${country || ""}`.toLowerCase().trim();
  if (geocodeCache.has(key)) return geocodeCache.get(key);

  const url = `${GEOCODE_URL}?name=${encodeURIComponent(destination)}&count=8&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not look up that destination");
  const data = await res.json();
  const results = data.results || [];
  if (results.length === 0) {
    throw new Error(`No location found for "${destination}"`);
  }

  let match = results[0];
  if (country) {
    const found = results.find(
      (r) => (r.country || "").toLowerCase() === country.toLowerCase()
    );
    if (found) match = found;
  }

  const location = {
    lat: match.latitude,
    lon: match.longitude,
    label: [match.name, match.admin1, match.country].filter(Boolean).join(", "),
  };
  geocodeCache.set(key, location);
  return location;
}

/**
 * Fetches a 16-day daily forecast (Open-Meteo's max range) for a
 * destination. Real forecasts only extend ~2 weeks out, so trip dates
 * further away won't be covered — callers should treat this as the
 * upcoming outlook rather than a guarantee for the exact travel dates.
 */
export async function getWeatherForecast(destination, country) {
  const location = await geocodeDestination(destination, country);
  const params = new URLSearchParams({
    latitude: location.lat,
    longitude: location.lon,
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "auto",
    forecast_days: "16",
  });

  const res = await fetch(`${FORECAST_URL}?${params.toString()}`);
  if (!res.ok) throw new Error("Could not load the weather forecast");
  const data = await res.json();
  const daily = data.daily || {};
  const time = daily.time || [];

  const days = time.map((date, i) => ({
    date,
    code: daily.weather_code?.[i],
    tempMax: daily.temperature_2m_max?.[i],
    tempMin: daily.temperature_2m_min?.[i],
    precipChance: daily.precipitation_probability_max?.[i] ?? null,
  }));

  return { location, days };
}
