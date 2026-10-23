import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { BrandIcon } from "@/components/brand/brand";
import { JsonLd } from "@/components/site/json-ld";
import { getPublicProjects } from "@/lib/server/public";
import { breadcrumbSchema, getSiteOrigin, pageMetadata } from "@/lib/seo";
import { safeImageUrl, safeWebUrl } from "@/lib/public-links";
import styles from "@/components/site/public-content.module.css";

const findProject = cache(async (slug: string) =>
  (await getPublicProjects()).find((item) => item.slug === slug),
);
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const project = await findProject(slug);
  if (!project) notFound();
  return pageMetadata({
    title: project.title,
    description: project.description,
    path: `/projetos/${project.slug}`,
    image: project.image,
  });
}

export default async function ProjectDetail({ params }: Props) {
  const { slug } = await params;
  const [project, origin] = await Promise.all([
    findProject(slug),
    getSiteOrigin(),
  ]);
  if (!project) notFound();
  const cover = safeImageUrl(project.image);
  const externalUrl = safeWebUrl(project.url);
  const kind =
    project.kind === "concept"
      ? "Projeto conceitual"
      : project.kind === "technical"
        ? "Demonstração técnica"
        : "Case de projeto";
  const sections = [
    { id: "problema", title: "Problema", text: project.problem },
    { id: "cenario", title: "Cenário", text: project.context },
    { id: "analise", title: "Análise", text: project.analysis },
    { id: "solucao", title: "Solução", text: project.solution },
    {
      id: "desenvolvimento",
      title: "Desenvolvimento",
      text: project.development,
    },
    { id: "resultado", title: "Resultado", text: project.result },
  ].filter((section) => Boolean(section.text.trim()));
  const gallery = project.gallery
    .map(safeImageUrl)
    .filter((url): url is string => Boolean(url));
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(origin, [
            { name: "Início", path: "/" },
            { name: "Projetos", path: "/projetos" },
            { name: project.title, path: `/projetos/${project.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: project.title,
            description: project.description,
            genre: kind,
            creator: {
              "@type": "Organization",
              name: "VIEIRA SYSTEMS",
              ...(origin ? { "@id": `${origin}/#organization` } : {}),
            },
            ...(origin ? { url: `${origin}/projetos/${project.slug}` } : {}),
          },
        ]}
      />
      <section className="case-study-hero page-wrap">
        <nav className="breadcrumb" aria-label="Você está em">
          <Link href="/projetos">
            <ArrowLeft size={14} /> Projetos
          </Link>
          <span aria-hidden="true">/</span>
          <span>{project.title}</span>
        </nav>
        <div className="case-study-heading">
          <span className="project-tag">
            {kind} · {project.category}
          </span>
          <h1>{project.title}</h1>
          <p>{project.description}</p>
          {project.client && !project.hideClient && (
            <p>Cliente: {project.client}</p>
          )}
          <div className="project-stack">
            {project.technologies.map((technology) => (
              <span key={technology}>{technology}</span>
            ))}
          </div>
          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-outline"
            >
              Visitar projeto <ArrowUpRight size={16} />
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          )}
        </div>
        {cover && (
          <Image
            src={cover}
            alt={`Visão do projeto ${project.title}`}
            width={1200}
            height={675}
            className={styles.cover}
            sizes="(max-width: 760px) 100vw, 1100px"
            unoptimized
          />
        )}
      </section>
      {(sections.length > 0 || gallery.length > 0) && (
        <section className="case-study-body">
          <div className="page-wrap case-study-grid">
            <aside>
              <span className="eyebrow">NESTE PROJETO</span>
              {sections.map((section) => (
                <a key={section.id} href={`#${section.id}`}>
                  {section.title}
                </a>
              ))}
              {gallery.length > 0 && <a href="#galeria">Galeria</a>}
            </aside>
            <article>
              {sections.map((section, index) => (
                <section key={section.id} id={section.id}>
                  <span className="case-step">
                    {String(index + 1).padStart(2, "0")} ·{" "}
                    {section.title.toLocaleUpperCase("pt-BR")}
                  </span>
                  <h2>{section.title}</h2>
                  <p className={styles.paragraphs}>{section.text}</p>
                </section>
              ))}
              {gallery.length > 0 && (
                <section id="galeria">
                  <span className="case-step">EM DETALHES</span>
                  <h2>Galeria do projeto</h2>
                  <div className={styles.gallery}>
                    {gallery.map((url, index) => (
                      <figure key={`${index}-${url}`}>
                        <Image
                          src={url}
                          alt={`${project.title}: imagem ${index + 1} da galeria`}
                          width={1200}
                          height={800}
                          sizes="(max-width: 760px) 100vw, 850px"
                          unoptimized
                        />
                        <figcaption>
                          {project.title} · {index + 1} de {gallery.length}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </section>
              )}
            </article>
          </div>
        </section>
      )}
      <section className="section case-cta">
        <div className="page-wrap">
          <BrandIcon size={48} decorative />
          <span className="eyebrow">POSSUI UM PROBLEMA PARECIDO?</span>
          <h2>Conte como funciona hoje.</h2>
          <p>
            A VIEIRA SYSTEMS pode ajudar a mapear o processo e encontrar um
            caminho.
          </p>
          <Link
            href={`/orcamento?necessidade=${encodeURIComponent(project.category)}`}
            className="button button-primary button-large"
          >
            Conte seu projeto <ArrowUpRight size={17} />
          </Link>
          <Link href="/projetos" className="case-back-link">
            Ver outros projetos <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
