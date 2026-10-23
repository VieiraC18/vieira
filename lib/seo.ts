import "server-only";
import type { Metadata } from "next";
import { getPublicSettings } from "@/lib/server/public";
import { safeImageUrl, safeWebUrl } from "@/lib/public-links";

export async function getSiteOrigin() {
  const settings = await getPublicSettings();
  const configured =
    safeWebUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    safeWebUrl(settings.siteUrl);
  return configured ? new URL(configured).origin : undefined;
}

export async function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Promise<Metadata> {
  const origin = await getSiteOrigin();
  const canonical = origin ? `${origin}${path}` : undefined;
  const imageUrl = safeImageUrl(image);
  const socialImage = imageUrl
    ? imageUrl.startsWith("/") && origin
      ? `${origin}${imageUrl}`
      : imageUrl
    : origin
      ? `${origin}/opengraph-image`
      : undefined;
  const fullTitle = title.includes("VIEIRA SYSTEMS")
    ? title
    : `${title} | VIEIRA SYSTEMS`;
  return {
    title: { absolute: fullTitle },
    description,
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: "VIEIRA SYSTEMS",
      locale: "pt_BR",
      type: "website",
      ...(socialImage ? { images: [{ url: socialImage, alt: title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(socialImage ? { images: [socialImage] } : {}),
    },
  };
}

export function breadcrumbSchema(
  origin: string | undefined,
  entries: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      ...(origin ? { item: `${origin}${entry.path}` } : {}),
    })),
  };
}
