import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Compass, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";

export default function Navbar({ variant = "public" }) {
  const { user, logout, displayName, isDemoMode } = useAuth();
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
          <span className="brand-mark">
            <Compass size={20} />
          </span>
          <span className="brand-text">WanderPlan</span>
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
                Explore
              </a>
              <a href="/#how-it-works" onClick={close}>
                How It Works
              </a>
              <NavLink to={user ? "/dashboard" : "/login"} onClick={close}>
                My Trips
              </NavLink>
            </>
          )}

          {variant === "app" && (
            <>
              <NavLink to="/dashboard" onClick={close}>
                Dashboard
              </NavLink>
              <NavLink to="/trips/new" onClick={close}>
                New Trip
              </NavLink>
            </>
          )}

          <div className="nav-actions">
            {isDemoMode && <span className="demo-badge">Demo mode</span>}
            {user ? (
              <>
                <span className="nav-user">Hi, {displayName}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={close}>
                  Sign In
                </Link>
                <Button size="sm" onClick={() => { close(); navigate("/register"); }}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
