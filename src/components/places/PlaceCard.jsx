import { Bookmark, BookmarkCheck, CalendarPlus, Star } from "lucide-react";
import { formatMoney } from "../../utils/currency";
import Button from "../ui/Button";

export default function PlaceCard({
  place,
  currency = "EUR",
  saved,
  onSave,
  onUnsave,
  onAddToItinerary,
}) {
  return (
    <article className="place-card">
      <div
        className="place-media"
        style={{
          backgroundImage: `url(${
            place.image_url ||
            "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80"
          })`,
        }}
      >
        <span className="place-cat">{place.category}</span>
      </div>
      <div className="place-body">
        <h3>
          {place.name}
          {place.highlight && <span className="must-visit">Must visit</span>}
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
                ? "Free"
                : `~${formatMoney(place.estimated_price, currency)}`}
            </span>
          )}
        </div>
        <div className="place-actions">
          {saved ? (
            <Button variant="ghost" size="sm" onClick={() => onUnsave(place)}>
              <BookmarkCheck size={16} /> Saved
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => onSave(place)}>
              <Bookmark size={16} /> Save
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={() => onAddToItinerary(place)}>
            <CalendarPlus size={16} /> Add
          </Button>
        </div>
      </div>
    </article>
  );
}
