import { Bookmark, BookmarkCheck, CalendarPlus, Star, Ticket } from "lucide-react";
import { formatMoney } from "../../utils/currency";
import { getTicketLink, needsTicket } from "../../utils/tickets";
import { useLanguage } from "../../context/LanguageContext";
import Button from "../ui/Button";

export default function PlaceCard({
  place,
  currency = "EUR",
  saved,
  onSave,
  onUnsave,
  onAddToItinerary,
}) {
  const { t } = useLanguage();
  return (
    <article className="place-card">
      <div className="place-media">
        <img
          src={place.image_url || "/images/default-trip.webp"}
          alt={`${place.name}, ${place.location}`}
          loading="lazy"
          decoding="async"
        />
        <span className="place-cat">{t(`categories.place.${place.category}`)}</span>
      </div>
      <div className="place-body">
        <h3>
          {place.name}
          {place.highlight && <span className="must-visit">{t("trip.mustVisit")}</span>}
        </h3>
        <p className="place-loc">{place.location}</p>
        {place.blurb && <p className="place-blurb">{place.blurb}</p>}
        <div className="place-meta">
          {place.rating != null && (
            <span>
              <Star size={14} /> {place.rating}
            </span>
          )}
          {place.estimated_price != null && (
            <span>
              {Number(place.estimated_price) === 0
                ? t("common.free")
                : `~${formatMoney(place.estimated_price, currency)}`}
            </span>
          )}
        </div>
        {needsTicket(place) && (
          <a
            href={getTicketLink(place)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm ticket-link"
          >
            <Ticket size={16} /> {t("places.buyTickets")}
          </a>
        )}
        <div className="place-actions">
          {saved ? (
            <Button variant="ghost" size="sm" onClick={() => onUnsave(place)}>
              <BookmarkCheck size={16} /> {t("places.saved")}
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => onSave(place)}>
              <Bookmark size={16} /> {t("places.save")}
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={() => onAddToItinerary(place)}>
            <CalendarPlus size={16} /> {t("places.add")}
          </Button>
        </div>
      </div>
    </article>
  );
}
