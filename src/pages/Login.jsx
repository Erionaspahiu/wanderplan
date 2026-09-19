import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { validateAuth } from "../utils/validation";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Login() {
  const { login, user, isDemoMode } = useAuth();
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
      setFormError(err.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => setForm({ email: "demo@wanderplan.app", password: "demo123" });

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in to continue planning your trips.</p>

        {isDemoMode && (
          <div className="info-banner">
            Demo mode is on. Use <strong>demo@wanderplan.app</strong> / <strong>demo123</strong> or{" "}
            <button type="button" className="text-link" onClick={fillDemo}>
              autofill
            </button>
            .
          </div>
        )}

        <form onSubmit={onSubmit} className="form-stack" noValidate>
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            value={form.email}
            onChange={onChange}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            value={form.password}
            onChange={onChange}
            error={errors.password}
            autoComplete="current-password"
          />
          {formError && <p className="form-error">{formError}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            Sign In
          </Button>
        </form>

        <p className="auth-footer">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
