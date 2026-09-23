import { useEffect } from "react";
import { X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import Button from "./Button";

export default function Modal({ open, title, onClose, children, footer, size = "md" }) {
  const { t } = useLanguage();
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className={`modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="modal-title">{title}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={t("common.close")}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onClose, loading }) {
  const { t } = useLanguage();
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel || t("common.delete")}
          </Button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}
