import { Link } from "react-router-dom";
import { CalendarDays, Users } from "lucide-react";
import { formatDateRange, daysBetween } from "../../utils/dates";
import { formatMoney, budgetProgress } from "../../utils/currency";
import { countryFlag } from "../../utils/validation";
import Button from "../ui/Button";

export default function TripCard({ trip, spent = 0 }) {
  const progress = budgetProgress(spent, trip.budget);
  const days = daysBetween(trip.start_date, trip.end_date);

  return (
    <article className="trip-card">
      <div
        className="trip-card-media"
        style={{
          backgroundImage: `url(${
            trip.image_url ||
            "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80"
          })`,
        }}
      >
        <span className="trip-card-flag">{countryFlag(trip.country)}</span>
      </div>
      <div className="trip-card-body">
        <h3>
          {trip.destination}, {trip.country}
        </h3>
        <p className="trip-meta">
          <CalendarDays size={14} /> {formatDateRange(trip.start_date, trip.end_date)}
        </p>
        <p className="trip-meta">
          <Users size={14} /> {trip.travelers} traveler{trip.travelers > 1 ? "s" : ""} · {days} days
        </p>
        <div className="budget-mini">
          <div className="budget-mini-row">
            <span>
              {formatMoney(spent, trip.currency)} / {formatMoney(trip.budget, trip.currency)}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <Link to={`/trips/${trip.id}`}>
          <Button variant="secondary" className="w-full">
            View Trip
          </Button>
        </Link>
      </div>
    </article>
  );
}
