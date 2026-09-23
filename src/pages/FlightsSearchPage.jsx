import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plane } from "lucide-react";
import FlightSearchForm from "../components/flights/FlightSearchForm";
import FlightResults from "../components/flights/FlightResults";
import { searchFlights } from "../services/flightApi";
import { formatDate } from "../utils/dates";
import { useLanguage } from "../context/LanguageContext";

const ORIGIN_STORAGE_KEY = "movin_flight_origin_v2";

function readStoredOrigin() {
  try {
    const raw = localStorage.getItem(ORIGIN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const initialResultState = {
  loading: false,
  error: null,
  notConfigured: false,
  offers: [],
  searched: false,
};

/** Public flight search — no trip required. Can arrive pre-filled via query params. */
export default function FlightsSearchPage() {
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const [savedOrigin] = useState(readStoredOrigin);
  const [result, setResult] = useState(initialResultState);
  const [searchMeta, setSearchMeta] = useState(null);

  const initialDestination =
    params.get("destination") && params.get("destinationLabel")
      ? { code: params.get("destination"), label: params.get("destinationLabel") }
      : null;
  const initialOrigin =
    params.get("origin") && params.get("originLabel")
      ? { code: params.get("origin"), label: params.get("originLabel") }
      : null;

  const handleSearch = async (searchParams) => {
    setResult((s) => ({ ...s, loading: true, error: null, notConfigured: false, searched: true }));
    setSearchMeta({
      originLabel: searchParams.originLabel,
      destinationLabel: searchParams.destinationLabel,
      departDateLabel: formatDate(searchParams.departDate),
      returnDateLabel: searchParams.returnDate ? formatDate(searchParams.returnDate) : "",
    });
    try {
      const data = await searchFlights(searchParams);
      setResult({
        loading: false,
        error: null,
        notConfigured: false,
        offers: data.offers,
        searched: true,
      });
    } catch (err) {
      setResult({
        loading: false,
        error: err.code === "NOT_CONFIGURED" ? null : err.message,
        notConfigured: err.code === "NOT_CONFIGURED",
        offers: [],
        searched: true,
      });
    }
  };

  return (
    <div className="container page">
      <header className="page-header">
        <div>
          <h1>
            <Plane size={26} style={{ verticalAlign: "-4px", marginRight: "0.4rem" }} />
            {t("flights.title")}
          </h1>
          <p>{t("flights.subtitle")}</p>
        </div>
      </header>

      <FlightSearchForm
        initialDestination={initialDestination}
        initialOrigin={initialOrigin}
        startDate={params.get("departDate") || ""}
        endDate={params.get("returnDate") || ""}
        savedOrigin={savedOrigin}
        onSearch={handleSearch}
        loading={result.loading}
        autoSearch={Boolean(initialDestination && (initialOrigin || savedOrigin))}
      />
      <FlightResults
        loading={result.loading}
        error={result.error}
        notConfigured={result.notConfigured}
        offers={result.offers}
        originLabel={searchMeta?.originLabel}
        destinationLabel={searchMeta?.destinationLabel}
        departDateLabel={searchMeta?.departDateLabel}
        returnDateLabel={searchMeta?.returnDateLabel}
        onSave={null}
        savingId={null}
        searched={result.searched}
      />
    </div>
  );
}
