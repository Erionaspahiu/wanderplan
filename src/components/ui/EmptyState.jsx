import { Compass } from "lucide-react";
import Button from "./Button";

export default function EmptyState({ icon: Icon = Compass, title, description, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={28} />
      </div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
