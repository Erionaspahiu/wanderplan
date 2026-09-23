import { useState } from "react";
import { Plane } from "lucide-react";
import { getFlightLinks } from "../../utils/flightLinks";
import { formatDate } from "../../utils/dates";
import { useLanguage } from "../../context/LanguageContext";

const ORIGIN_STORAGE_KEY = "movin_flight_origin";

function readStoredOrigin() {
  try {
    return localStorage.getItem(ORIGIN_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export default function FlightLinks({ destination, startDate, endDate }) {
  const { t } = useLanguage();
  const [origin, setOrigin] = useState(readStoredOrigin);

  const onOriginChange = (e) => {
    const value = e.target.value;
    setOrigin(value);
    try {
      localStorage.setItem(ORIGIN_STORAGE_KEY, value);
    } catch {
      // localStorage unavailable — origin just won't be remembered
    }
  };

  const links = getFlightLinks({
    origin,
    destination,
    departDateLabel: startDate ? formatDate(startDate) : "",
    returnDateLabel: endDate ? formatDate(endDate) : "",
  });

  return (
    <article className="card flights-card">
      <h3>
        <Plane size={18} /> {t("flights.title")}
      </h3>
      <p className="muted">{t("flights.subtitle")}</p>
      <label className="field flights-origin-field">
        <span className="field-label">{t("flights.from")}</span>
        <input
          className="field-control"
          type="text"
          placeholder={t("flights.fromPlaceholder")}
          value={origin}
          onChange={onOriginChange}
        />
      </label>
      {links.length === 0 ? (
        <p className="muted flights-hint">{t("flights.enterOrigin")}</p>
      ) : (
        <div className="flights-links">
          {links.map((link) => (
            <a
              key={link.key}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              {link.label || t(link.labelKey)}
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
