import { useState } from "react";
import { BookmarkPlus, ExternalLink, PlaneTakeoff } from "lucide-react";
import { formatClock, formatDuration, airlineLogoUrl } from "../../utils/flightHelpers";
import { formatMoney } from "../../utils/currency";
import { useLanguage } from "../../context/LanguageContext";
import Button from "../ui/Button";

function Leg({ fromCode, toCode, departTime, arriveTime, duration, stops, t }) {
  return (
    <div className="flight-leg">
      <div className="flight-leg-times">
        <div>
          <strong>{formatClock(departTime)}</strong>
          <span>{fromCode}</span>
        </div>
        <div className="flight-leg-path">
          <span className="flight-duration">{formatDuration(duration)}</span>
          <div className="flight-leg-line">
            <PlaneTakeoff size={14} />
          </div>
          <span className="flight-stops">
            {stops === 0 ? t("flights.nonstop") : stops === 1 ? t("flights.stop") : t("flights.stops", { count: stops })}
          </span>
        </div>
        <div>
          <strong>{formatClock(arriveTime)}</strong>
          <span>{toCode}</span>
        </div>
      </div>
    </div>
  );
}

export default function FlightCard({ offer, onBook, onSave, saving }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const logo = airlineLogoUrl(offer.airlineCode);

  return (
    <article className="flight-card">
      <div className="flight-card-main">
        <div className="flight-airline">
          {logo && (
            <img
              src={logo}
              alt=""
              className="flight-airline-logo"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <span>{offer.airlineName}</span>
        </div>

        <Leg
          fromCode={offer.departureAirport}
          toCode={offer.arrivalAirport}
          departTime={offer.departureTime}
          arriveTime={offer.arrivalTime}
          duration={offer.duration}
          stops={offer.stops}
          t={t}
        />

        <div className="flight-price">
          <strong>{formatMoney(offer.price, offer.currency)}</strong>
        </div>
      </div>

      {offer.isRoundTrip && (
        <button type="button" className="flight-expand-toggle" onClick={() => setExpanded((v) => !v)}>
          {expanded ? t("flights.hideReturn") : t("flights.showReturn")}
        </button>
      )}

      {expanded && offer.isRoundTrip && (
        <Leg
          fromCode={offer.arrivalAirport}
          toCode={offer.departureAirport}
          departTime={offer.returnDepartureTime}
          arriveTime={offer.returnArrivalTime}
          duration={offer.returnDuration}
          stops={0}
          t={t}
        />
      )}

      <div className="flight-card-actions">
        {onSave && (
          <Button variant="ghost" size="sm" onClick={() => onSave(offer)} loading={saving}>
            <BookmarkPlus size={16} /> {t("flights.saveToTrip")}
          </Button>
        )}
        <a href={onBook(offer)} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
          <ExternalLink size={16} /> {t("flights.book")}
        </a>
      </div>
    </article>
  );
}
