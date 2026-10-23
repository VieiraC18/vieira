import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const url = await getSiteOrigin();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    ...(url
      ? { sitemap: `${url.replace(/\/$/, "")}/sitemap.xml`, host: url }
      : {}),
  };
}
