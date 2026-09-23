import { formatMoney, budgetProgress } from "../../utils/currency";
import { useLanguage } from "../../context/LanguageContext";

export default function BudgetCard({ budget, spent, remaining, currency }) {
  const { t } = useLanguage();
  const progress = budgetProgress(spent, budget);
  const over = remaining < 0;

  return (
    <section className="budget-card card">
      <div className="budget-grid">
        <div>
          <p className="stat-label">{t("budgetCard.totalBudget")}</p>
          <p className="stat-value">{formatMoney(budget, currency)}</p>
        </div>
        <div>
          <p className="stat-label">{t("budgetCard.spent")}</p>
          <p className="stat-value">{formatMoney(spent, currency)}</p>
        </div>
        <div>
          <p className="stat-label">{t("budgetCard.remaining")}</p>
          <p className={`stat-value ${over ? "text-danger" : "text-success"}`}>
            {formatMoney(remaining, currency)}
          </p>
        </div>
      </div>
      <div className="budget-progress-block">
        <div className="budget-mini-row">
          <span>{t("budgetCard.budgetUsed")}</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-bar progress-lg">
          <div
            className={`progress-fill ${over ? "progress-danger" : ""}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    </section>
  );
}
