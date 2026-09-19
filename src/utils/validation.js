export function validateTrip(values) {
  const errors = {};
  if (!values.destination?.trim()) errors.destination = "Destination is required";
  if (!values.country?.trim()) errors.country = "Country is required";
  if (!values.start_date) errors.start_date = "Start date is required";
  if (!values.end_date) errors.end_date = "End date is required";
  if (values.start_date && values.end_date && values.end_date < values.start_date) {
    errors.end_date = "End date must be after start date";
  }
  if (values.budget === "" || values.budget == null || Number(values.budget) < 0) {
    errors.budget = "Enter a valid budget";
  }
  if (!values.travelers || Number(values.travelers) < 1) {
    errors.travelers = "At least 1 traveler required";
  }
  if (!values.currency) errors.currency = "Currency is required";
  return errors;
}

export function validateAuth(values, mode = "login") {
  const errors = {};
  if (!values.email?.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email";
  }
  if (!values.password) errors.password = "Password is required";
  else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }
  if (mode === "register") {
    if (!values.fullName?.trim()) errors.fullName = "Name is required";
    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
  }
  return errors;
}

export function validateExpense(values) {
  const errors = {};
  if (!values.description?.trim()) errors.description = "Description is required";
  if (!values.category) errors.category = "Category is required";
  if (values.amount === "" || values.amount == null || Number(values.amount) <= 0) {
    errors.amount = "Enter a valid amount";
  }
  if (!values.date) errors.date = "Date is required";
  return errors;
}

export function validateItineraryItem(values) {
  const errors = {};
  if (!values.title?.trim()) errors.title = "Title is required";
  if (!values.date) errors.date = "Date is required";
  if (!values.category) errors.category = "Category is required";
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
    USA: "🇺🇸",
    "United States": "🇺🇸",
  };
  return map[country] || "✈️";
}
