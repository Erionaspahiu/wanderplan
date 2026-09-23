import { useState } from "react";
import { searchFlights } from "../../services/flightApi";
import FlightSearchForm from "./FlightSearchForm";
import FlightResults from "./FlightResults";
import { formatDate } from "../../utils/dates";

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

export default function FlightsTab({ trip, onSaveFlight, savingId }) {
  const [savedOrigin, setSavedOrigin] = useState(readStoredOrigin);
  const [result, setResult] = useState(initialResultState);
  const [searchMeta, setSearchMeta] = useState(null);

  const handleOriginChange = (origin) => {
    setSavedOrigin(origin);
    try {
      localStorage.setItem(ORIGIN_STORAGE_KEY, JSON.stringify(origin));
    } catch {
      // localStorage unavailable — origin just won't be remembered
    }
  };

  const handleSearch = async (params) => {
    setResult((s) => ({ ...s, loading: true, error: null, notConfigured: false, searched: true }));
    setSearchMeta({
      originLabel: params.originLabel,
      destinationLabel: params.destinationLabel,
      departDateLabel: formatDate(params.departDate),
      returnDateLabel: params.returnDate ? formatDate(params.returnDate) : "",
    });
    try {
      const data = await searchFlights(params);
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
    <div className="flights-tab">
      <FlightSearchForm
        destinationCity={trip.destination}
        startDate={trip.start_date}
        endDate={trip.end_date}
        savedOrigin={savedOrigin}
        onOriginChange={handleOriginChange}
        onSearch={handleSearch}
        loading={result.loading}
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
        onSave={onSaveFlight}
        savingId={savingId}
        searched={result.searched}
      />
    </div>
  );
}
