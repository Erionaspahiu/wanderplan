// Error values are i18n keys (under "validation.") rather than final
// strings, so callers translate them with t() at render time.

export function validateTrip(values) {
  const errors = {};
  if (!values.destination?.trim()) errors.destination = "validation.destinationRequired";
  if (!values.country?.trim()) errors.country = "validation.countryRequired";
  if (!values.start_date) errors.start_date = "validation.startDateRequired";
  if (!values.end_date) errors.end_date = "validation.endDateRequired";
  if (values.start_date && values.end_date && values.end_date < values.start_date) {
    errors.end_date = "validation.endDateAfterStart";
  }
  if (values.budget === "" || values.budget == null || Number(values.budget) < 0) {
    errors.budget = "validation.budgetInvalid";
  }
  if (!values.travelers || Number(values.travelers) < 1) {
    errors.travelers = "validation.travelersRequired";
  }
  if (!values.currency) errors.currency = "validation.currencyRequired";
  return errors;
}

export function validateAuth(values, mode = "login") {
  const errors = {};
  if (!values.email?.trim()) errors.email = "validation.emailRequired";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "validation.emailInvalid";
  }
  if (!values.password) errors.password = "validation.passwordRequired";
  else if (values.password.length < 6) {
    errors.password = "validation.passwordTooShort";
  }
  if (mode === "register") {
    if (!values.fullName?.trim()) errors.fullName = "validation.fullNameRequired";
    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = "validation.passwordsDontMatch";
    }
  }
  return errors;
}

export function validateExpense(values) {
  const errors = {};
  if (!values.description?.trim()) errors.description = "validation.descriptionRequired";
  if (!values.category) errors.category = "validation.categoryRequired";
  if (values.amount === "" || values.amount == null || Number(values.amount) <= 0) {
    errors.amount = "validation.amountInvalid";
  }
  if (!values.date) errors.date = "validation.dateRequired";
  return errors;
}

export function validateItineraryItem(values) {
  const errors = {};
  if (!values.title?.trim()) errors.title = "validation.titleRequired";
  if (!values.date) errors.date = "validation.dateRequired";
  if (!values.category) errors.category = "validation.categoryRequired";
  return errors;
}

export function countryFlag(country = "") {
  const map = {
    Italy: "🇮🇹",
    France: "🇫🇷",
    Spain: "🇪🇸",
    Greece: "🇬🇷",
    "United Kingdom": "🇬🇧",
    UK: "🇬🇧",
    Japan: "🇯🇵",
    Portugal: "🇵🇹",
    Germany: "🇩🇪",
    Croatia: "🇭🇷",
    Albania: "🇦🇱",
    Kosovo: "🇽🇰",
    Macedonia: "🇲🇰",
    "North Macedonia": "🇲🇰",
    Serbia: "🇷🇸",
    Montenegro: "🇲🇪",
    "Bosnia and Herzegovina": "🇧🇦",
    USA: "🇺🇸",
    "United States": "🇺🇸",
  };
  return map[country] || "✈️";
}
