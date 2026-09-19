import { Link } from "react-router-dom";
import {
  CalendarRange,
  Compass,
  MapPinned,
  PiggyBank,
  Route,
  Sparkles,
} from "lucide-react";
import { DESTINATIONS } from "../data/demoData";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";

const STEPS = [
  {
    icon: CalendarRange,
    title: "Create your trip",
    text: "Set destination, dates, budget and travelers in under a minute.",
  },
  {
    icon: MapPinned,
    title: "Discover places",
    text: "Browse hotels, restaurants, attractions and beaches for your destination.",
  },
  {
    icon: Route,
    title: "Build your itinerary",
    text: "Organize each day with times, categories, locations and notes.",
  },
  {
    icon: PiggyBank,
    title: "Track your budget",
    text: "Log expenses and see exactly what’s left to spend.",
  },
];

export default function Landing() {
  const { user } = useAuth();
  const ctaTo = user ? "/trips/new" : "/register";

  return (
    <div className="landing">
      <section className="hero">
        <div
          className="hero-bg"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2000&q=80)",
          }}
        />
        <div className="hero-overlay" />
        <div className="container hero-content">
          <p className="hero-brand">
            <Compass size={18} /> WanderPlan
          </p>
          <h1>Plan your entire trip in one place.</h1>
          <p className="hero-sub">
            Create itineraries, discover places, manage your budget and keep every part of your
            journey organized.
          </p>
          <div className="hero-cta">
            <Link to={ctaTo}>
              <Button size="lg">Plan a Trip</Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="ghost-light" size="lg">
                How it works
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <p className="eyebrow">
              <Sparkles size={14} /> How it works
            </p>
            <h2>Everything you need for a smoother trip</h2>
            <p>From first idea to final expense — WanderPlan keeps travel planning simple.</p>
          </div>
          <div className="steps-grid">
            {STEPS.map((step, i) => (
              <article key={step.title} className="step-card card">
                <div className="step-num">{i + 1}</div>
                <div className="step-icon">
                  <step.icon size={22} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-muted" id="explore">
        <div className="container">
          <div className="section-header">
            <p className="eyebrow">Explore</p>
            <h2>Popular destinations</h2>
            <p>Each destination includes famous places to visit — perfect trip inspiration.</p>
          </div>
          <div className="dest-grid">
            {DESTINATIONS.map((d) => (
              <Link key={d.name} to={ctaTo} className="dest-card dest-card-rich">
                <img src={d.image} alt={`${d.name}, ${d.country}`} loading="lazy" />
                <div className="dest-overlay dest-overlay-rich">
                  <h3>{d.name}</h3>
                  <p>{d.country}</p>
                  <ul className="dest-famous">
                    {d.famousPlaces.slice(0, 4).map((place) => (
                      <li key={place}>{place}</li>
                    ))}
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section cta-band">
        <div className="container cta-band-inner">
          <div>
            <h2>Ready for your next adventure?</h2>
            <p>Create a free account and start planning in minutes.</p>
          </div>
          <Link to={ctaTo}>
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
