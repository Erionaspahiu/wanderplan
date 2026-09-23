import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { validateAuth } from "../utils/validation";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Login() {
  const { login, user, isDemoMode } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateAuth(form, "login");
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err.message || t("auth.unableToSignIn"));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => setForm({ email: "demo@movin.app", password: "demo123" });

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h1>{t("auth.loginTitle")}</h1>
        <p className="auth-sub">{t("auth.loginSub")}</p>

        {isDemoMode && (
          <div className="info-banner">
            {t("auth.demoBannerLogin")} <strong>demo@movin.app</strong> / <strong>demo123</strong>{" "}
            {t("auth.demoBannerOr")}{" "}
            <button type="button" className="text-link" onClick={fillDemo}>
              {t("auth.autofill")}
            </button>
            .
          </div>
        )}

        <form onSubmit={onSubmit} className="form-stack" noValidate>
          <Input
            id="email"
            name="email"
            type="email"
            label={t("auth.email")}
            value={form.email}
            onChange={onChange}
            error={errors.email && t(errors.email)}
            autoComplete="email"
          />
          <Input
            id="password"
            name="password"
            type="password"
            label={t("auth.password")}
            value={form.password}
            onChange={onChange}
            error={errors.password && t(errors.password)}
            autoComplete="current-password"
          />
          {formError && <p className="form-error">{formError}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            {t("auth.signIn")}
          </Button>
        </form>

        <p className="auth-footer">
          {t("auth.newHere")} <Link to="/register">{t("auth.createAccount")}</Link>
        </p>
      </div>
    </div>
  );
}
