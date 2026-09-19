export const ITINERARY_CATEGORIES = [
  "Food",
  "Activity",
  "Hotel",
  "Transport",
  "Shopping",
  "Other",
];

export const EXPENSE_CATEGORIES = [
  "Accommodation",
  "Food",
  "Transport",
  "Activities",
  "Shopping",
  "Other",
];

export const PLACE_CATEGORIES = [
  "Hotels",
  "Restaurants",
  "Attractions",
  "Cafés",
  "Beaches",
];

export const CURRENCIES = ["EUR", "USD", "GBP"];

export const DESTINATIONS = [
  {
    name: "Sicily",
    country: "Italy",
    image:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80",
    famousPlaces: [
      "Mount Etna",
      "Taormina Greek Theatre",
      "Valley of the Temples",
      "Ortygia (Syracuse)",
      "Scala dei Turchi",
    ],
  },
  {
    name: "Paris",
    country: "France",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
    famousPlaces: [
      "Eiffel Tower",
      "Louvre Museum",
      "Notre-Dame",
      "Montmartre",
      "Seine River Cruise",
    ],
  },
  {
    name: "Barcelona",
    country: "Spain",
    image:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80",
    famousPlaces: [
      "Sagrada Família",
      "Park Güell",
      "La Rambla",
      "Gothic Quarter",
      "Barceloneta Beach",
    ],
  },
  {
    name: "Santorini",
    country: "Greece",
    image:
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=800&q=80",
    famousPlaces: [
      "Oia Sunset",
      "Fira Town",
      "Red Beach",
      "Ancient Akrotiri",
      "Amoudi Bay",
    ],
  },
  {
    name: "Rome",
    country: "Italy",
    image:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
    famousPlaces: [
      "Colosseum",
      "Vatican Museums",
      "Trevi Fountain",
      "Roman Forum",
      "Pantheon",
    ],
  },
  {
    name: "London",
    country: "United Kingdom",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
    famousPlaces: [
      "Big Ben & Westminster",
      "Tower of London",
      "British Museum",
      "Camden Market",
      "Hyde Park",
    ],
  },
];

/** Find destination guide by trip destination/country name */
export function findDestinationGuide(destination = "", country = "") {
  const dest = destination.toLowerCase().trim();
  const ctry = country.toLowerCase().trim();
  return (
    DESTINATIONS.find(
      (d) =>
        d.name.toLowerCase() === dest ||
        dest.includes(d.name.toLowerCase()) ||
        d.name.toLowerCase().includes(dest)
    ) ||
    DESTINATIONS.find((d) => d.country.toLowerCase() === ctry) ||
    null
  );
}

/**
 * Mock places catalog keyed by destination.
 * Replace discoverPlaces() later with Google Places / Foursquare.
 */
export const MOCK_PLACES = [
  // —— Sicily ——
  {
    external_id: "sicily-hotel-1",
    destination: "Sicily",
    name: "Hotel Villa Carlotta",
    category: "Hotels",
    location: "Taormina, Sicily",
    rating: 4.7,
    estimated_price: 140,
    image_url:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    highlight: false,
  },
  {
    external_id: "sicily-hotel-2",
    destination: "Sicily",
    name: "Palace Catania",
    category: "Hotels",
    location: "Catania, Sicily",
    rating: 4.4,
    estimated_price: 95,
    image_url:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
    highlight: false,
  },
  {
    external_id: "sicily-rest-1",
    destination: "Sicily",
    name: "Trattoria da Nino",
    category: "Restaurants",
    location: "Catania, Sicily",
    rating: 4.8,
    estimated_price: 35,
    image_url:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    highlight: false,
  },
  {
    external_id: "sicily-rest-2",
    destination: "Sicily",
    name: "Osteria Nero D’Avola",
    category: "Restaurants",
    location: "Syracuse, Sicily",
    rating: 4.6,
    estimated_price: 45,
    image_url:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    highlight: false,
  },
  {
    external_id: "sicily-attr-1",
    destination: "Sicily",
    name: "Mount Etna",
    category: "Attractions",
    location: "Catania Province, Sicily",
    rating: 4.9,
    estimated_price: 55,
    image_url:
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80",
    highlight: true,
    blurb: "Europe’s most active volcano — jeep tours and crater views.",
  },
  {
    external_id: "sicily-attr-2",
    destination: "Sicily",
    name: "Greek Theatre of Taormina",
    category: "Attractions",
    location: "Taormina, Sicily",
    rating: 4.8,
    estimated_price: 12,
    image_url:
      "https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?auto=format&fit=crop&w=800&q=80",
    highlight: true,
    blurb: "Ancient theatre with views of the coast and Mount Etna.",
  },
  {
    external_id: "sicily-attr-3",
    destination: "Sicily",
    name: "Valley of the Temples",
    category: "Attractions",
    location: "Agrigento, Sicily",
    rating: 4.8,
    estimated_price: 15,
    image_url:
      "https://images.unsplash.com/photo-1555881403-946a14068e07?auto=format&fit=crop&w=800&q=80",
    highlight: true,
    blurb: "UNESCO Greek ruins stretching across golden hills.",
  },
  {
    external_id: "sicily-attr-4",
    destination: "Sicily",
    name: "Ortygia Island",
    category: "Attractions",
    location: "Syracuse, Sicily",
    rating: 4.7,
    estimated_price: 0,
    image_url:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80",
    highlight: true,
    blurb: "Historic island old town with piazzas, markets and sea views.",
  },
  {
    external_id: "sicily-cafe-1",
    destination: "Sicily",
    name: "Caffè Sicilia",
    category: "Cafés",
    location: "Noto, Sicily",
    rating: 4.7,
    estimated_price: 12,
    image_url:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
    highlight: false,
  },
  {
    external_id: "sicily-cafe-2",
    destination: "Sicily",
    name: "Pasticceria Savia",
    category: "Cafés",
    location: "Catania, Sicily",
    rating: 4.5,
    estimated_price: 8,
    image_url:
      "https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=800&q=80",
    highlight: false,
  },
  {
    external_id: "sicily-beach-1",
    destination: "Sicily",
    name: "Isola Bella",
    category: "Beaches",
    location: "Taormina, Sicily",
    rating: 4.6,
    estimated_price: 0,
    image_url:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    highlight: false,
  },
  {
    external_id: "sicily-beach-2",
    destination: "Sicily",
    name: "Scala dei Turchi",
    category: "Beaches",
    location: "Realmonte, Sicily",
    rating: 4.8,
    estimated_price: 0,
    image_url:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    highlight: true,
    blurb: "White cliff staircase dropping into turquoise water.",
  },

  // —— Paris ——
  {
    external_id: "paris-attr-1",
    destination: "Paris",
    name: "Eiffel Tower",
    category: "Attractions",
    location: "Champ de Mars, Paris",
    rating: 4.7,
    estimated_price: 30,
    image_url:
      "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80",
    highlight: true,
    blurb: "Iconic iron tower — book summit tickets early.",
  },
  {
    external_id: "paris-attr-2",
    destination: "Paris",
    name: "Louvre Museum",
    category: "Attractions",
    location: "1st Arrondissement, Paris",
    rating: 4.8,
    estimated_price: 22,
    image_url:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
    highlight: true,
    blurb: "Home of the Mona Lisa and world-class collections.",
  },
  {
    external_id: "paris-attr-3",
    destination: "Paris",
    name: "Montmartre & Sacré-Cœur",
    category: "Attractions",
    location: "Montmartre, Paris",
    rating: 4.7,
    estimated_price: 0,
    image_url:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
    highlight: true,
    blurb: "Hilltop basilica, artists’ square and city panoramas.",
  },
  {
    external_id: "paris-rest-1",
    destination: "Paris",
    name: "Le Comptoir du Relais",
    category: "Restaurants",
    location: "Saint-Germain, Paris",
    rating: 4.6,
    estimated_price: 55,
    image_url:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    highlight: false,
  },
  {
    external_id: "paris-cafe-1",
    destination: "Paris",
    name: "Café de Flore",
    category: "Cafés",
    location: "Saint-Germain, Paris",
    rating: 4.4,
    estimated_price: 18,
    image_url:
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=800&q=80",
    highlight: false,
  },
  {
    external_id: "paris-hotel-1",
    destination: "Paris",
    name: "Hôtel des Grands Boulevards",
    category: "Hotels",
    location: "2nd Arrondissement, Paris",
    rating: 4.6,
    estimated_price: 220,
    image_url:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    highlight: false,
  },

  // —— Barcelona ——
  {
    external_id: "bcn-attr-1",
    destination: "Barcelona",
    name: "Sagrada Família",
    category: "Attractions",
    location: "Eixample, Barcelona",
    rating: 4.8,
    estimated_price: 26,
    image_url:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80",
    highlight: true,
    blurb: "Gaudí’s unfinished masterpiece — reserve timed entry.",
  },
  {
    external_id: "bcn-attr-2",
    destination: "Barcelona",
    name: "Park Güell",
    category: "Attractions",
    location: "Gràcia, Barcelona",
    rating: 4.6,
    estimated_price: 10,
    image_url:
      "https://images.unsplash.com/photo-1562883676-8c7feb83f09b?auto=format&fit=crop&w=800&q=80",
    highlight: true,
    blurb: "Colorful mosaics and city views in a Gaudí park.",
  },
  {
    external_id: "bcn-attr-3",
    destination: "Barcelona",
    name: "Gothic Quarter",
    category: "Attractions",
    location: "Ciutat Vella, Barcelona",
    rating: 4.7,
    estimated_price: 0,
    image_url:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80",
    highlight: true,
    blurb: "Medieval lanes, plazas and hidden courtyards.",
  },
  {
    external_id: "bcn-beach-1",
    destination: "Barcelona",
    name: "Barceloneta Beach",
    category: "Beaches",
    location: "Barceloneta, Barcelona",
    rating: 4.3,
    estimated_price: 0,
    image_url:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    highlight: true,
    blurb: "City beach for a swim after sightseeing.",
  },
  {
    external_id: "bcn-rest-1",
    destination: "Barcelona",
    name: "Cervecería Catalana",
    category: "Restaurants",
    location: "Eixample, Barcelona",
    rating: 4.6,
    estimated_price: 35,
    image_url:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    highlight: false,
  },
  {
    external_id: "bcn-cafe-1",
    destination: "Barcelona",
    name: "Satan’s Coffee Corner",
    category: "Cafés",
    location: "Gothic Quarter, Barcelona",
    rating: 4.5,
    estimated_price: 8,
    image_url:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
    highlight: false,
  },

  // —— Santorini ——
  {
    external_id: "san-attr-1",
    destination: "Santorini",
    name: "Oia Sunset Viewpoint",
    category: "Attractions",
    location: "Oia, Santorini",
    rating: 4.9,
    estimated_price: 0,
    image_url:
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=800&q=80",
    highlight: true,
    blurb: "World-famous caldera sunset over whitewashed houses.",
  },
  {
    external_id: "san-attr-2",
    destination: "Santorini",
    name: "Ancient Akrotiri",
    category: "Attractions",
    location: "Akrotiri, Santorini",
    rating: 4.6,
    estimated_price: 12,
    image_url:
      "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?auto=format&fit=crop&w=800&q=80",
    highlight: true,
    blurb: "Pompeii of the Aegean — Bronze Age ruins under ash.",
  },
  {
    external_id: "san-beach-1",
    destination: "Santorini",
    name: "Red Beach",
    category: "Beaches",
    location: "Akrotiri, Santorini",
    rating: 4.4,
    estimated_price: 0,
    image_url:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    highlight: true,
    blurb: "Dramatic red cliffs meeting the Aegean.",
  },
  {
    external_id: "san-rest-1",
    destination: "Santorini",
    name: "Ammoudi Fish Taverna",
    category: "Restaurants",
    location: "Amoudi Bay, Santorini",
    rating: 4.7,
    estimated_price: 45,
    image_url:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    highlight: false,
  },
  {
    external_id: "san-hotel-1",
    destination: "Santorini",
    name: "Canaves Oia Hotel",
    category: "Hotels",
    location: "Oia, Santorini",
    rating: 4.8,
    estimated_price: 280,
    image_url:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
    highlight: false,
  },
  {
    external_id: "san-cafe-1",
    destination: "Santorini",
    name: "Atlantis Coffee",
    category: "Cafés",
    location: "Fira, Santorini",
    rating: 4.5,
    estimated_price: 10,
    image_url:
      "https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=800&q=80",
    highlight: false,
  },

  // —— Rome ——
  {
    external_id: "rome-attr-1",
    destination: "Rome",
    name: "Colosseum",
    category: "Attractions",
    location: "Centro Storico, Rome",
    rating: 4.8,
    estimated_price: 18,
    image_url:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
    highlight: true,
    blurb: "Ancient amphitheatre — combine with Forum & Palatine.",
  },
  {
    external_id: "rome-attr-2",
    destination: "Rome",
    name: "Vatican Museums & Sistine Chapel",
    category: "Attractions",
    location: "Vatican City",
    rating: 4.7,
    estimated_price: 25,
    image_url:
      "https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=800&q=80",
    highlight: true,
    blurb: "Michelangelo’s ceiling and endless galleries.",
  },
  {
    external_id: "rome-attr-3",
    destination: "Rome",
    name: "Trevi Fountain",
    category: "Attractions",
    location: "Trevi, Rome",
    rating: 4.7,
    estimated_price: 0,
    image_url:
      "https://images.unsplash.com/photo-1525874684015-58341d594b8d?auto=format&fit=crop&w=800&q=80",
    highlight: true,
    blurb: "Toss a coin and soak in Baroque Rome.",
  },
  {
    external_id: "rome-attr-4",
    destination: "Rome",
    name: "Pantheon",
    category: "Attractions",
    location: "Piazza della Rotonda, Rome",
    rating: 4.8,
    estimated_price: 5,
    image_url:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
    highlight: true,
    blurb: "Nearly 2,000-year-old dome still open to the sky.",
  },
  {
    external_id: "rome-rest-1",
    destination: "Rome",
    name: "Trattoria Da Enzo",
    category: "Restaurants",
    location: "Trastevere, Rome",
    rating: 4.6,
    estimated_price: 40,
    image_url:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    highlight: false,
  },
  {
    external_id: "rome-cafe-1",
    destination: "Rome",
    name: "Sant’Eustachio Il Caffè",
    category: "Cafés",
    location: "Centro Storico, Rome",
    rating: 4.5,
    estimated_price: 5,
    image_url:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
    highlight: false,
  },

  // —— London ——
  {
    external_id: "lon-attr-1",
    destination: "London",
    name: "Tower of London",
    category: "Attractions",
    location: "Tower Hill, London",
    rating: 4.6,
    estimated_price: 35,
    image_url:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
    highlight: true,
    blurb: "Crown Jewels, Beefeaters and 1,000 years of history.",
  },
  {
    external_id: "lon-attr-2",
    destination: "London",
    name: "British Museum",
    category: "Attractions",
    location: "Bloomsbury, London",
    rating: 4.7,
    estimated_price: 0,
    image_url:
      "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=800&q=80",
    highlight: true,
    blurb: "Free world history museum — Rosetta Stone and more.",
  },
  {
    external_id: "lon-attr-3",
    destination: "London",
    name: "Westminster & Big Ben",
    category: "Attractions",
    location: "Westminster, London",
    rating: 4.7,
    estimated_price: 0,
    image_url:
      "https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=800&q=80",
    highlight: true,
    blurb: "Parliament, the Elizabeth Tower and the Thames.",
  },
  {
    external_id: "lon-attr-4",
    destination: "London",
    name: "Camden Market",
    category: "Attractions",
    location: "Camden, London",
    rating: 4.5,
    estimated_price: 0,
    image_url:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
    highlight: true,
    blurb: "Street food, vintage stalls and canal walks.",
  },
  {
    external_id: "lon-rest-1",
    destination: "London",
    name: "Dishoom Covent Garden",
    category: "Restaurants",
    location: "Covent Garden, London",
    rating: 4.6,
    estimated_price: 35,
    image_url:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    highlight: false,
  },
  {
    external_id: "lon-cafe-1",
    destination: "London",
    name: "Monmouth Coffee",
    category: "Cafés",
    location: "Borough Market, London",
    rating: 4.6,
    estimated_price: 6,
    image_url:
      "https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=800&q=80",
    highlight: false,
  },
  {
    external_id: "lon-hotel-1",
    destination: "London",
    name: "The Hoxton Shoreditch",
    category: "Hotels",
    location: "Shoreditch, London",
    rating: 4.5,
    estimated_price: 190,
    image_url:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    highlight: false,
  },
];

export function buildSicilyDemo(store, uid) {
  const userId = uid();
  const tripId = uid();

  store.users.push({
    id: userId,
    email: "demo@wanderplan.app",
    password: "demo123",
    full_name: "Alex Traveler",
    created_at: new Date().toISOString(),
  });

  store.trips.push({
    id: tripId,
    user_id: userId,
    destination: "Sicily",
    country: "Italy",
    start_date: "2026-06-10",
    end_date: "2026-06-16",
    budget: 900,
    currency: "EUR",
    travelers: 2,
    image_url:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=80",
    created_at: new Date().toISOString(),
  });

  const itinerary = [
    { date: "2026-06-10", time: "09:00", title: "Breakfast at hotel", category: "Food", location: "Catania", estimated_cost: 18, notes: "Fresh cornetto & espresso" },
    { date: "2026-06-10", time: "10:30", title: "Visit Catania Cathedral", category: "Activity", location: "Catania", estimated_cost: 0, notes: "" },
    { date: "2026-06-10", time: "13:00", title: "Lunch at Trattoria da Nino", category: "Food", location: "Catania", estimated_cost: 40, notes: "Try pasta alla Norma" },
    { date: "2026-06-10", time: "15:00", title: "Explore city center", category: "Activity", location: "Catania", estimated_cost: 0, notes: "Via Etnea & fish market" },
    { date: "2026-06-10", time: "20:00", title: "Dinner by the sea", category: "Food", location: "Catania", estimated_cost: 55, notes: "" },
    { date: "2026-06-11", time: "08:30", title: "Train to Taormina", category: "Transport", location: "Catania → Taormina", estimated_cost: 16, notes: "" },
    { date: "2026-06-11", time: "11:00", title: "Greek Theatre of Taormina", category: "Activity", location: "Taormina", estimated_cost: 12, notes: "" },
    { date: "2026-06-11", time: "14:00", title: "Isola Bella beach", category: "Activity", location: "Taormina", estimated_cost: 0, notes: "Bring swimwear" },
    { date: "2026-06-11", time: "19:30", title: "Dinner with Etna view", category: "Food", location: "Taormina", estimated_cost: 70, notes: "" },
    { date: "2026-06-12", time: "09:00", title: "Mount Etna tour", category: "Activity", location: "Mount Etna", estimated_cost: 110, notes: "Half-day jeep tour" },
    { date: "2026-06-12", time: "16:00", title: "Return & rest", category: "Other", location: "Catania", estimated_cost: 0, notes: "" },
    { date: "2026-06-13", time: "08:00", title: "Day trip to Syracuse", category: "Transport", location: "Syracuse", estimated_cost: 25, notes: "" },
    { date: "2026-06-13", time: "10:30", title: "Ortygia island walk", category: "Activity", location: "Syracuse", estimated_cost: 0, notes: "" },
    { date: "2026-06-13", time: "13:30", title: "Seafood lunch", category: "Food", location: "Syracuse", estimated_cost: 50, notes: "" },
    { date: "2026-06-14", time: "10:00", title: "Shopping in Catania", category: "Shopping", location: "Catania", estimated_cost: 30, notes: "Local ceramics" },
    { date: "2026-06-14", time: "15:00", title: "Café & cannoli", category: "Food", location: "Catania", estimated_cost: 15, notes: "" },
    { date: "2026-06-15", time: "09:00", title: "Beach day — Scala dei Turchi", category: "Activity", location: "Realmonte", estimated_cost: 40, notes: "Car rental + fuel" },
    { date: "2026-06-16", time: "10:00", title: "Hotel checkout", category: "Hotel", location: "Catania", estimated_cost: 0, notes: "" },
    { date: "2026-06-16", time: "12:00", title: "Airport transfer", category: "Transport", location: "Catania Airport", estimated_cost: 25, notes: "" },
  ];

  itinerary.forEach((item) => {
    store.itinerary.push({
      id: uid(),
      trip_id: tripId,
      user_id: userId,
      created_at: new Date().toISOString(),
      ...item,
    });
  });

  const expenses = [
    { description: "Hotel Villa Carlotta (3 nights)", category: "Accommodation", amount: 320, date: "2026-06-10" },
    { description: "Restaurants & cafés", category: "Food", amount: 145, date: "2026-06-12" },
    { description: "Trains & transfers", category: "Transport", amount: 80, date: "2026-06-11" },
    { description: "Etna tour + tickets", category: "Activities", amount: 65, date: "2026-06-12" },
    { description: "Souvenirs", category: "Shopping", amount: 30, date: "2026-06-14" },
  ];

  expenses.forEach((e) => {
    store.expenses.push({
      id: uid(),
      trip_id: tripId,
      user_id: userId,
      created_at: new Date().toISOString(),
      ...e,
    });
  });

  ["sicily-rest-1", "sicily-attr-1", "sicily-beach-1", "sicily-cafe-1"].forEach((extId) => {
    const place = MOCK_PLACES.find((p) => p.external_id === extId);
    if (place) {
      store.savedPlaces.push({
        id: uid(),
        trip_id: tripId,
        user_id: userId,
        created_at: new Date().toISOString(),
        ...place,
      });
    }
  });

  return store;
}
