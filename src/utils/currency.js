const SYMBOLS = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  ALL: "L",
};

export function currencySymbol(code = "EUR") {
  return SYMBOLS[code] || code + " ";
}

export function formatMoney(amount, currency = "EUR") {
  const value = Number(amount) || 0;
  const symbol = currencySymbol(currency);
  return `${symbol}${value.toLocaleString("en-US", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function budgetProgress(spent, budget) {
  const b = Number(budget) || 0;
  const s = Number(spent) || 0;
  if (b <= 0) return 0;
  return Math.min(100, Math.round((s / b) * 100));
}
