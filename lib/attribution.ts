type Attribution = {
  source: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
};
const key = "vs-attribution";

/** First visit in this tab; never store contact fields or arbitrary query parameters. */
export function getAttribution(): Attribution {
  const empty = {
    source: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmTerm: "",
    utmContent: "",
  };
  if (typeof window === "undefined") return empty;
  try {
    const stored = sessionStorage.getItem(key);
    if (stored) {
      const data = JSON.parse(stored) as Partial<Attribution>;
      return Object.fromEntries(
        Object.keys(empty).map((name) => [
          name,
          typeof data[name as keyof Attribution] === "string"
            ? data[name as keyof Attribution]!.slice(
                0,
                name === "source" ? 500 : 200,
              )
            : "",
        ]),
      ) as Attribution;
    }
  } catch {
    /* Storage can be disabled; the current visit still works. */
  }
  const query = new URLSearchParams(window.location.search);
  const data: Attribution = {
    source: window.location.pathname.slice(0, 500),
    utmSource: (query.get("utm_source") ?? "").slice(0, 200),
    utmMedium: (query.get("utm_medium") ?? "").slice(0, 200),
    utmCampaign: (query.get("utm_campaign") ?? "").slice(0, 200),
    utmTerm: (query.get("utm_term") ?? "").slice(0, 200),
    utmContent: (query.get("utm_content") ?? "").slice(0, 200),
  };
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* Optional storage. */
  }
  return data;
}
