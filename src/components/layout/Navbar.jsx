import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { LANGUAGES } from "../../i18n";
import Button from "../ui/Button";

export default function Navbar({ variant = "public" }) {
  const { user, logout, displayName, isDemoMode } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => setOpen(false);

  const handleLogout = async () => {
    await logout();
    close();
    navigate("/");
  };

  return (
    <header className={`navbar ${variant === "app" ? "navbar-app" : ""}`}>
      <div className="container navbar-inner">
        <Link to={user ? "/dashboard" : "/"} className="brand" onClick={close}>
          <img src="/images/logo.png" alt="Movin'" className="brand-logo" />
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`nav-links ${open ? "is-open" : ""}`}>
          {variant === "public" && (
            <>
              <a href="/#explore" onClick={close}>
                {t("nav.explore")}
              </a>
              <a href="/#how-it-works" onClick={close}>
                {t("nav.howItWorks")}
              </a>
              <NavLink to={user ? "/dashboard" : "/login"} onClick={close}>
                {t("nav.myTrips")}
              </NavLink>
            </>
          )}

          {variant === "app" && (
            <>
              <NavLink to="/dashboard" onClick={close}>
                {t("nav.dashboard")}
              </NavLink>
              <NavLink to="/trips/new" onClick={close}>
                {t("nav.newTrip")}
              </NavLink>
            </>
          )}

          <div className="nav-actions">
            <label className="lang-switcher">
              <span className="sr-only">Language</span>
              <select value={lang} onChange={(e) => setLang(e.target.value)}>
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </label>
            {isDemoMode && <span className="demo-badge">{t("nav.demoMode")}</span>}
            {user ? (
              <>
                <span className="nav-user">{t("nav.hi", { name: displayName })}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  {t("nav.signOut")}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={close}>
                  {t("nav.signIn")}
                </Link>
                <Button size="sm" onClick={() => { close(); navigate("/register"); }}>
                  {t("nav.getStarted")}
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
