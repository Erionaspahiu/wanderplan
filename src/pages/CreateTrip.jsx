import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createTrip } from "../services/tripService";
import { CURRENCIES } from "../data/demoData";
import { validateTrip } from "../utils/validation";
import { todayISO } from "../utils/dates";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80";

export default function CreateTrip() {
  const { user, showToast } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    destination: "",
    country: "",
    start_date: "",
    end_date: "",
    budget: "",
    currency: "EUR",
    travelers: 2,
    image_url: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateTrip(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const trip = await createTrip(user.id, {
        destination: form.destination.trim(),
        country: form.country.trim(),
        start_date: form.start_date,
        end_date: form.end_date,
        budget: Number(form.budget),
        currency: form.currency,
        travelers: Number(form.travelers),
        image_url: form.image_url.trim() || DEFAULT_IMAGE,
      });
      showToast("Trip created!");
      navigate(`/trips/${trip.id}`);
    } catch (err) {
      showToast(err.message || "Could not create trip", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page narrow">
      <header className="page-header">
        <div>
          <h1>Create a new trip</h1>
          <p>Tell us where you’re going and we’ll set up your dashboard.</p>
        </div>
      </header>

      <form className="card form-card form-stack" onSubmit={onSubmit} noValidate>
        <div className="form-grid">
          <Input
            id="destination"
            name="destination"
            label="Destination"
            placeholder="Sicily"
            value={form.destination}
            onChange={onChange}
            error={errors.destination}
          />
          <Input
            id="country"
            name="country"
            label="Country"
            placeholder="Italy"
            value={form.country}
            onChange={onChange}
            error={errors.country}
          />
          <Input
            id="start_date"
            name="start_date"
            type="date"
            label="Start date"
            min={todayISO()}
            value={form.start_date}
            onChange={onChange}
            error={errors.start_date}
          />
          <Input
            id="end_date"
            name="end_date"
            type="date"
            label="End date"
            min={form.start_date || todayISO()}
            value={form.end_date}
            onChange={onChange}
            error={errors.end_date}
          />
          <Input
            id="budget"
            name="budget"
            type="number"
            min="0"
            step="1"
            label="Budget"
            placeholder="900"
            value={form.budget}
            onChange={onChange}
            error={errors.budget}
          />
          <Input
            id="currency"
            name="currency"
            as="select"
            label="Currency"
            value={form.currency}
            onChange={onChange}
            error={errors.currency}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Input>
          <Input
            id="travelers"
            name="travelers"
            type="number"
            min="1"
            label="Travelers"
            value={form.travelers}
            onChange={onChange}
            error={errors.travelers}
          />
          <Input
            id="image_url"
            name="image_url"
            label="Trip image URL (optional)"
            placeholder="https://..."
            value={form.image_url}
            onChange={onChange}
            hint="Leave blank to use a default travel photo"
          />
        </div>
        <div className="form-actions">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Trip
          </Button>
        </div>
      </form>
    </div>
  );
}
