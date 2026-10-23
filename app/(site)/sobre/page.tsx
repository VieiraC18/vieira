import Link from "next/link";
import { ArrowUpRight, Compass, GitBranch, ScanSearch } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand";
import { Reveal } from "@/components/site/reveal";
import { getContent } from "@/lib/server/public";
import { defaultAbout } from "@/lib/site-content";
import { breadcrumbSchema, getSiteOrigin, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/site/json-ld";
import styles from "@/components/site/public-content.module.css";

export async function generateMetadata() {
  const content = await getContent("about", defaultAbout);
  return pageMetadata({
    title: "Sobre a VIEIRA SYSTEMS",
    description: content.description,
    path: "/sobre",
  });
}
export default async function AboutPage() {
  const [content, origin] = await Promise.all([
    getContent("about", defaultAbout),
    getSiteOrigin(),
  ]);
  return (
    <>
      <JsonLd
        data={breadcrumbSchema(origin, [
          { name: "Início", path: "/" },
          { name: "Sobre", path: "/sobre" },
        ])}
      />
      <section className="inner-hero page-wrap">
        <div className="breadcrumb">
          <Link href="/">Início</Link>
          <span>/</span>
          <span>Sobre</span>
        </div>
        <div className="about-hero">
          <span className="eyebrow">SOBRE A VIEIRA SYSTEMS</span>
          <h1>{content.title}</h1>
          <p>{content.description}</p>
          <BrandLogo />
        </div>
      </section>
      <section className="section about-manifesto">
        <div className="page-wrap manifesto-grid">
          <Reveal>
            <span className="eyebrow">ENTENDER · DESENVOLVER · EVOLUIR</span>
            <h2>
              Primeiro entendemos.
              <br />
              <span>Depois desenvolvemos.</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <div>
              <p className={styles.paragraphs}>{content.body}</p>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="section about-principles">
        <div className="page-wrap">
          <div className="about-principle-grid">
            {[
              [
                Compass,
                "Contexto antes da ferramenta",
                "As decisões técnicas partem do trabalho real e de quem o executa.",
              ],
              [
                ScanSearch,
                "Clareza em cada etapa",
                "Explicamos o que será feito, como será validado e o que vem depois.",
              ],
              [
                GitBranch,
                "Soluções que evoluem",
                "Construímos com espaço para mudanças, integração e novas necessidades.",
              ],
            ].map(([Icon, title, text]) => {
              const I = Icon as typeof Compass;
              return (
                <Reveal key={title as string}>
                  <article className="about-principle">
                    <I size={21} />
                    <h3>{title as string}</h3>
                    <p>{text as string}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
      <section className="section service-final">
        <div className="page-wrap">
          <div className="service-final-panel">
            <div>
              <span className="eyebrow">CONVERSA SEM ESPECIFICAÇÃO PRONTA</span>
              <h2>Conte o que está acontecendo hoje.</h2>
              <p>
                A partir daí, podemos entender juntos quais oportunidades fazem
                sentido.
              </p>
            </div>
            <Link
              className="button button-primary button-large"
              href="/orcamento"
            >
              Analisar meu processo <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
