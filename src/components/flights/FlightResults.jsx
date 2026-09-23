import { useMemo, useState } from "react";
import { PlaneLanding } from "lucide-react";
import FlightFilters from "./FlightFilters";
import FlightCard from "./FlightCard";
import { sortOffers, summarizeOffer, googleFlightsUrl } from "../../utils/flightHelpers";
import { useLanguage } from "../../context/LanguageContext";
import EmptyState from "../ui/EmptyState";

function FlightCardSkeleton() {
  return (
    <div className="flight-card flight-card-skeleton">
      <div className="skeleton-line skeleton-w-40" />
      <div className="skeleton-line skeleton-w-full" />
      <div className="skeleton-line skeleton-w-60" />
    </div>
  );
}

export default function FlightResults({
  loading,
  error,
  notConfigured,
  offers,
  originLabel,
  destinationLabel,
  departDateLabel,
  returnDateLabel,
  onSave,
  savingId,
  searched,
}) {
  const { t } = useLanguage();
  const [sortBy, setSortBy] = useState("cheapest");
  const [nonStopOnly, setNonStopOnly] = useState(false);
  const [airlineFilter, setAirlineFilter] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const summarized = useMemo(() => offers.map((o) => summarizeOffer(o)), [offers]);

  const airlines = useMemo(() => {
    const map = new Map();
    summarized.forEach((o) => {
      if (o.airlineCode) map.set(o.airlineCode, o.airlineName);
    });
    return Array.from(map, ([code, name]) => ({ code, name }));
  }, [summarized]);

  const filtered = useMemo(() => {
    let list = summarized;
    if (nonStopOnly) list = list.filter((o) => o.stops === 0);
    if (airlineFilter) list = list.filter((o) => o.airlineCode === airlineFilter);
    if (maxPrice) list = list.filter((o) => o.price <= Number(maxPrice));
    return sortOffers(list, sortBy);
  }, [summarized, nonStopOnly, airlineFilter, maxPrice, sortBy]);

  if (loading) {
    return (
      <div className="flight-results">
        <div className="flight-skeleton-list">
          {[0, 1, 2].map((i) => (
            <FlightCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (notConfigured) {
    return (
      <EmptyState
        icon={PlaneLanding}
        title={t("flights.notConfiguredTitle")}
        description={t("flights.notConfiguredDesc")}
      />
    );
  }

  if (error) {
    return <EmptyState icon={PlaneLanding} title={t("flights.errorTitle")} description={error} />;
  }

  if (!searched) return null;

  if (summarized.length === 0) {
    return (
      <EmptyState icon={PlaneLanding} title={t("flights.noResultsTitle")} description={t("flights.noResultsDesc")} />
    );
  }

  return (
    <div className="flight-results">
      <FlightFilters
        sortBy={sortBy}
        onSortChange={setSortBy}
        nonStopOnly={nonStopOnly}
        onNonStopChange={setNonStopOnly}
        airlines={airlines}
        airlineFilter={airlineFilter}
        onAirlineChange={setAirlineFilter}
        maxPrice={maxPrice}
        onMaxPriceChange={setMaxPrice}
      />
      {filtered.length === 0 ? (
        <EmptyState
          icon={PlaneLanding}
          title={t("flights.noResultsTitle")}
          description={t("flights.noResultsDesc")}
        />
      ) : (
        <div className="flight-list">
          {filtered.map((offer) => (
            <FlightCard
              key={offer.id}
              offer={offer}
              saving={savingId === offer.id}
              onSave={onSave}
              onBook={() =>
                googleFlightsUrl({
                  originLabel,
                  destinationLabel,
                  departDateLabel,
                  returnDateLabel,
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
