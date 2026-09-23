import { useLanguage } from "../../context/LanguageContext";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  className = "",
  disabled,
  loading,
  ...props
}) {
  const { t } = useLanguage();
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? t("common.pleaseWait") : children}
    </button>
  );
}
