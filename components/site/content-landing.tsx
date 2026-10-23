import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleDot,
  Workflow,
} from "lucide-react";
import type { LandingContent, ServiceSlug } from "@/lib/site-content";
import { servicePageNames, servicePages } from "@/lib/site-content";
import { getContent, getPublicServices } from "@/lib/server/public";
import { breadcrumbSchema, getSiteOrigin, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/site/json-ld";
import { ServiceCatalog } from "@/components/site/service-catalog";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";

export async function getLandingContent(slug: ServiceSlug) {
  return getContent<LandingContent>(`page:${slug}`, {
    ...servicePages[slug],
    points: [...servicePages[slug].points],
    seoTitle: "",
    seoDescription: "",
  });
}

export async function landingMetadata(slug: ServiceSlug) {
  const content = await getLandingContent(slug);
  return pageMetadata({
    title: content.seoTitle || servicePageNames[slug],
    description: content.seoDescription || content.description,
    path: `/${slug}`,
  });
}

export async function ContentLanding({ slug }: { slug: ServiceSlug }) {
  const [content, origin, services] = await Promise.all([
    getLandingContent(slug),
    getSiteOrigin(),
    slug === "servicos" ? getPublicServices() : Promise.resolve([]),
  ]);
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(origin, [
            { name: "Início", path: "/" },
            { name: servicePageNames[slug], path: `/${slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: servicePageNames[slug],
            description: content.description,
            provider: {
              "@type": "Organization",
              name: "VIEIRA SYSTEMS",
              ...(origin ? { "@id": `${origin}/#organization` } : {}),
            },
            ...(origin ? { url: `${origin}/${slug}` } : {}),
          },
        ]}
      />
      <section className="inner-hero page-wrap">
        <div className="breadcrumb">
          <Link href="/">Início</Link>
          <span>/</span>
          <span>{content.eyebrow}</span>
        </div>
        <div className="inner-hero-grid">
          <div>
            <span className="eyebrow">
              <CircleDot size={12} />
              {content.eyebrow}
            </span>
            <h1>{content.title}</h1>
            <p className="inner-hero-description">{content.description}</p>
            <div className="hero-actions">
              <Link
                href={`/orcamento?necessidade=${encodeURIComponent(content.eyebrow)}`}
                className="button button-primary button-large"
              >
                Analisar meu processo <ArrowUpRight size={17} />
              </Link>
              <Link
                href="/contato"
                className="button button-ghost button-large"
              >
                Conversar com a equipe <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="inner-hero-visual">
            <div className="inner-visual-grid" />
            <div className="inner-visual-core">
              <Workflow size={27} />
            </div>
            <div className="inner-visual-node inner-visual-node-a">
              PROCESSO
            </div>
            <div className="inner-visual-node inner-visual-node-b">DADOS</div>
            <div className="inner-visual-node inner-visual-node-c">
              SISTEMAS
            </div>
            <span className="inner-visual-caption">
              ENTENDER → DESENHAR → DESENVOLVER
            </span>
          </div>
        </div>
      </section>
      <section className="section service-detail-section">
        <div className="page-wrap service-detail-grid">
          <Reveal>
            <span className="eyebrow">DO CENÁRIO ATUAL À SOLUÇÃO</span>
            <h2>{content.intro}</h2>
            <p className="service-outcome">
              <Check size={18} />
              {content.outcome}
            </p>
          </Reveal>
          <Reveal delay={80}>
            <div className="service-points">
              <span className="eyebrow">ONDE PODEMOS ATUAR</span>
              {content.points.map((point, index) => (
                <div className="service-point" key={`${index}-${point}`}>
                  <span>
                    <Check size={15} />
                  </span>
                  {point}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
      {slug === "servicos" && <ServiceCatalog services={services} />}
      <section className="section service-approach">
        <div className="page-wrap">
          <Reveal>
            <SectionHeading
              eyebrow="PRIMEIRO ENTENDEMOS"
              title="Como a solução toma forma."
              description="O escopo é construído com quem conhece a operação e refinado a cada etapa."
            />
          </Reveal>
          <div className="approach-grid">
            {[
              [
                "01",
                "Ouvir",
                "Entender o objetivo, os usuários e o que hoje consome tempo.",
              ],
              [
                "02",
                "Desenhar",
                "Mapear o fluxo atual e definir o caminho de menor atrito.",
              ],
              [
                "03",
                "Construir",
                "Desenvolver, integrar e validar a solução com a operação.",
              ],
              [
                "04",
                "Evoluir",
                "Acompanhar o uso e planejar melhorias conforme a necessidade.",
              ],
            ].map(([number, title, text]) => (
              <Reveal key={number}>
                <article className="approach-card">
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="section service-final">
        <div className="page-wrap">
          <div className="service-final-panel">
            <div>
              <span className="eyebrow">VAMOS ENTENDER O SEU CONTEXTO</span>
              <h2>Qual parte do trabalho poderia funcionar melhor?</h2>
              <p>
                Conte o que acontece hoje. A conversa começa pelo processo, sem
                exigir que você chegue com a solução pronta.
              </p>
            </div>
            <Link
              href={`/orcamento?necessidade=${encodeURIComponent(content.eyebrow)}`}
              className="button button-primary button-large"
            >
              Conte seu projeto <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
