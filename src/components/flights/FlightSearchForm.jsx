import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import AirportAutocomplete from "./AirportAutocomplete";
import { searchAirports } from "../../services/flightApi";
import { useLanguage } from "../../context/LanguageContext";
import Button from "../ui/Button";

const CABIN_CLASSES = ["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"];

/**
 * destination/dates come from the trip and are resolved automatically;
 * origin is the one thing the user has to provide unless it's already
 * saved from a previous search. `initialDestination`/`initialOrigin`
 * (pre-resolved {code,label} pairs) skip that resolution step entirely —
 * used when arriving from a homepage cheap-flight card that already
 * knows the exact airport codes.
 */
export default function FlightSearchForm({
  destinationCity,
  initialDestination,
  initialOrigin,
  startDate,
  endDate,
  savedOrigin,
  onOriginChange,
  onSearch,
  loading,
  autoSearch,
}) {
  const { t } = useLanguage();
  const effectiveOrigin = initialOrigin || savedOrigin;
  const [originText, setOriginText] = useState(effectiveOrigin?.label || "");
  const [originCode, setOriginCode] = useState(effectiveOrigin?.code || "");
  const [destinationText, setDestinationText] = useState(initialDestination?.label || destinationCity || "");
  const [destinationCode, setDestinationCode] = useState(initialDestination?.code || "");
  const [departDate, setDepartDate] = useState(startDate || "");
  const [returnDate, setReturnDate] = useState(endDate || "");
  const [tripType, setTripType] = useState(endDate ? "round" : "oneway");
  const [adults, setAdults] = useState(1);
  const [cabinClass, setCabinClass] = useState("ECONOMY");

  // Auto-resolve the trip's destination city to an airport/city code once,
  // unless we were already handed a resolved code.
  useEffect(() => {
    if (initialDestination || !destinationCity || destinationCode) return;
    let mounted = true;
    searchAirports(destinationCity)
      .then((results) => {
        if (!mounted || results.length === 0) return;
        const cityMatch = results.find((r) => r.subType === "CITY") || results[0];
        setDestinationCode(cityMatch.iataCode);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationCity, initialDestination]);

  // Fire the search once automatically when everything's already known
  // (arriving from a homepage card), instead of making the visitor
  // re-click Search for a query they already made.
  useEffect(() => {
    if (autoSearch && originCode && destinationCode && departDate) {
      onSearch({
        origin: originCode,
        destination: destinationCode,
        originLabel: originText,
        destinationLabel: destinationText,
        departDate,
        returnDate: tripType === "round" ? returnDate : undefined,
        adults,
        travelClass: cabinClass,
      });
    }
    // Only ever auto-fire once, on mount, with the initial values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectOrigin = (airport) => {
    setOriginText(`${airport.cityName} (${airport.iataCode})`);
    setOriginCode(airport.iataCode);
    onOriginChange?.({ code: airport.iataCode, label: `${airport.cityName} (${airport.iataCode})` });
  };

  const selectDestination = (airport) => {
    setDestinationText(`${airport.cityName} (${airport.iataCode})`);
    setDestinationCode(airport.iataCode);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!originCode || !destinationCode || !departDate) return;
    onSearch({
      origin: originCode,
      destination: destinationCode,
      originLabel: originText,
      destinationLabel: destinationText,
      departDate,
      returnDate: tripType === "round" ? returnDate : undefined,
      adults,
      travelClass: cabinClass,
    });
  };

  const canSearch = Boolean(originCode && destinationCode && departDate);

  return (
    <form className="flight-search-form" onSubmit={submit}>
      <div className="form-grid">
        <AirportAutocomplete
          id="flight-origin"
          label={t("flights.from")}
          placeholder={t("flights.fromPlaceholder")}
          value={originText}
          onChange={(v) => {
            setOriginText(v);
            setOriginCode("");
          }}
          onSelect={selectOrigin}
        />
        <AirportAutocomplete
          id="flight-destination"
          label={t("flights.to")}
          placeholder={t("flights.fromPlaceholder")}
          value={destinationText}
          onChange={(v) => {
            setDestinationText(v);
            setDestinationCode("");
          }}
          onSelect={selectDestination}
        />
        <label className="field">
          <span className="field-label">{t("flights.tripType")}</span>
          <select
            className="field-control"
            value={tripType}
            onChange={(e) => setTripType(e.target.value)}
          >
            <option value="round">{t("flights.roundTrip")}</option>
            <option value="oneway">{t("flights.oneWay")}</option>
          </select>
        </label>
        <label className="field">
          <span className="field-label">{t("flights.cabinClass")}</span>
          <select className="field-control" value={cabinClass} onChange={(e) => setCabinClass(e.target.value)}>
            {CABIN_CLASSES.map((c) => (
              <option key={c} value={c}>
                {t(`flights.cabin.${c}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">{t("createTrip.startDate")}</span>
          <input
            className="field-control"
            type="date"
            value={departDate}
            onChange={(e) => setDepartDate(e.target.value)}
          />
        </label>
        {tripType === "round" && (
          <label className="field">
            <span className="field-label">{t("createTrip.endDate")}</span>
            <input
              className="field-control"
              type="date"
              min={departDate}
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
            />
          </label>
        )}
        <label className="field">
          <span className="field-label">{t("flights.passengers")}</span>
          <input
            className="field-control"
            type="number"
            min="1"
            max="9"
            value={adults}
            onChange={(e) => setAdults(e.target.value)}
          />
        </label>
      </div>
      <div className="flight-search-submit">
        <Button type="submit" disabled={!canSearch} loading={loading}>
          <Search size={16} /> {t("flights.search")}
        </Button>
      </div>
    </form>
  );
}
