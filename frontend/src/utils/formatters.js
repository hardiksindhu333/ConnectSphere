export function formatCompactNumber(value) {
  const n = Number(value || 0);
  try {
    return new Intl.NumberFormat(undefined, { notation: "compact" }).format(n);
  } catch {
    return String(n);
  }
}

export function timeAgo(dateLike) {
  const d = dateLike ? new Date(dateLike) : null;
  if (!d || Number.isNaN(d.getTime())) return "";

  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  const ranges = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];

  for (const [unit, s] of ranges) {
    if (Math.abs(seconds) >= s || unit === "second") {
      return rtf.format(-Math.round(seconds / s), unit);
    }
  }
  return "";
}

