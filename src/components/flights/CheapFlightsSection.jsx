import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import AirportAutocomplete from "./AirportAutocomplete";
import { getFlightInspiration } from "../../services/flightApi";
import { airportCityName } from "../../data/airportCities";
import { findCuratedDestination } from "../../data/demoData";
import { DEFAULT_TRIP_IMAGE } from "../../utils/tripPhoto";
import { formatMoney } from "../../utils/currency";
import { formatDateRange } from "../../utils/dates";
import { useLanguage } from "../../context/LanguageContext";
import EmptyState from "../ui/EmptyState";

const ORIGIN_STORAGE_KEY = "movin_flight_origin_v2";

function readStoredOrigin() {
  try {
    const raw = localStorage.getItem(ORIGIN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function CheapFlightSkeleton() {
  return (
    <div className="cheap-flight-card">
      <div className="skeleton-line skeleton-w-full" style={{ height: 160, borderRadius: 0 }} />
      <div className="cheap-flight-body">
        <div className="skeleton-line skeleton-w-60" />
        <div className="skeleton-line skeleton-w-40" />
      </div>
    </div>
  );
}

export default function CheapFlightsSection() {
  const { t } = useLanguage();
  const [origin, setOrigin] = useState(readStoredOrigin);
  const [originText, setOriginText] = useState(origin?.label || "");
  const [state, setState] = useState({ loading: false, error: null, notConfigured: false, results: [] });

  useEffect(() => {
    if (!origin?.code) return undefined;
    let mounted = true;
    setState((s) => ({ ...s, loading: true, error: null, notConfigured: false }));
    getFlightInspiration(origin.code)
      .then((results) => {
        if (mounted) setState({ loading: false, error: null, notConfigured: false, results });
      })
      .catch((err) => {
        if (mounted) {
          setState({
            loading: false,
            error: err.code === "NOT_CONFIGURED" ? null : err.message,
            notConfigured: err.code === "NOT_CONFIGURED",
            results: [],
          });
        }
      });
    return () => {
      mounted = false;
    };
  }, [origin]);

  const selectOrigin = (airport) => {
    const value = { code: airport.iataCode, label: `${airport.cityName} (${airport.iataCode})` };
    setOrigin(value);
    setOriginText(value.label);
    try {
      localStorage.setItem(ORIGIN_STORAGE_KEY, JSON.stringify(value));
    } catch {
      // localStorage unavailable — origin just won't be remembered
    }
  };

  return (
    <section className="section section-muted" id="cheap-flights">
      <div className="container">
        <div className="section-header">
          <p className="eyebrow">{t("flights.title")}</p>
          <h2>{t("flights.inspirationTitle")}</h2>
          <p>{t("flights.inspirationSubtitle")}</p>
        </div>

        <div className="cheap-flights-origin">
          <AirportAutocomplete
            id="home-flight-origin"
            label={t("flights.inspirationFrom")}
            placeholder={t("flights.fromPlaceholder")}
            value={originText}
            onChange={setOriginText}
            onSelect={selectOrigin}
          />
        </div>

        {!origin?.code ? (
          <p className="muted" style={{ textAlign: "center" }}>
            {t("flights.inspirationEmpty")}
          </p>
        ) : state.loading ? (
          <div className="cheap-flights-grid">
            {[0, 1, 2].map((i) => (
              <CheapFlightSkeleton key={i} />
            ))}
          </div>
        ) : state.notConfigured ? (
          <EmptyState icon={Compass} title={t("flights.notConfiguredTitle")} description={t("flights.inspirationNotConfigured")} />
        ) : state.error ? (
          <EmptyState icon={Compass} title={t("flights.errorTitle")} description={state.error} />
        ) : state.results.length === 0 ? (
          <EmptyState icon={Compass} title={t("flights.noResultsTitle")} description={t("flights.noResultsDesc")} />
        ) : (
          <div className="cheap-flights-grid">
            {state.results.slice(0, 9).map((r) => {
              const cityName = airportCityName(r.destination);
              const guide = findCuratedDestination(cityName);
              const image = guide && guide.image !== DEFAULT_TRIP_IMAGE ? guide.image : DEFAULT_TRIP_IMAGE;
              const originCity = origin.label.split(" (")[0];
              const searchParams = new URLSearchParams({
                origin: origin.code,
                originLabel: origin.label,
                destination: r.destination,
                destinationLabel: cityName,
                departDate: r.departureDate || "",
                returnDate: r.returnDate || "",
              });

              return (
                <Link key={r.destination} to={`/flights?${searchParams.toString()}`} className="cheap-flight-card">
                  <div className="cheap-flight-media">
                    <img src={image} alt={cityName} loading="lazy" />
                    <span className="cheap-flight-price-badge">
                      {t("flights.fromPrice", { price: formatMoney(r.price, r.currency) })}
                    </span>
                  </div>
                  <div className="cheap-flight-body">
                    <h3>{cityName}</h3>
                    <p className="cheap-flight-route">
                      {originCity} → {cityName}
                    </p>
                    {r.departureDate && (
                      <p className="cheap-flight-dates">
                        {formatDateRange(r.departureDate, r.returnDate || r.departureDate)}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
