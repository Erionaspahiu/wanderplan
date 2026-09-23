import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Toast from "../components/ui/Toast";
import { useLanguage } from "../context/LanguageContext";

export function PublicLayout() {
  const { t } = useLanguage();
  return (
    <div className="layout-public">
      <Navbar variant="public" />
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <p>© {new Date().getFullYear()} Movin'</p>
          <p className="footer-muted">{t("footer.tagline")}</p>
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
