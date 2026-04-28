type CurrencyOpts = { currency?: string; locale?: string };

export function formatPrice(cents: number, opts: CurrencyOpts = {}) {
  const { currency = "ARS", locale = "es-AR" } = opts;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m} min`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function intervalLabel(interval: "month" | "quarter" | "year") {
  switch (interval) {
    case "month":
      return "mes";
    case "quarter":
      return "trimestre";
    case "year":
      return "año";
  }
}

export function intervalMonths(interval: "month" | "quarter" | "year") {
  switch (interval) {
    case "month":
      return 1;
    case "quarter":
      return 3;
    case "year":
      return 12;
  }
}
