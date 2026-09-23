import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Globe2, Plus, Plane, Wallet } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getTrips, updateTrip } from "../services/tripService";
import { getExpenses, summarizeExpenses } from "../services/expenseService";
import { isUpcoming } from "../utils/dates";
import { formatMoney } from "../utils/currency";
import { DEFAULT_TRIP_IMAGE, resolveDestinationPhoto } from "../utils/tripPhoto";
import TripCard from "../components/trips/TripCard";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function Dashboard() {
  const { user, displayName, showToast } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [spentMap, setSpentMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await getTrips(user.id);
        if (!mounted) return;
        setTrips(data);
        const entries = await Promise.all(
          data.map(async (trip) => {
            const expenses = await getExpenses(user.id, trip.id);
            return [trip.id, summarizeExpenses(expenses, trip.budget).spent];
          })
        );
        if (mounted) setSpentMap(Object.fromEntries(entries));

        // Trips created before automatic photos existed are stuck on the
        // generic placeholder — backfill a real one in the background.
        data
          .filter((trip) => !trip.image_url || trip.image_url === DEFAULT_TRIP_IMAGE)
          .forEach(async (trip) => {
            const resolved = await resolveDestinationPhoto(trip.destination, trip.country);
            if (!mounted || !resolved?.url) return;
            const updated = await updateTrip(user.id, trip.id, { image_url: resolved.url });
            if (!mounted) return;
            setTrips((prev) => prev.map((existing) => (existing.id === trip.id ? updated : existing)));
          });
      } catch (err) {
        showToast(err.message || t("dashboard.failedToLoad"), "error");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user.id, showToast, t]);

  const upcoming = trips.filter((t) => isUpcoming(t.start_date)).length;
  const countries = new Set(trips.map((t) => t.country)).size;
  const totalBudget = trips.reduce((sum, t) => sum + Number(t.budget || 0), 0);
  const currency = trips[0]?.currency || "EUR";

  if (loading) {
    return (
      <div className="page-center">
        <LoadingSpinner label={t("dashboard.loading")} />
      </div>
    );
  }

  return (
    <div className="container page">
      <header className="page-header">
        <div>
          <h1>{t("dashboard.welcome", { name: displayName })}</h1>
          <p>{t("dashboard.subtitle")}</p>
        </div>
        <Link to="/trips/new">
          <Button>
            <Plus size={18} /> {t("dashboard.createNewTrip")}
          </Button>
        </Link>
      </header>

      <div className="stats-grid">
        <article className="stat-card card">
          <div className="stat-icon">
            <Plane size={20} />
          </div>
          <p className="stat-label">{t("dashboard.upcomingTrips")}</p>
          <p className="stat-value">{upcoming}</p>
        </article>
        <article className="stat-card card">
          <div className="stat-icon">
            <Globe2 size={20} />
          </div>
          <p className="stat-label">{t("dashboard.countriesVisited")}</p>
          <p className="stat-value">{countries}</p>
        </article>
        <article className="stat-card card">
          <div className="stat-icon">
            <Wallet size={20} />
          </div>
          <p className="stat-label">{t("dashboard.totalPlannedBudget")}</p>
          <p className="stat-value">{formatMoney(totalBudget, currency)}</p>
        </article>
      </div>

      <section className="section-block">
        <div className="section-row">
          <h2>{t("dashboard.yourTrips")}</h2>
        </div>
        {trips.length === 0 ? (
          <EmptyState
            title={t("dashboard.noTripsTitle")}
            description={t("dashboard.noTripsDesc")}
            actionLabel={t("dashboard.createNewTrip")}
            onAction={() => navigate("/trips/new")}
          />
        ) : (
          <div className="trips-grid">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} spent={spentMap[trip.id] || 0} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
