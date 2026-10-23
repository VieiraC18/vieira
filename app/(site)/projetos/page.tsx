import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandIcon } from "@/components/brand/brand";
import { Reveal } from "@/components/site/reveal";
import { JsonLd } from "@/components/site/json-ld";
import { getPublicProjects } from "@/lib/server/public";
import { breadcrumbSchema, getSiteOrigin, pageMetadata } from "@/lib/seo";
import { safeImageUrl } from "@/lib/public-links";
import styles from "@/components/site/public-content.module.css";

const description =
  "Conheça projetos e demonstrações de software, automação e dados desenvolvidos pela VIEIRA SYSTEMS, apresentados a partir do problema que resolvem.";
export function generateMetadata() {
  return pageMetadata({
    title: "Projetos e demonstrações",
    description,
    path: "/projetos",
  });
}

export default async function ProjectsPage() {
  const [projects, origin] = await Promise.all([
    getPublicProjects(),
    getSiteOrigin(),
  ]);
  return (
    <>
      <JsonLd
        data={breadcrumbSchema(origin, [
          { name: "Início", path: "/" },
          { name: "Projetos", path: "/projetos" },
        ])}
      />
      <section className="inner-hero page-wrap">
        <nav className="breadcrumb" aria-label="Você está em">
          <Link href="/">Início</Link>
          <span aria-hidden="true">/</span>
          <span>Projetos</span>
        </nav>
        <div className="projects-hero">
          <span className="eyebrow">PROJETOS E DEMONSTRAÇÕES</span>
          <h1>Ideias técnicas explicadas pelo problema que resolvem.</h1>
          <p>
            Software, automação e dados vistos no contexto de cada operação.
            Cada projeto conta a história do cenário, das escolhas e da solução
            construída.
          </p>
        </div>
      </section>
      <section className="section projects-section">
        <div className={`page-wrap ${styles.projectList}`}>
          {projects.length ? (
            projects.map((project, index) => {
              const cover = safeImageUrl(project.image);
              const kind =
                project.kind === "concept"
                  ? "Projeto conceitual"
                  : project.kind === "technical"
                    ? "Demonstração técnica"
                    : "Case de projeto";
              return (
                <Reveal key={project.id} delay={Math.min(index * 40, 160)}>
                  <Link
                    href={`/projetos/${project.slug}`}
                    className="project-showcase"
                  >
                    <div className={styles.projectCover}>
                      {cover ? (
                        <Image
                          src={cover}
                          alt={`Visão do projeto ${project.title}`}
                          fill
                          sizes="(max-width: 760px) 100vw, 560px"
                          unoptimized
                        />
                      ) : (
                        <div className={styles.projectPlaceholder}>
                          <BrandIcon size={100} decorative />
                          <span>{project.category}</span>
                        </div>
                      )}
                    </div>
                    <div className="project-copy">
                      <span className="project-tag">
                        {kind}
                        {project.featured ? " · Em destaque" : ""}
                      </span>
                      <h2>{project.title}</h2>
                      <p>{project.description}</p>
                      {project.client && !project.hideClient && (
                        <p className={styles.client}>
                          Cliente: {project.client}
                        </p>
                      )}
                      <div className="project-stack">
                        {project.technologies.slice(0, 5).map((technology) => (
                          <span key={technology}>{technology}</span>
                        ))}
                      </div>
                      <span className="project-open">
                        Conhecer o projeto <ArrowUpRight size={17} />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })
          ) : (
            <div className={styles.empty}>
              <BrandIcon size={52} />
              <h2>Novos projetos serão apresentados por aqui.</h2>
              <p>
                Estamos preparando os primeiros relatos de projeto. Enquanto
                isso, conheça nossas áreas de atuação ou conte qual processo sua
                empresa quer melhorar.
              </p>
              <Link
                href="/servicos"
                className="button button-primary button-large"
              >
                Conhecer os serviços <ArrowUpRight size={17} />
              </Link>
            </div>
          )}
        </div>
      </section>
      <section className="section projects-principle">
        <div className="page-wrap">
          <BrandIcon size={42} decorative />
          <p>
            Cada projeto explica o cenário e o trabalho realizado. Demonstrações
            e projetos conceituais são identificados com clareza.
          </p>
        </div>
      </section>
    </>
  );
}
