import { MapPin, Pencil, Trash2 } from "lucide-react";
import { formatMoney } from "../../utils/currency";
import { useLanguage } from "../../context/LanguageContext";

const CATEGORY_CLASS = {
  Food: "tag-food",
  Activity: "tag-activity",
  Hotel: "tag-hotel",
  Transport: "tag-transport",
  Shopping: "tag-shopping",
  Other: "tag-other",
};

export default function ItineraryItem({ item, currency, onEdit, onDelete }) {
  const { t } = useLanguage();
  return (
    <article className="itinerary-item">
      <div className="itinerary-time">{item.time || "--:--"}</div>
      <div className="itinerary-content">
        <div className="itinerary-top">
          <h4>{item.title}</h4>
          <span className={`tag ${CATEGORY_CLASS[item.category] || "tag-other"}`}>
            {t(`categories.itinerary.${item.category}`)}
          </span>
        </div>
        {item.location && (
          <p className="itinerary-loc">
            <MapPin size={14} /> {item.location}
          </p>
        )}
        {item.notes && <p className="itinerary-notes">{item.notes}</p>}
        {Number(item.estimated_cost) > 0 && (
          <p className="itinerary-cost">{formatMoney(item.estimated_cost, currency)}</p>
        )}
      </div>
      <div className="itinerary-actions">
        <button type="button" className="icon-btn" onClick={() => onEdit(item)} aria-label={t("common.edit")}>
          <Pencil size={16} />
        </button>
        <button
          type="button"
          className="icon-btn danger"
          onClick={() => onDelete(item)}
          aria-label={t("common.delete")}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}
