import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { AnalyticsConsent } from "@/components/site/analytics-consent";
import { JsonLd } from "@/components/site/json-ld";
import { getContent, getPublicSettings } from "@/lib/server/public";
import { defaultFooter } from "@/lib/site-content";
import { getSiteOrigin } from "@/lib/seo";
import { emailUrl, safeWebUrl } from "@/lib/public-links";
import { brandAssets } from "@/components/brand/brand";

export default async function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, footer, origin] = await Promise.all([
    getPublicSettings(),
    getContent("footer", defaultFooter),
    getSiteOrigin(),
  ]);
  const sameAs = [settings.instagram, settings.linkedin, settings.github]
    .map(safeWebUrl)
    .filter((url): url is string => Boolean(url));
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "VIEIRA SYSTEMS",
            ...(origin
              ? {
                  "@id": `${origin}/#organization`,
                  url: origin,
                  logo: `${origin}${brandAssets.full}`,
                }
              : {}),
            ...(emailUrl(settings.email) ? { email: settings.email } : {}),
            ...(sameAs.length ? { sameAs } : {}),
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "VIEIRA SYSTEMS",
            inLanguage: "pt-BR",
            ...(origin
              ? {
                  "@id": `${origin}/#website`,
                  url: origin,
                  publisher: { "@id": `${origin}/#organization` },
                }
              : {}),
          },
        ]}
      />
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <SiteNav />
      <main id="conteudo">{children}</main>
      <SiteFooter settings={settings} content={footer} />
      <AnalyticsConsent
        settings={{
          googleAnalyticsId: settings.googleAnalyticsId,
          googleTagManagerId: settings.googleTagManagerId,
          metaPixelId: settings.metaPixelId,
        }}
      />
    </>
  );
}
