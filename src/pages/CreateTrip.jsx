import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImageOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { createTrip } from "../services/tripService";
import { CURRENCIES } from "../data/demoData";
import { DEFAULT_TRIP_IMAGE, resolveDestinationPhoto } from "../utils/tripPhoto";
import { validateTrip } from "../utils/validation";
import { todayISO } from "../utils/dates";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const DEFAULT_IMAGE = DEFAULT_TRIP_IMAGE;

export default function CreateTrip() {
  const { user, showToast } = useAuth();
  const { t } = useLanguage();
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
  const [preview, setPreview] = useState({ url: null, source: null, loading: false });
  const previewRequestId = useRef(0);

  useEffect(() => {
    const destination = form.destination.trim();
    const country = form.country.trim();
    if (!destination) {
      setPreview({ url: null, source: null, loading: false });
      return undefined;
    }

    const requestId = ++previewRequestId.current;
    setPreview((p) => ({ ...p, loading: true }));
    const timer = setTimeout(async () => {
      const result = await resolveDestinationPhoto(destination, country);
      if (previewRequestId.current === requestId) {
        setPreview({ url: result?.url || null, source: result?.source || null, loading: false });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [form.destination, form.country]);

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
      let image_url = form.image_url.trim();
      if (!image_url) {
        const resolved = await resolveDestinationPhoto(form.destination.trim(), form.country.trim());
        image_url = resolved?.url || DEFAULT_IMAGE;
      }
      const trip = await createTrip(user.id, {
        destination: form.destination.trim(),
        country: form.country.trim(),
        start_date: form.start_date,
        end_date: form.end_date,
        budget: Number(form.budget),
        currency: form.currency,
        travelers: Number(form.travelers),
        image_url,
      });
      showToast(t("createTrip.createdToast"));
      navigate(`/trips/${trip.id}`);
    } catch (err) {
      showToast(err.message || t("createTrip.createFailed"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page narrow">
      <header className="page-header">
        <div>
          <h1>{t("createTrip.title")}</h1>
          <p>{t("createTrip.subtitle")}</p>
        </div>
      </header>

      <form className="card form-card form-stack" onSubmit={onSubmit} noValidate>
        <div className="form-grid">
          <Input
            id="destination"
            name="destination"
            label={t("createTrip.destination")}
            placeholder="Sicily"
            value={form.destination}
            onChange={onChange}
            error={errors.destination && t(errors.destination)}
          />
          <Input
            id="country"
            name="country"
            label={t("createTrip.country")}
            placeholder="Italy"
            value={form.country}
            onChange={onChange}
            error={errors.country && t(errors.country)}
          />
          <Input
            id="start_date"
            name="start_date"
            type="date"
            label={t("createTrip.startDate")}
            min={todayISO()}
            value={form.start_date}
            onChange={onChange}
            error={errors.start_date && t(errors.start_date)}
          />
          <Input
            id="end_date"
            name="end_date"
            type="date"
            label={t("createTrip.endDate")}
            min={form.start_date || todayISO()}
            value={form.end_date}
            onChange={onChange}
            error={errors.end_date && t(errors.end_date)}
          />
          <Input
            id="budget"
            name="budget"
            type="number"
            min="0"
            step="1"
            label={t("createTrip.budget")}
            placeholder="900"
            value={form.budget}
            onChange={onChange}
            error={errors.budget && t(errors.budget)}
          />
          <Input
            id="currency"
            name="currency"
            as="select"
            label={t("createTrip.currency")}
            value={form.currency}
            onChange={onChange}
            error={errors.currency && t(errors.currency)}
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
            label={t("createTrip.travelers")}
            value={form.travelers}
            onChange={onChange}
            error={errors.travelers && t(errors.travelers)}
          />
          <Input
            id="image_url"
            name="image_url"
            label={t("createTrip.imageUrl")}
            placeholder="https://..."
            value={form.image_url}
            onChange={onChange}
            hint={t("createTrip.imageHint")}
          />
        </div>

        {!form.image_url.trim() && form.destination.trim() && (
          <div className="photo-preview">
            {preview.loading ? (
              <div className="photo-preview-placeholder">
                <span className="spinner-sm" /> {t("createTrip.findingPhoto", { destination: form.destination })}
              </div>
            ) : preview.url ? (
              <>
                <img src={preview.url} alt={`${form.destination}, ${form.country}`} loading="lazy" />
                <p className="muted">
                  {preview.source === "curated"
                    ? t("createTrip.curatedPhoto")
                    : t("createTrip.wikipediaPhoto")}
                </p>
              </>
            ) : (
              <div className="photo-preview-placeholder">
                <ImageOff size={18} /> {t("createTrip.noPhotoFound")}
              </div>
            )}
          </div>
        )}
        <div className="form-actions">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" loading={loading}>
            {t("createTrip.submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
