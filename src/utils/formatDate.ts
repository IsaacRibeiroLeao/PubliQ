const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateLabel(isoDate: string) {
  return DATE_FORMATTER.format(new Date(`${isoDate}T00:00:00.000Z`));
}

export function formatDateTimeLabel(iso: string) {
  return DATE_TIME_FORMATTER.format(new Date(iso));
}

export function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function addUtcDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return toISODate(date);
}
