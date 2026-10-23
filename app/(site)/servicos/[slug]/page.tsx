import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowLeft, ArrowUpRight, Check, Workflow } from "lucide-react";
import { JsonLd } from "@/components/site/json-ld";
import { ServiceCatalog } from "@/components/site/service-catalog";
import { getPublicServices } from "@/lib/server/public";
import { breadcrumbSchema, getSiteOrigin, pageMetadata } from "@/lib/seo";
import { safeImageUrl } from "@/lib/public-links";
import styles from "@/components/site/public-content.module.css";

const findService = cache(async (slug: string) =>
  (await getPublicServices()).find((item) => item.slug === slug),
);
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const service = await findService(slug);
  if (!service) notFound();
  return pageMetadata({
    title: service.seoTitle || service.name,
    description: service.seoDescription || service.summary,
    path: `/servicos/${service.slug}`,
    image: service.image,
  });
}

export default async function ServiceDetail({ params }: Props) {
  const { slug } = await params;
  const [service, origin, services] = await Promise.all([
    findService(slug),
    getSiteOrigin(),
    getPublicServices(),
  ]);
  if (!service) notFound();
  const image = safeImageUrl(service.image);
  const quote = `/orcamento?necessidade=${encodeURIComponent(service.name)}`;
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(origin, [
            { name: "Início", path: "/" },
            { name: "Serviços", path: "/servicos" },
            { name: service.name, path: `/servicos/${service.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: service.name,
            description: service.summary,
            serviceType: service.name,
            provider: {
              "@type": "Organization",
              name: "VIEIRA SYSTEMS",
              ...(origin ? { "@id": `${origin}/#organization` } : {}),
            },
            ...(origin ? { url: `${origin}/servicos/${service.slug}` } : {}),
          },
        ]}
      />
      <section className="inner-hero page-wrap">
        <nav className="breadcrumb" aria-label="Você está em">
          <Link href="/servicos">
            <ArrowLeft size={14} /> Serviços
          </Link>
          <span aria-hidden="true">/</span>
          <span>{service.name}</span>
        </nav>
        <div className="inner-hero-grid">
          <div>
            <span className="eyebrow">
              <Workflow size={13} /> TECNOLOGIA APLICADA À OPERAÇÃO
            </span>
            <h1>{service.name}</h1>
            <p className="inner-hero-description">{service.summary}</p>
            <div className="hero-actions">
              <Link href={quote} className="button button-primary button-large">
                Conte seu projeto <ArrowUpRight size={17} />
              </Link>
              <Link
                href="/contato"
                className="button button-ghost button-large"
              >
                Falar com a VIEIRA SYSTEMS
              </Link>
            </div>
          </div>
          <div className="service-points">
            <span className="eyebrow">DO CONTEXTO À ENTREGA</span>
            {[
              "Entendemos o processo atual",
              "Definimos o escopo com clareza",
              "Desenvolvemos e validamos juntos",
              "Planejamos a evolução",
            ].map((point) => (
              <div className="service-point" key={point}>
                <span>
                  <Check size={15} />
                </span>
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>
      {(service.description || image) && (
        <section className="section service-detail-section">
          <div className="page-wrap">
            <span className="eyebrow">COMO PODEMOS AJUDAR</span>
            <h2>Uma solução ligada ao seu contexto.</h2>
            {service.description && (
              <p
                className={`${styles.paragraphs} ${styles.serviceDescription}`}
              >
                {service.description}
              </p>
            )}
            {image && (
              <Image
                src={image}
                alt={`Visão do serviço ${service.name}`}
                width={1200}
                height={675}
                className={styles.cover}
                sizes="(max-width: 760px) 100vw, 1100px"
                unoptimized
              />
            )}
          </div>
        </section>
      )}
      <ServiceCatalog
        services={services.filter((item) => item.slug !== slug).slice(0, 4)}
      />
      <section className="section service-final">
        <div className="page-wrap">
          <div className="service-final-panel">
            <div>
              <span className="eyebrow">O PRIMEIRO PASSO É ENTENDER</span>
              <h2>Qual problema você quer resolver?</h2>
              <p>
                Descreva o cenário atual. Vamos conversar sobre o que faz
                sentido construir.
              </p>
            </div>
            <Link href={quote} className="button button-primary button-large">
              Analisar meu processo <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
