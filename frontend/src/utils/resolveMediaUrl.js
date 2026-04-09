export function resolveMediaUrl(url) {
  // IMPORTANT: return null (not empty string) so React doesn't render src=""
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
  const origin = apiBase.replace(/\/api\/v\d+$/, "");

  // ensure exactly one slash between origin and path
  return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
}

