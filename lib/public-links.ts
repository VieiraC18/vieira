/** Only allow navigable HTTP(S) URLs. Never render CMS strings as executable URLs. */
export function safeWebUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

export function safeImageUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (/^\/(?!\/)[a-zA-Z0-9_./%-]+$/.test(value)) return value;
  const url = safeWebUrl(value);
  return url?.startsWith("https://") ? url : undefined;
}

export function whatsappUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const digits = value.replace(/[\s()+.-]/g, "");
  return /^[1-9]\d{9,14}$/.test(digits) ? `https://wa.me/${digits}` : undefined;
}

export function emailUrl(value: unknown): string | undefined {
  if (
    typeof value !== "string" ||
    !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value)
  )
    return undefined;
  return `mailto:${encodeURIComponent(value).replace(/%40/g, "@")}`;
}
