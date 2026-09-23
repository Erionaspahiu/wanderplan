import { Navigation } from "lucide-react";
import { getTransportLinks } from "../../utils/transportLinks";
import { useLanguage } from "../../context/LanguageContext";

export default function TransportLinks({ destination }) {
  const { t } = useLanguage();
  if (!destination) return null;
  const links = getTransportLinks(destination);

  return (
    <article className="card transport-card">
      <h3>
        <Navigation size={18} /> {t("transport.title")}
      </h3>
      <p className="muted">{t("transport.subtitle")}</p>
      <div className="transport-grid">
        {links.map(({ key, icon: Icon, label, labelKey, descKey, descVars, url }) => (
          <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="transport-link">
            <span className="transport-icon">
              <Icon size={18} />
            </span>
            <span>
              <strong>{label || t(labelKey)}</strong>
              <span className="transport-desc">{t(descKey, descVars)}</span>
            </span>
          </a>
        ))}
      </div>
    </article>
  );
}
