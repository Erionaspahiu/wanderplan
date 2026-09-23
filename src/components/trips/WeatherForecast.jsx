import { useEffect, useState } from "react";
import { CloudSun, Droplets } from "lucide-react";
import { getWeatherForecast, describeWeatherCode } from "../../services/weatherService";
import { useLanguage } from "../../context/LanguageContext";
import LoadingSpinner from "../ui/LoadingSpinner";

const DATE_LOCALE = { en: "en-US", sq: "sq-AL" };

export default function WeatherForecast({ destination, country, startDate, endDate }) {
  const { t, lang } = useLanguage();
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    if (!destination) return undefined;
    let mounted = true;
    setState({ loading: true, error: null, data: null });
    getWeatherForecast(destination, country)
      .then((data) => {
        if (mounted) setState({ loading: false, error: null, data });
      })
      .catch((err) => {
        if (mounted) {
          setState({ loading: false, error: err.message, data: null });
        }
      });
    return () => {
      mounted = false;
    };
  }, [destination, country]);

  if (state.loading) {
    return (
      <article className="card weather-card">
        <h3>
          <CloudSun size={18} /> {t("weather.forecastTitle")}
        </h3>
        <LoadingSpinner label={t("weather.loading")} />
      </article>
    );
  }

  if (state.error || !state.data) {
    return (
      <article className="card weather-card">
        <h3>
          <CloudSun size={18} /> {t("weather.forecastTitle")}
        </h3>
        <p className="muted">{state.error || t("weather.unavailable")}</p>
      </article>
    );
  }

  const { days, location } = state.data;
  const inTripRange = (date) => Boolean(startDate && endDate && date >= startDate && date <= endDate);
  const tripCovered = days.some((d) => inTripRange(d.date));

  return (
    <article className="card weather-card">
      <div className="weather-header">
        <h3>
          <CloudSun size={18} /> {t("weather.title", { location: location.label })}
        </h3>
        <p className="muted">
          {tripCovered ? t("weather.tripCovered") : t("weather.outlookNote", { count: days.length })}
        </p>
      </div>
      <div className="weather-scroll">
        {days.map((day) => {
          const info = describeWeatherCode(day.code);
          return (
            <div key={day.date} className={`weather-day ${inTripRange(day.date) ? "in-trip" : ""}`}>
              <span className="weather-date">
                {new Date(`${day.date}T00:00:00`).toLocaleDateString(DATE_LOCALE[lang] || "en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="weather-icon" title={info.label}>
                {info.icon}
              </span>
              <span className="weather-temp">
                <strong>{Math.round(day.tempMax)}°</strong>
                <span className="weather-temp-min">{Math.round(day.tempMin)}°</span>
              </span>
              {day.precipChance != null && (
                <span className="weather-precip">
                  <Droplets size={12} /> {day.precipChance}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}
