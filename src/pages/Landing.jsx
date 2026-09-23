import { Link } from "react-router-dom";
import {
  CalendarRange,
  MapPinned,
  PiggyBank,
  Route,
  Sparkles,
} from "lucide-react";
import { DESTINATIONS } from "../data/demoData";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import Button from "../components/ui/Button";

export default function Landing() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const ctaTo = user ? "/trips/new" : "/register";

  const STEPS = [
    { icon: CalendarRange, title: t("landing.step1Title"), text: t("landing.step1Text") },
    { icon: MapPinned, title: t("landing.step2Title"), text: t("landing.step2Text") },
    { icon: Route, title: t("landing.step3Title"), text: t("landing.step3Text") },
    { icon: PiggyBank, title: t("landing.step4Title"), text: t("landing.step4Text") },
  ];

  return (
    <div className="landing">
      <section className="hero">
        <div
          className="hero-bg"
          role="img"
          aria-label={t("landing.heroAlt")}
          style={{
            backgroundImage: "url(/images/hero.webp)",
          }}
        />
        <div className="hero-overlay" />
        <div className="container hero-content">
          <img src="/images/logo.png" alt="Movin'" className="hero-brand-logo" />
          <h1>
            {t("landing.heroTitle1")}
            <br />
            {t("landing.heroTitle2")}
          </h1>
          <p className="hero-sub">{t("landing.heroSub")}</p>
          <div className="hero-cta">
            <Link to={ctaTo}>
              <Button size="lg">{t("landing.planTrip")}</Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="ghost-light" size="lg">
                {t("landing.howItWorksBtn")}
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <p className="eyebrow">
              <Sparkles size={14} /> {t("landing.stepsEyebrow")}
            </p>
            <h2>{t("landing.stepsTitle")}</h2>
            <p>{t("landing.stepsSub")}</p>
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
            <p className="eyebrow">{t("landing.exploreEyebrow")}</p>
            <h2>{t("landing.exploreTitle")}</h2>
            <p>{t("landing.exploreSub")}</p>
          </div>
          <div className="dest-grid">
            {DESTINATIONS.map((d) => (
              <Link
                key={d.name}
                to={ctaTo}
                className={`dest-card dest-card-rich dest-card-${d.orientation}`}
              >
                <img
                  src={d.image}
                  alt={d.imageAlt || `${d.name}, ${d.country}`}
                  loading="lazy"
                  decoding="async"
                />
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
            <h2>{t("landing.ctaTitle")}</h2>
            <p>{t("landing.ctaSub")}</p>
          </div>
          <Link to={ctaTo}>
            <Button size="lg">{t("nav.getStarted")}</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
