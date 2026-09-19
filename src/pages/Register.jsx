import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { validateAuth } from "../utils/validation";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Register() {
  const { register, user, isDemoMode } = useAuth();
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
      setFormError(err.message || "Unable to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h1>Create your account</h1>
        <p className="auth-sub">Start planning smarter trips with WanderPlan.</p>

        {isDemoMode && (
          <div className="info-banner">
            Running in demo mode (localStorage). Add Supabase keys in <code>.env</code> for a real
            backend.
          </div>
        )}

        <form onSubmit={onSubmit} className="form-stack" noValidate>
          <Input
            id="fullName"
            name="fullName"
            label="Full name"
            value={form.fullName}
            onChange={onChange}
            error={errors.fullName}
            autoComplete="name"
          />
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
            autoComplete="new-password"
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm password"
            value={form.confirmPassword}
            onChange={onChange}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
          {formError && <p className="form-error">{formError}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            Get Started
          </Button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
