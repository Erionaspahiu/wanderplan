import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Globe2, Plus, Plane, Wallet } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getTrips } from "../services/tripService";
import { getExpenses, summarizeExpenses } from "../services/expenseService";
import { isUpcoming } from "../utils/dates";
import { formatMoney } from "../utils/currency";
import TripCard from "../components/trips/TripCard";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function Dashboard() {
  const { user, displayName, showToast } = useAuth();
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
      } catch (err) {
        showToast(err.message || "Failed to load trips", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user.id, showToast]);

  const upcoming = trips.filter((t) => isUpcoming(t.start_date)).length;
  const countries = new Set(trips.map((t) => t.country)).size;
  const totalBudget = trips.reduce((sum, t) => sum + Number(t.budget || 0), 0);
  const currency = trips[0]?.currency || "EUR";

  if (loading) {
    return (
      <div className="page-center">
        <LoadingSpinner label="Loading your trips..." />
      </div>
    );
  }

  return (
    <div className="container page">
      <header className="page-header">
        <div>
          <h1>Welcome back, {displayName}!</h1>
          <p>Where are we going next?</p>
        </div>
        <Link to="/trips/new">
          <Button>
            <Plus size={18} /> Create New Trip
          </Button>
        </Link>
      </header>

      <div className="stats-grid">
        <article className="stat-card card">
          <div className="stat-icon">
            <Plane size={20} />
          </div>
          <p className="stat-label">Upcoming Trips</p>
          <p className="stat-value">{upcoming}</p>
        </article>
        <article className="stat-card card">
          <div className="stat-icon">
            <Globe2 size={20} />
          </div>
          <p className="stat-label">Countries Visited</p>
          <p className="stat-value">{countries}</p>
        </article>
        <article className="stat-card card">
          <div className="stat-icon">
            <Wallet size={20} />
          </div>
          <p className="stat-label">Total Planned Budget</p>
          <p className="stat-value">{formatMoney(totalBudget, currency)}</p>
        </article>
      </div>

      <section className="section-block">
        <div className="section-row">
          <h2>Your trips</h2>
        </div>
        {trips.length === 0 ? (
          <EmptyState
            title="No trips yet"
            description="Create your first trip and start building an itinerary."
            actionLabel="Create New Trip"
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
