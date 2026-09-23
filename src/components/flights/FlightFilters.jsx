import { useLanguage } from "../../context/LanguageContext";

export default function FlightFilters({
  sortBy,
  onSortChange,
  nonStopOnly,
  onNonStopChange,
  airlines,
  airlineFilter,
  onAirlineChange,
  maxPrice,
  onMaxPriceChange,
}) {
  const { t } = useLanguage();

  return (
    <div className="flight-filters">
      <label className="field flight-filter-field">
        <span className="field-label">{t("flights.sortBy")}</span>
        <select className="field-control" value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
          <option value="cheapest">{t("flights.cheapest")}</option>
          <option value="fastest">{t("flights.fastest")}</option>
          <option value="best">{t("flights.best")}</option>
        </select>
      </label>

      <label className="field flight-filter-field">
        <span className="field-label">{t("flights.airline")}</span>
        <select className="field-control" value={airlineFilter} onChange={(e) => onAirlineChange(e.target.value)}>
          <option value="">{t("common.all")}</option>
          {airlines.map((a) => (
            <option key={a.code} value={a.code}>
              {a.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field flight-filter-field">
        <span className="field-label">{t("flights.maxPrice")}</span>
        <input
          className="field-control"
          type="number"
          min="0"
          placeholder={t("common.all")}
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
        />
      </label>

      <label className="flight-filter-checkbox">
        <input type="checkbox" checked={nonStopOnly} onChange={(e) => onNonStopChange(e.target.checked)} />
        {t("flights.nonStopOnly")}
      </label>
    </div>
  );
}
