import { formatMoney, budgetProgress } from "../../utils/currency";

export default function BudgetCard({ budget, spent, remaining, currency }) {
  const progress = budgetProgress(spent, budget);
  const over = remaining < 0;

  return (
    <section className="budget-card card">
      <div className="budget-grid">
        <div>
          <p className="stat-label">Total Budget</p>
          <p className="stat-value">{formatMoney(budget, currency)}</p>
        </div>
        <div>
          <p className="stat-label">Spent</p>
          <p className="stat-value">{formatMoney(spent, currency)}</p>
        </div>
        <div>
          <p className="stat-label">Remaining</p>
          <p className={`stat-value ${over ? "text-danger" : "text-success"}`}>
            {formatMoney(remaining, currency)}
          </p>
        </div>
      </div>
      <div className="budget-progress-block">
        <div className="budget-mini-row">
          <span>Budget used</span>
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
