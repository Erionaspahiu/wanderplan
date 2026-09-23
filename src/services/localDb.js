const KEY = "movin_store_v1";

function uid() {
  return crypto.randomUUID();
}

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultStore();
    return JSON.parse(raw);
  } catch {
    return defaultStore();
  }
}

function write(store) {
  localStorage.setItem(KEY, JSON.stringify(store));
  return store;
}

function defaultStore() {
  return { users: [], sessionUserId: null, trips: [], itinerary: [], expenses: [], savedPlaces: [] };
}

export const localDb = {
  getStore: read,
  setStore: write,

  seedIfEmpty(seedFn) {
    const store = read();
    if (store.trips.length === 0 && store.users.length === 0) {
      write(seedFn(store, uid));
    }
  },

  register({ email, password, fullName }) {
    const store = read();
    if (store.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("An account with this email already exists");
    }
    const user = {
      id: uid(),
      email: email.trim().toLowerCase(),
      password,
      full_name: fullName.trim(),
      created_at: new Date().toISOString(),
    };
    store.users.push(user);
    store.sessionUserId = user.id;
    write(store);
    return { id: user.id, email: user.email, user_metadata: { full_name: user.full_name } };
  },

  login({ email, password }) {
    const store = read();
    const user = store.users.find(
      (u) => u.email === email.trim().toLowerCase() && u.password === password
    );
    if (!user) throw new Error("Invalid email or password");
    store.sessionUserId = user.id;
    write(store);
    return { id: user.id, email: user.email, user_metadata: { full_name: user.full_name } };
  },

  logout() {
    const store = read();
    store.sessionUserId = null;
    write(store);
  },

  getSession() {
    const store = read();
    if (!store.sessionUserId) return null;
    const user = store.users.find((u) => u.id === store.sessionUserId);
    if (!user) return null;
    return { id: user.id, email: user.email, user_metadata: { full_name: user.full_name } };
  },

  createTrip(userId, data) {
    const store = read();
    const trip = { id: uid(), user_id: userId, created_at: new Date().toISOString(), ...data };
    store.trips.push(trip);
    write(store);
    return trip;
  },

  getTrips(userId) {
    return read().trips.filter((t) => t.user_id === userId).sort((a, b) => b.start_date.localeCompare(a.start_date));
  },

  getTrip(userId, tripId) {
    return read().trips.find((t) => t.id === tripId && t.user_id === userId) || null;
  },

  updateTrip(userId, tripId, data) {
    const store = read();
    const idx = store.trips.findIndex((t) => t.id === tripId && t.user_id === userId);
    if (idx < 0) throw new Error("Trip not found");
    store.trips[idx] = { ...store.trips[idx], ...data };
    write(store);
    return store.trips[idx];
  },

  deleteTrip(userId, tripId) {
    const store = read();
    store.trips = store.trips.filter((t) => !(t.id === tripId && t.user_id === userId));
    store.itinerary = store.itinerary.filter((i) => !(i.trip_id === tripId && i.user_id === userId));
    store.expenses = store.expenses.filter((e) => !(e.trip_id === tripId && e.user_id === userId));
    store.savedPlaces = store.savedPlaces.filter((p) => !(p.trip_id === tripId && p.user_id === userId));
    write(store);
  },

  listItinerary(userId, tripId) {
    return read()
      .itinerary.filter((i) => i.trip_id === tripId && i.user_id === userId)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""));
  },

  createItineraryItem(userId, data) {
    const store = read();
    const item = { id: uid(), user_id: userId, created_at: new Date().toISOString(), ...data };
    store.itinerary.push(item);
    write(store);
    return item;
  },

  updateItineraryItem(userId, id, data) {
    const store = read();
    const idx = store.itinerary.findIndex((i) => i.id === id && i.user_id === userId);
    if (idx < 0) throw new Error("Item not found");
    store.itinerary[idx] = { ...store.itinerary[idx], ...data };
    write(store);
    return store.itinerary[idx];
  },

  deleteItineraryItem(userId, id) {
    const store = read();
    store.itinerary = store.itinerary.filter((i) => !(i.id === id && i.user_id === userId));
    write(store);
  },

  listExpenses(userId, tripId) {
    return read()
      .expenses.filter((e) => e.trip_id === tripId && e.user_id === userId)
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  createExpense(userId, data) {
    const store = read();
    const expense = { id: uid(), user_id: userId, created_at: new Date().toISOString(), ...data };
    store.expenses.push(expense);
    write(store);
    return expense;
  },

  updateExpense(userId, id, data) {
    const store = read();
    const idx = store.expenses.findIndex((e) => e.id === id && e.user_id === userId);
    if (idx < 0) throw new Error("Expense not found");
    store.expenses[idx] = { ...store.expenses[idx], ...data };
    write(store);
    return store.expenses[idx];
  },

  deleteExpense(userId, id) {
    const store = read();
    store.expenses = store.expenses.filter((e) => !(e.id === id && e.user_id === userId));
    write(store);
  },

  listSavedPlaces(userId, tripId) {
    return read().savedPlaces.filter((p) => p.trip_id === tripId && p.user_id === userId);
  },

  savePlace(userId, data) {
    const store = read();
    const existing = store.savedPlaces.find(
      (p) => p.trip_id === data.trip_id && p.user_id === userId && p.external_id === data.external_id
    );
    if (existing) return existing;
    const place = { id: uid(), user_id: userId, created_at: new Date().toISOString(), ...data };
    store.savedPlaces.push(place);
    write(store);
    return place;
  },

  deleteSavedPlace(userId, id) {
    const store = read();
    store.savedPlaces = store.savedPlaces.filter((p) => !(p.id === id && p.user_id === userId));
    write(store);
  },
};
