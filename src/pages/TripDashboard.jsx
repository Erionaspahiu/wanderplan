import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { deleteTrip, getTrip } from "../services/tripService";
import {
  createItineraryItem,
  deleteItineraryItem,
  getItineraryItems,
  groupByDay,
  updateItineraryItem,
} from "../services/itineraryService";
import {
  createExpense,
  deleteExpense,
  getExpenses,
  summarizeExpenses,
  updateExpense,
} from "../services/expenseService";
import {
  discoverPlaces,
  getFamousPlaceNames,
  getSavedPlaces,
  removeSavedPlace,
  savePlace,
} from "../services/placesService";
import { EXPENSE_CATEGORIES, ITINERARY_CATEGORIES, PLACE_CATEGORIES } from "../data/demoData";
import { formatDate, formatDateRange, eachDay } from "../utils/dates";
import { formatMoney } from "../utils/currency";
import { countryFlag, validateExpense, validateItineraryItem } from "../utils/validation";
import BudgetCard from "../components/budget/BudgetCard";
import ItineraryItem from "../components/itinerary/ItineraryItem";
import PlaceCard from "../components/places/PlaceCard";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Input from "../components/ui/Input";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Modal, { ConfirmDialog } from "../components/ui/Modal";

const TABS = ["Overview", "Itinerary", "Places", "Budget"];

const emptyItinerary = {
  date: "",
  time: "",
  title: "",
  category: "Activity",
  location: "",
  estimated_cost: "",
  notes: "",
};

const emptyExpense = {
  description: "",
  category: "Food",
  amount: "",
  date: "",
};

export default function TripDashboard() {
  const { tripId } = useParams();
  const { user, showToast } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [items, setItems] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [saved, setSaved] = useState([]);
  const [places, setPlaces] = useState([]);
  const [famousPlaces, setFamousPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Overview");
  const [placeFilter, setPlaceFilter] = useState("All");
  const [placeQuery, setPlaceQuery] = useState("");

  const [itineraryOpen, setItineraryOpen] = useState(false);
  const [itineraryForm, setItineraryForm] = useState(emptyItinerary);
  const [itineraryErrors, setItineraryErrors] = useState({});
  const [editingItinerary, setEditingItinerary] = useState(null);

  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState(emptyExpense);
  const [expenseErrors, setExpenseErrors] = useState({});
  const [editingExpense, setEditingExpense] = useState(null);

  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadAll = useCallback(async () => {
    const [tripData, itineraryData, expenseData, savedData] = await Promise.all([
      getTrip(user.id, tripId),
      getItineraryItems(user.id, tripId),
      getExpenses(user.id, tripId),
      getSavedPlaces(user.id, tripId),
    ]);
    if (!tripData) throw new Error("Trip not found");
    setTrip(tripData);
    setItems(itineraryData);
    setExpenses(expenseData);
    setSaved(savedData);
  }, [user.id, tripId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await loadAll();
      } catch (err) {
        if (mounted) showToast(err.message || "Failed to load trip", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [loadAll, showToast]);

  useEffect(() => {
    if (!trip) return undefined;
    let mounted = true;
    (async () => {
      const [results, highlights] = await Promise.all([
        discoverPlaces({
          destination: trip.destination,
          category: placeFilter,
          query: placeQuery,
        }),
        discoverPlaces({
          destination: trip.destination,
          highlightsOnly: true,
        }),
      ]);
      if (mounted) {
        setPlaces(results);
        setFamousPlaces(highlights);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [trip, placeFilter, placeQuery]);

  const summary = useMemo(
    () => summarizeExpenses(expenses, trip?.budget || 0),
    [expenses, trip]
  );
  const grouped = useMemo(() => groupByDay(items), [items]);
  const dayList = trip ? eachDay(trip.start_date, trip.end_date) : [];
  const savedIds = useMemo(() => new Set(saved.map((s) => s.external_id)), [saved]);

  const openCreateItinerary = (preset = {}) => {
    setEditingItinerary(null);
    setItineraryForm({
      ...emptyItinerary,
      date: trip?.start_date || "",
      ...preset,
    });
    setItineraryErrors({});
    setItineraryOpen(true);
  };

  const openEditItinerary = (item) => {
    setEditingItinerary(item);
    setItineraryForm({
      date: item.date,
      time: item.time || "",
      title: item.title,
      category: item.category,
      location: item.location || "",
      estimated_cost: item.estimated_cost ?? "",
      notes: item.notes || "",
    });
    setItineraryErrors({});
    setItineraryOpen(true);
  };

  const submitItinerary = async (e) => {
    e.preventDefault();
    const errs = validateItineraryItem(itineraryForm);
    setItineraryErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      const payload = {
        trip_id: tripId,
        date: itineraryForm.date,
        time: itineraryForm.time || null,
        title: itineraryForm.title.trim(),
        category: itineraryForm.category,
        location: itineraryForm.location.trim() || null,
        estimated_cost: Number(itineraryForm.estimated_cost) || 0,
        notes: itineraryForm.notes.trim() || null,
      };
      if (editingItinerary) {
        await updateItineraryItem(user.id, editingItinerary.id, payload);
        showToast("Itinerary item updated");
      } else {
        await createItineraryItem(user.id, payload);
        showToast("Itinerary item added");
      }
      setItineraryOpen(false);
      await loadAll();
    } catch (err) {
      showToast(err.message || "Could not save item", "error");
    } finally {
      setSaving(false);
    }
  };

  const openCreateExpense = () => {
    setEditingExpense(null);
    setExpenseForm({ ...emptyExpense, date: trip?.start_date || "" });
    setExpenseErrors({});
    setExpenseOpen(true);
  };

  const openEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      description: expense.description,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
    });
    setExpenseErrors({});
    setExpenseOpen(true);
  };

  const submitExpense = async (e) => {
    e.preventDefault();
    const errs = validateExpense(expenseForm);
    setExpenseErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      const payload = {
        trip_id: tripId,
        description: expenseForm.description.trim(),
        category: expenseForm.category,
        amount: Number(expenseForm.amount),
        date: expenseForm.date,
      };
      if (editingExpense) {
        await updateExpense(user.id, editingExpense.id, payload);
        showToast("Expense updated");
      } else {
        await createExpense(user.id, payload);
        showToast("Expense added");
      }
      setExpenseOpen(false);
      await loadAll();
    } catch (err) {
      showToast(err.message || "Could not save expense", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePlace = async (place) => {
    try {
      await savePlace(user.id, {
        trip_id: tripId,
        name: place.name,
        category: place.category,
        location: place.location,
        rating: place.rating,
        estimated_price: place.estimated_price,
        image_url: place.image_url,
        external_id: place.external_id,
      });
      showToast("Place saved");
      await loadAll();
    } catch (err) {
      showToast(err.message || "Could not save place", "error");
    }
  };

  const handleUnsavePlace = async (place) => {
    const found = saved.find((s) => s.external_id === place.external_id || s.id === place.id);
    if (!found) return;
    try {
      await removeSavedPlace(user.id, found.id);
      showToast("Removed from saved");
      await loadAll();
    } catch (err) {
      showToast(err.message || "Could not remove place", "error");
    }
  };

  const handleAddPlaceToItinerary = (place) => {
    setTab("Itinerary");
    openCreateItinerary({
      title: place.name,
      location: place.location,
      category: place.category === "Restaurants" || place.category === "Cafés" ? "Food" : "Activity",
      estimated_cost: place.estimated_price || "",
    });
  };

  const runConfirm = async () => {
    if (!confirm) return;
    setSaving(true);
    try {
      if (confirm.type === "itinerary") {
        await deleteItineraryItem(user.id, confirm.id);
        showToast("Item deleted");
      } else if (confirm.type === "expense") {
        await deleteExpense(user.id, confirm.id);
        showToast("Expense deleted");
      } else if (confirm.type === "trip") {
        await deleteTrip(user.id, tripId);
        showToast("Trip deleted");
        navigate("/dashboard");
        return;
      }
      setConfirm(null);
      await loadAll();
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-center">
        <LoadingSpinner label="Loading trip..." />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="container page">
        <EmptyState
          title="Trip not found"
          description="This trip may have been deleted."
          actionLabel="Back to dashboard"
          onAction={() => navigate("/dashboard")}
        />
      </div>
    );
  }

  const maxCategory = Math.max(...Object.values(summary.byCategory), 1);

  return (
    <div className="trip-page">
      <div
        className="trip-hero"
        style={{
          backgroundImage: `url(${trip.image_url})`,
        }}
      >
        <div className="trip-hero-overlay" />
        <div className="container trip-hero-content">
          <Link to="/dashboard" className="back-link">
            <ArrowLeft size={16} /> Back to trips
          </Link>
          <p className="trip-flag">
            {countryFlag(trip.country)} {trip.country}
          </p>
          <h1>
            {trip.destination}, {trip.country}
          </h1>
          <div className="trip-hero-meta">
            <span>
              <CalendarDays size={16} /> {formatDateRange(trip.start_date, trip.end_date)}
            </span>
            <span>
              <Users size={16} /> {trip.travelers} travelers
            </span>
          </div>
        </div>
      </div>

      <div className="container page trip-body">
        <BudgetCard
          budget={trip.budget}
          spent={summary.spent}
          remaining={summary.remaining}
          currency={trip.currency}
        />

        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              className={`tab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Overview" && (
          <section className="tab-panel">
            <div className="overview-grid">
              <article className="card">
                <h3>Trip snapshot</h3>
                <ul className="snapshot-list">
                  <li>
                    <span>Destination</span>
                    <strong>
                      {trip.destination}, {trip.country}
                    </strong>
                  </li>
                  <li>
                    <span>Dates</span>
                    <strong>{formatDateRange(trip.start_date, trip.end_date)}</strong>
                  </li>
                  <li>
                    <span>Travelers</span>
                    <strong>{trip.travelers}</strong>
                  </li>
                  <li>
                    <span>Itinerary items</span>
                    <strong>{items.length}</strong>
                  </li>
                  <li>
                    <span>Saved places</span>
                    <strong>{saved.length}</strong>
                  </li>
                  <li>
                    <span>Expenses logged</span>
                    <strong>{expenses.length}</strong>
                  </li>
                </ul>
              </article>
              <article className="card">
                <h3>Next up</h3>
                {items[0] ? (
                  <div className="next-up">
                    <p className="eyebrow">{formatDate(items[0].date)}</p>
                    <h4>
                      {items[0].time ? `${items[0].time} — ` : ""}
                      {items[0].title}
                    </h4>
                    <p>{items[0].location || items[0].category}</p>
                    <Button variant="secondary" onClick={() => setTab("Itinerary")}>
                      Open itinerary
                    </Button>
                  </div>
                ) : (
                  <EmptyState
                    title="No plans yet"
                    description="Add your first itinerary item to get started."
                    actionLabel="Add item"
                    onAction={() => {
                      setTab("Itinerary");
                      openCreateItinerary();
                    }}
                  />
                )}
              </article>
            </div>
            <div className="danger-zone card">
              <div>
                <h3>Delete trip</h3>
                <p>This permanently removes the trip, itinerary, places and expenses.</p>
              </div>
              <Button
                variant="danger"
                onClick={() =>
                  setConfirm({
                    type: "trip",
                    id: tripId,
                    title: "Delete this trip?",
                    message: `Delete ${trip.destination}? This cannot be undone.`,
                  })
                }
              >
                <Trash2 size={16} /> Delete trip
              </Button>
            </div>
          </section>
        )}

        {tab === "Itinerary" && (
          <section className="tab-panel">
            <div className="section-row">
              <h2>Daily itinerary</h2>
              <Button onClick={() => openCreateItinerary()}>
                <Plus size={16} /> Add item
              </Button>
            </div>
            {grouped.length === 0 ? (
              <EmptyState
                title="Your itinerary is empty"
                description="Plan each day with activities, meals and transport."
                actionLabel="Add first item"
                onAction={() => openCreateItinerary()}
              />
            ) : (
              <div className="day-list">
                {grouped.map(([date, dayItems], index) => (
                  <div key={date} className="day-block card">
                    <h3>
                      Day {dayList.indexOf(date) + 1 || index + 1} — {formatDate(date)}
                    </h3>
                    <div className="day-items">
                      {dayItems.map((item) => (
                        <ItineraryItem
                          key={item.id}
                          item={item}
                          currency={trip.currency}
                          onEdit={openEditItinerary}
                          onDelete={(it) =>
                            setConfirm({
                              type: "itinerary",
                              id: it.id,
                              title: "Delete itinerary item?",
                              message: `Remove “${it.title}” from your plan?`,
                            })
                          }
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "Places" && (
          <section className="tab-panel">
            <div className="famous-panel card">
              <div className="famous-panel-header">
                <div>
                  <p className="eyebrow">Must visit</p>
                  <h2>Famous places in {trip.destination}</h2>
                  <p>
                    Top sights travelers usually put on their list — save them or add them straight
                    to your itinerary.
                  </p>
                </div>
              </div>
              {getFamousPlaceNames(trip.destination, trip.country).length > 0 && (
                <ul className="famous-chip-list">
                  {getFamousPlaceNames(trip.destination, trip.country).map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              )}
              {famousPlaces.length > 0 ? (
                <div className="places-grid famous-grid">
                  {famousPlaces.map((place) => (
                    <PlaceCard
                      key={`famous-${place.external_id}`}
                      place={place}
                      currency={trip.currency}
                      saved={savedIds.has(place.external_id)}
                      onSave={handleSavePlace}
                      onUnsave={handleUnsavePlace}
                      onAddToItinerary={handleAddPlaceToItinerary}
                    />
                  ))}
                </div>
              ) : (
                <p className="muted">
                  No curated highlights yet for this destination — browse all places below.
                </p>
              )}
            </div>

            <div className="section-row wrap">
              <div>
                <h2>All places in {trip.destination}</h2>
                <p>Hotels, restaurants, attractions and more for this trip.</p>
              </div>
              <Input
                id="place-search"
                placeholder="Search places..."
                value={placeQuery}
                onChange={(e) => setPlaceQuery(e.target.value)}
                className="search-field"
              />
            </div>
            <div className="chip-row">
              <button
                type="button"
                className={`chip ${placeFilter === "All" ? "active" : ""}`}
                onClick={() => setPlaceFilter("All")}
              >
                All
              </button>
              {PLACE_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`chip ${placeFilter === c ? "active" : ""}`}
                  onClick={() => setPlaceFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            {places.length === 0 ? (
              <EmptyState
                title={`No places found for ${trip.destination}`}
                description="Try another category, clear your search, or add your own spots to the itinerary."
              />
            ) : (
              <div className="places-grid">
                {places.map((place) => (
                  <PlaceCard
                    key={place.external_id}
                    place={place}
                    currency={trip.currency}
                    saved={savedIds.has(place.external_id)}
                    onSave={handleSavePlace}
                    onUnsave={handleUnsavePlace}
                    onAddToItinerary={handleAddPlaceToItinerary}
                  />
                ))}
              </div>
            )}
            {saved.length > 0 && (
              <div className="section-block">
                <h3>Saved for this trip</h3>
                <div className="places-grid">
                  {saved.map((place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      currency={trip.currency}
                      saved
                      onSave={handleSavePlace}
                      onUnsave={handleUnsavePlace}
                      onAddToItinerary={handleAddPlaceToItinerary}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {tab === "Budget" && (
          <section className="tab-panel">
            <div className="section-row">
              <h2>Budget tracker</h2>
              <Button onClick={openCreateExpense}>
                <Plus size={16} /> Add expense
              </Button>
            </div>
            <div className="budget-layout">
              <article className="card">
                <h3>Spending by category</h3>
                {Object.keys(summary.byCategory).length === 0 ? (
                  <p className="muted">No expenses yet.</p>
                ) : (
                  <div className="category-bars">
                    {Object.entries(summary.byCategory).map(([cat, amount]) => (
                      <div key={cat} className="cat-row">
                        <div className="budget-mini-row">
                          <span>{cat}</span>
                          <span>{formatMoney(amount, trip.currency)}</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${(amount / maxCategory) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
              <article className="card">
                <h3>All expenses</h3>
                {expenses.length === 0 ? (
                  <EmptyState
                    title="No expenses logged"
                    description="Track hotels, food, transport and more."
                    actionLabel="Add expense"
                    onAction={openCreateExpense}
                  />
                ) : (
                  <ul className="expense-list">
                    {expenses.map((expense) => (
                      <li key={expense.id} className="expense-row">
                        <div>
                          <strong>{expense.description}</strong>
                          <p>
                            {expense.category} · {formatDate(expense.date)}
                          </p>
                        </div>
                        <div className="expense-right">
                          <span className="expense-amount">
                            {formatMoney(expense.amount, trip.currency)}
                          </span>
                          <button
                            type="button"
                            className="icon-btn"
                            aria-label="Edit expense"
                            onClick={() => openEditExpense(expense)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn danger"
                            aria-label="Delete expense"
                            onClick={() =>
                              setConfirm({
                                type: "expense",
                                id: expense.id,
                                title: "Delete expense?",
                                message: `Remove “${expense.description}”?`,
                              })
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </div>
          </section>
        )}
      </div>

      <Modal
        open={itineraryOpen}
        title={editingItinerary ? "Edit itinerary item" : "Add itinerary item"}
        onClose={() => setItineraryOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setItineraryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitItinerary} loading={saving}>
              Save
            </Button>
          </>
        }
      >
        <form className="form-stack" onSubmit={submitItinerary}>
          <div className="form-grid">
            <Input
              id="it-date"
              type="date"
              label="Date"
              value={itineraryForm.date}
              min={trip.start_date}
              max={trip.end_date}
              onChange={(e) => setItineraryForm((f) => ({ ...f, date: e.target.value }))}
              error={itineraryErrors.date}
            />
            <Input
              id="it-time"
              type="time"
              label="Time"
              value={itineraryForm.time}
              onChange={(e) => setItineraryForm((f) => ({ ...f, time: e.target.value }))}
            />
            <Input
              id="it-title"
              label="Title"
              value={itineraryForm.title}
              onChange={(e) => setItineraryForm((f) => ({ ...f, title: e.target.value }))}
              error={itineraryErrors.title}
            />
            <Input
              id="it-category"
              as="select"
              label="Category"
              value={itineraryForm.category}
              onChange={(e) => setItineraryForm((f) => ({ ...f, category: e.target.value }))}
              error={itineraryErrors.category}
            >
              {ITINERARY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Input>
            <Input
              id="it-location"
              label="Location"
              value={itineraryForm.location}
              onChange={(e) => setItineraryForm((f) => ({ ...f, location: e.target.value }))}
            />
            <Input
              id="it-cost"
              type="number"
              min="0"
              step="1"
              label="Estimated cost"
              value={itineraryForm.estimated_cost}
              onChange={(e) => setItineraryForm((f) => ({ ...f, estimated_cost: e.target.value }))}
            />
          </div>
          <Input
            id="it-notes"
            as="textarea"
            label="Notes"
            rows={3}
            value={itineraryForm.notes}
            onChange={(e) => setItineraryForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </form>
      </Modal>

      <Modal
        open={expenseOpen}
        title={editingExpense ? "Edit expense" : "Add expense"}
        onClose={() => setExpenseOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setExpenseOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitExpense} loading={saving}>
              Save
            </Button>
          </>
        }
      >
        <form className="form-stack" onSubmit={submitExpense}>
          <Input
            id="ex-desc"
            label="Description"
            value={expenseForm.description}
            onChange={(e) => setExpenseForm((f) => ({ ...f, description: e.target.value }))}
            error={expenseErrors.description}
          />
          <div className="form-grid">
            <Input
              id="ex-cat"
              as="select"
              label="Category"
              value={expenseForm.category}
              onChange={(e) => setExpenseForm((f) => ({ ...f, category: e.target.value }))}
              error={expenseErrors.category}
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Input>
            <Input
              id="ex-amount"
              type="number"
              min="0"
              step="0.01"
              label="Amount"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))}
              error={expenseErrors.amount}
            />
            <Input
              id="ex-date"
              type="date"
              label="Date"
              value={expenseForm.date}
              onChange={(e) => setExpenseForm((f) => ({ ...f, date: e.target.value }))}
              error={expenseErrors.date}
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title}
        message={confirm?.message}
        onClose={() => setConfirm(null)}
        onConfirm={runConfirm}
        loading={saving}
      />
    </div>
  );
}
