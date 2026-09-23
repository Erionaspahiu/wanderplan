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
import { useLanguage } from "../context/LanguageContext";
import { deleteTrip, getTrip, updateTrip } from "../services/tripService";
import { DEFAULT_TRIP_IMAGE, resolveDestinationPhoto } from "../utils/tripPhoto";
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
import WeatherForecast from "../components/trips/WeatherForecast";
import TransportLinks from "../components/trips/TransportLinks";
import FlightLinks from "../components/trips/FlightLinks";
import FlightsTab from "../components/flights/FlightsTab";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Input from "../components/ui/Input";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Modal, { ConfirmDialog } from "../components/ui/Modal";
import { formatClock } from "../utils/flightHelpers";

const TABS = ["Overview", "Itinerary", "Places", "Flights", "Budget"];
const TAB_KEYS = {
  Overview: "trip.tabs.overview",
  Itinerary: "trip.tabs.itinerary",
  Places: "trip.tabs.places",
  Flights: "trip.tabs.flights",
  Budget: "trip.tabs.budget",
};

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
  const { t } = useLanguage();
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
  const [savingFlightId, setSavingFlightId] = useState(null);

  const loadAll = useCallback(async () => {
    const [tripData, itineraryData, expenseData, savedData] = await Promise.all([
      getTrip(user.id, tripId),
      getItineraryItems(user.id, tripId),
      getExpenses(user.id, tripId),
      getSavedPlaces(user.id, tripId),
    ]);
    if (!tripData) throw new Error(t("trip.notFoundTitle"));
    setTrip(tripData);
    setItems(itineraryData);
    setExpenses(expenseData);
    setSaved(savedData);
  }, [user.id, tripId, t]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await loadAll();
      } catch (err) {
        if (mounted) showToast(err.message || t("trip.failedToLoad"), "error");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [loadAll, showToast, t]);

  // Trips created before automatic photos existed are stuck on the
  // generic placeholder — backfill a real one in the background.
  useEffect(() => {
    if (!trip || (trip.image_url && trip.image_url !== DEFAULT_TRIP_IMAGE)) return undefined;
    let mounted = true;
    (async () => {
      const resolved = await resolveDestinationPhoto(trip.destination, trip.country);
      if (!mounted || !resolved?.url) return;
      const updated = await updateTrip(user.id, tripId, { image_url: resolved.url });
      if (mounted) setTrip(updated);
    })();
    return () => {
      mounted = false;
    };
  }, [trip?.id, trip?.image_url, trip?.destination, trip?.country, user.id, tripId]);

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
        showToast(t("trip.itineraryUpdatedToast"));
      } else {
        await createItineraryItem(user.id, payload);
        showToast(t("trip.itineraryAddedToast"));
      }
      setItineraryOpen(false);
      await loadAll();
    } catch (err) {
      showToast(err.message || t("trip.itinerarySaveFailed"), "error");
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
        showToast(t("trip.expenseUpdatedToast"));
      } else {
        await createExpense(user.id, payload);
        showToast(t("trip.expenseAddedToast"));
      }
      setExpenseOpen(false);
      await loadAll();
    } catch (err) {
      showToast(err.message || t("trip.expenseSaveFailed"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFlight = async (offer) => {
    setSavingFlightId(offer.id);
    try {
      const departDateOnly = offer.departureTime?.slice(0, 10) || trip.start_date;
      const departTimeOnly = offer.departureTime ? formatClock(offer.departureTime) : "";
      const route = `${offer.departureAirport} → ${offer.arrivalAirport}`;

      await createItineraryItem(user.id, {
        trip_id: tripId,
        date: departDateOnly,
        time: departTimeOnly || null,
        title: t("flights.itineraryTitle", { destination: trip.destination }),
        category: "Transport",
        location: route,
        estimated_cost: offer.price,
        notes: offer.airlineName || "",
      });

      await createExpense(user.id, {
        trip_id: tripId,
        description: t("flights.expenseDescription", { route }),
        category: "Transport",
        amount: offer.price,
        date: departDateOnly,
      });

      showToast(t("flights.savedToast"));
      await loadAll();
    } catch (err) {
      showToast(err.message || t("flights.saveFailed"), "error");
    } finally {
      setSavingFlightId(null);
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
      showToast(t("trip.placeSavedToast"));
      await loadAll();
    } catch (err) {
      showToast(err.message || t("trip.placeSaveFailed"), "error");
    }
  };

  const handleUnsavePlace = async (place) => {
    const found = saved.find((s) => s.external_id === place.external_id || s.id === place.id);
    if (!found) return;
    try {
      await removeSavedPlace(user.id, found.id);
      showToast(t("trip.placeRemovedToast"));
      await loadAll();
    } catch (err) {
      showToast(err.message || t("trip.placeRemoveFailed"), "error");
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
        showToast(t("trip.itineraryDeletedToast"));
      } else if (confirm.type === "expense") {
        await deleteExpense(user.id, confirm.id);
        showToast(t("trip.expenseDeletedToast"));
      } else if (confirm.type === "trip") {
        await deleteTrip(user.id, tripId);
        showToast(t("trip.tripDeletedToast"));
        navigate("/dashboard");
        return;
      }
      setConfirm(null);
      await loadAll();
    } catch (err) {
      showToast(err.message || t("trip.deleteFailedToast"), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-center">
        <LoadingSpinner label={t("trip.loading")} />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="container page">
        <EmptyState
          title={t("trip.notFoundTitle")}
          description={t("trip.notFoundDesc")}
          actionLabel={t("trip.backToDashboard")}
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
            <ArrowLeft size={16} /> {t("trip.backToTrips")}
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
              <Users size={16} /> {trip.travelers} {t("trip.travelers")}
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
          {TABS.map((tabName) => (
            <button
              key={tabName}
              type="button"
              role="tab"
              aria-selected={tab === tabName}
              className={`tab ${tab === tabName ? "active" : ""}`}
              onClick={() => setTab(tabName)}
            >
              {t(TAB_KEYS[tabName])}
            </button>
          ))}
        </div>

        {tab === "Overview" && (
          <section className="tab-panel">
            <div className="overview-grid">
              <article className="card">
                <h3>{t("trip.snapshotTitle")}</h3>
                <ul className="snapshot-list">
                  <li>
                    <span>{t("trip.destination")}</span>
                    <strong>
                      {trip.destination}, {trip.country}
                    </strong>
                  </li>
                  <li>
                    <span>{t("trip.dates")}</span>
                    <strong>{formatDateRange(trip.start_date, trip.end_date)}</strong>
                  </li>
                  <li>
                    <span>{t("trip.travelersLabel")}</span>
                    <strong>{trip.travelers}</strong>
                  </li>
                  <li>
                    <span>{t("trip.itineraryItems")}</span>
                    <strong>{items.length}</strong>
                  </li>
                  <li>
                    <span>{t("trip.savedPlaces")}</span>
                    <strong>{saved.length}</strong>
                  </li>
                  <li>
                    <span>{t("trip.expensesLogged")}</span>
                    <strong>{expenses.length}</strong>
                  </li>
                </ul>
              </article>
              <article className="card">
                <h3>{t("trip.nextUpTitle")}</h3>
                {items[0] ? (
                  <div className="next-up">
                    <p className="eyebrow">{formatDate(items[0].date)}</p>
                    <h4>
                      {items[0].time ? `${items[0].time} — ` : ""}
                      {items[0].title}
                    </h4>
                    <p>{items[0].location || t(`categories.itinerary.${items[0].category}`)}</p>
                    <Button variant="secondary" onClick={() => setTab("Itinerary")}>
                      {t("trip.openItinerary")}
                    </Button>
                  </div>
                ) : (
                  <EmptyState
                    title={t("trip.noPlansTitle")}
                    description={t("trip.noPlansDesc")}
                    actionLabel={t("trip.addItem")}
                    onAction={() => {
                      setTab("Itinerary");
                      openCreateItinerary();
                    }}
                  />
                )}
              </article>
            </div>
            <FlightLinks
              destination={trip.destination}
              startDate={trip.start_date}
              endDate={trip.end_date}
            />
            <WeatherForecast
              destination={trip.destination}
              country={trip.country}
              startDate={trip.start_date}
              endDate={trip.end_date}
            />
            <TransportLinks destination={trip.destination} />
            <div className="danger-zone card">
              <div>
                <h3>{t("trip.dangerZoneTitle")}</h3>
                <p>{t("trip.dangerZoneDesc")}</p>
              </div>
              <Button
                variant="danger"
                onClick={() =>
                  setConfirm({
                    type: "trip",
                    id: tripId,
                    title: t("trip.deleteTripConfirmTitle"),
                    message: t("trip.deleteTripConfirmMessage", { destination: trip.destination }),
                  })
                }
              >
                <Trash2 size={16} /> {t("trip.deleteTrip")}
              </Button>
            </div>
          </section>
        )}

        {tab === "Itinerary" && (
          <section className="tab-panel">
            <div className="section-row">
              <h2>{t("trip.dailyItinerary")}</h2>
              <Button onClick={() => openCreateItinerary()}>
                <Plus size={16} /> {t("trip.addItem")}
              </Button>
            </div>
            {grouped.length === 0 ? (
              <EmptyState
                title={t("trip.itineraryEmptyTitle")}
                description={t("trip.itineraryEmptyDesc")}
                actionLabel={t("trip.addFirstItem")}
                onAction={() => openCreateItinerary()}
              />
            ) : (
              <div className="day-list">
                {grouped.map(([date, dayItems], index) => (
                  <div key={date} className="day-block card">
                    <h3>
                      {t("trip.day", {
                        number: dayList.indexOf(date) + 1 || index + 1,
                        date: formatDate(date),
                      })}
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
                              title: t("trip.deleteItineraryConfirmTitle"),
                              message: t("trip.deleteItineraryConfirmMessage", { title: it.title }),
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
                  <p className="eyebrow">{t("trip.mustVisit")}</p>
                  <h2>{t("trip.famousPlacesIn", { destination: trip.destination })}</h2>
                  <p>{t("trip.famousPlacesDesc")}</p>
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
                <p className="muted">{t("trip.noCuratedHighlights")}</p>
              )}
            </div>

            <div className="section-row wrap">
              <div>
                <h2>{t("trip.allPlacesIn", { destination: trip.destination })}</h2>
                <p>{t("trip.allPlacesDesc")}</p>
              </div>
              <Input
                id="place-search"
                placeholder={t("trip.searchPlaces")}
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
                {t("common.all")}
              </button>
              {PLACE_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`chip ${placeFilter === c ? "active" : ""}`}
                  onClick={() => setPlaceFilter(c)}
                >
                  {t(`categories.place.${c}`)}
                </button>
              ))}
            </div>
            {places.length === 0 ? (
              <EmptyState
                title={t("trip.noPlacesFoundTitle", { destination: trip.destination })}
                description={t("trip.noPlacesFoundDesc")}
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
                <h3>{t("trip.savedForThisTrip")}</h3>
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

        {tab === "Flights" && (
          <section className="tab-panel">
            <div className="section-row">
              <h2>{t("flights.tabTitle", { destination: trip.destination })}</h2>
            </div>
            <FlightsTab trip={trip} onSaveFlight={handleSaveFlight} savingId={savingFlightId} />
          </section>
        )}

        {tab === "Budget" && (
          <section className="tab-panel">
            <div className="section-row">
              <h2>{t("trip.budgetTracker")}</h2>
              <Button onClick={openCreateExpense}>
                <Plus size={16} /> {t("trip.addExpense")}
              </Button>
            </div>
            <div className="budget-layout">
              <article className="card">
                <h3>{t("trip.spendingByCategory")}</h3>
                {Object.keys(summary.byCategory).length === 0 ? (
                  <p className="muted">{t("trip.noExpensesYet")}</p>
                ) : (
                  <div className="category-bars">
                    {Object.entries(summary.byCategory).map(([cat, amount]) => (
                      <div key={cat} className="cat-row">
                        <div className="budget-mini-row">
                          <span>{t(`categories.expense.${cat}`)}</span>
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
                <h3>{t("trip.allExpenses")}</h3>
                {expenses.length === 0 ? (
                  <EmptyState
                    title={t("trip.noExpensesLoggedTitle")}
                    description={t("trip.noExpensesLoggedDesc")}
                    actionLabel={t("trip.addExpense")}
                    onAction={openCreateExpense}
                  />
                ) : (
                  <ul className="expense-list">
                    {expenses.map((expense) => (
                      <li key={expense.id} className="expense-row">
                        <div>
                          <strong>{expense.description}</strong>
                          <p>
                            {t(`categories.expense.${expense.category}`)} · {formatDate(expense.date)}
                          </p>
                        </div>
                        <div className="expense-right">
                          <span className="expense-amount">
                            {formatMoney(expense.amount, trip.currency)}
                          </span>
                          <button
                            type="button"
                            className="icon-btn"
                            aria-label={t("trip.editExpense")}
                            onClick={() => openEditExpense(expense)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn danger"
                            aria-label={t("trip.deleteExpense")}
                            onClick={() =>
                              setConfirm({
                                type: "expense",
                                id: expense.id,
                                title: t("trip.deleteExpenseConfirmTitle"),
                                message: t("trip.deleteExpenseConfirmMessage", {
                                  description: expense.description,
                                }),
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
        title={editingItinerary ? t("trip.itineraryModalEdit") : t("trip.itineraryModalAdd")}
        onClose={() => setItineraryOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setItineraryOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={submitItinerary} loading={saving}>
              {t("common.save")}
            </Button>
          </>
        }
      >
        <form className="form-stack" onSubmit={submitItinerary}>
          <div className="form-grid">
            <Input
              id="it-date"
              type="date"
              label={t("trip.fieldDate")}
              value={itineraryForm.date}
              min={trip.start_date}
              max={trip.end_date}
              onChange={(e) => setItineraryForm((f) => ({ ...f, date: e.target.value }))}
              error={itineraryErrors.date && t(itineraryErrors.date)}
            />
            <Input
              id="it-time"
              type="time"
              label={t("trip.fieldTime")}
              value={itineraryForm.time}
              onChange={(e) => setItineraryForm((f) => ({ ...f, time: e.target.value }))}
            />
            <Input
              id="it-title"
              label={t("trip.fieldTitle")}
              value={itineraryForm.title}
              onChange={(e) => setItineraryForm((f) => ({ ...f, title: e.target.value }))}
              error={itineraryErrors.title && t(itineraryErrors.title)}
            />
            <Input
              id="it-category"
              as="select"
              label={t("trip.fieldCategory")}
              value={itineraryForm.category}
              onChange={(e) => setItineraryForm((f) => ({ ...f, category: e.target.value }))}
              error={itineraryErrors.category && t(itineraryErrors.category)}
            >
              {ITINERARY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`categories.itinerary.${c}`)}
                </option>
              ))}
            </Input>
            <Input
              id="it-location"
              label={t("trip.fieldLocation")}
              value={itineraryForm.location}
              onChange={(e) => setItineraryForm((f) => ({ ...f, location: e.target.value }))}
            />
            <Input
              id="it-cost"
              type="number"
              min="0"
              step="1"
              label={t("trip.fieldEstimatedCost")}
              value={itineraryForm.estimated_cost}
              onChange={(e) => setItineraryForm((f) => ({ ...f, estimated_cost: e.target.value }))}
            />
          </div>
          <Input
            id="it-notes"
            as="textarea"
            label={t("trip.fieldNotes")}
            rows={3}
            value={itineraryForm.notes}
            onChange={(e) => setItineraryForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </form>
      </Modal>

      <Modal
        open={expenseOpen}
        title={editingExpense ? t("trip.expenseModalEdit") : t("trip.expenseModalAdd")}
        onClose={() => setExpenseOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setExpenseOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={submitExpense} loading={saving}>
              {t("common.save")}
            </Button>
          </>
        }
      >
        <form className="form-stack" onSubmit={submitExpense}>
          <Input
            id="ex-desc"
            label={t("trip.fieldDescription")}
            value={expenseForm.description}
            onChange={(e) => setExpenseForm((f) => ({ ...f, description: e.target.value }))}
            error={expenseErrors.description && t(expenseErrors.description)}
          />
          <div className="form-grid">
            <Input
              id="ex-cat"
              as="select"
              label={t("trip.fieldCategory")}
              value={expenseForm.category}
              onChange={(e) => setExpenseForm((f) => ({ ...f, category: e.target.value }))}
              error={expenseErrors.category && t(expenseErrors.category)}
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`categories.expense.${c}`)}
                </option>
              ))}
            </Input>
            <Input
              id="ex-amount"
              type="number"
              min="0"
              step="0.01"
              label={t("trip.fieldAmount")}
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))}
              error={expenseErrors.amount && t(expenseErrors.amount)}
            />
            <Input
              id="ex-date"
              type="date"
              label={t("trip.fieldDate")}
              value={expenseForm.date}
              onChange={(e) => setExpenseForm((f) => ({ ...f, date: e.target.value }))}
              error={expenseErrors.date && t(expenseErrors.date)}
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={t("common.delete")}
        onClose={() => setConfirm(null)}
        onConfirm={runConfirm}
        loading={saving}
      />
    </div>
  );
}
