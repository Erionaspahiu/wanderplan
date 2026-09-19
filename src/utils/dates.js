export function formatDate(dateStr, options = {}) {
  if (!dateStr) return "";
  const date = new Date(dateStr + (dateStr.includes("T") ? "" : "T00:00:00"));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: options.includeYear === false ? undefined : "numeric",
    ...options,
  });
}

export function formatDateRange(start, end) {
  if (!start || !end) return "";
  const startDate = new Date(start + "T00:00:00");
  const endDate = new Date(end + "T00:00:00");
  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const startFmt = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
  const endFmt = endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startFmt} – ${endFmt}`;
}

export function daysBetween(start, end) {
  if (!start || !end) return 0;
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(diff, 1);
}

export function eachDay(start, end) {
  const days = [];
  const current = new Date(start + "T00:00:00");
  const last = new Date(end + "T00:00:00");
  while (current <= last) {
    days.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function isUpcoming(startDate) {
  if (!startDate) return false;
  return new Date(startDate + "T00:00:00") >= new Date(todayISO() + "T00:00:00");
}
