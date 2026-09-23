import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { validateAuth } from "../utils/validation";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Register() {
  const { register, user, isDemoMode } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateAuth(form, "register");
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setFormError(err.message || t("auth.unableToCreateAccount"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h1>{t("auth.registerTitle")}</h1>
        <p className="auth-sub">{t("auth.registerSub")}</p>

        {isDemoMode && (
          <div className="info-banner">
            {t("auth.demoBannerRegisterPrefix")} <code>.env</code> {t("auth.demoBannerRegisterSuffix")}
          </div>
        )}

        <form onSubmit={onSubmit} className="form-stack" noValidate>
          <Input
            id="fullName"
            name="fullName"
            label={t("auth.fullName")}
            value={form.fullName}
            onChange={onChange}
            error={errors.fullName && t(errors.fullName)}
            autoComplete="name"
          />
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
            autoComplete="new-password"
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label={t("auth.confirmPassword")}
            value={form.confirmPassword}
            onChange={onChange}
            error={errors.confirmPassword && t(errors.confirmPassword)}
            autoComplete="new-password"
          />
          {formError && <p className="form-error">{formError}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            {t("nav.getStarted")}
          </Button>
        </form>

        <p className="auth-footer">
          {t("auth.alreadyHaveAccount")} <Link to="/login">{t("auth.signInLink")}</Link>
        </p>
      </div>
    </div>
  );
}
