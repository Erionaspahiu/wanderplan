import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import Button from "../components/ui/Button";

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="page-center">
      <div className="not-found">
        <p className="eyebrow">404</p>
        <h1>{t("notFound.title")}</h1>
        <p>{t("notFound.message")}</p>
        <Link to="/">
          <Button>{t("notFound.backHome")}</Button>
        </Link>
      </div>
    </div>
  );
}
