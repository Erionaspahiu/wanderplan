import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Toast from "../components/ui/Toast";

export function PublicLayout() {
  return (
    <div className="layout-public">
      <Navbar variant="public" />
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <p>© {new Date().getFullYear()} WanderPlan — Smart Trip Planner</p>
          <p className="footer-muted">Plan smarter. Travel better.</p>
        </div>
      </footer>
      <Toast />
    </div>
  );
}

export function AppLayout() {
  return (
    <div className="layout-app">
      <Navbar variant="app" />
      <main className="app-main">
        <Outlet />
      </main>
      <Toast />
    </div>
  );
}
