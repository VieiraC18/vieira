import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Braces,
  ChartNoAxesCombined,
  Database,
  GitMerge,
  Layers3,
  Network,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";
import { HeroFlow } from "@/components/site/hero-flow";
import { MethodTimeline } from "@/components/site/method-timeline";
import { ProblemSelector } from "@/components/site/problem-selector";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { BrandIcon } from "@/components/brand/brand";
import {
  getContent,
  getPublicServices,
  getPublicSettings,
} from "@/lib/server/public";
import { defaultContent } from "@/lib/server/defaults";
import { pageMetadata } from "@/lib/seo";

const serviceIcons: Record<string, typeof Braces> = {
  software: Braces,
  "automacao-de-processos": Workflow,
  "automacao-de-dados": Database,
  "dados-e-bi": ChartNoAxesCombined,
  integracoes: Network,
  "inteligencia-artificial": Sparkles,
};

export async function generateMetadata() {
  const settings = await getPublicSettings();
  return pageMetadata({
    title: settings.seoTitle,
    description: settings.seoDescription,
    path: "/",
  });
}

export default async function HomePage() {
  const [hero, solutions, differentials, faq, services] = await Promise.all([
    getContent(
      "hero",
      defaultContent.hero as {
        eyebrow: string;
        title: string;
        description: string;
        primaryCta: string;
        secondaryCta: string;
      },
    ),
    getContent(
      "solutions",
      defaultContent.solutions as {
        title: string;
        description: string;
        items: { title: string; description: string; need: string }[];
      },
    ),
    getContent(
      "differentials",
      defaultContent.differentials as {
        title: string;
        description: string;
        items: { title: string; description: string }[];
      },
    ),
    getContent(
      "faq",
      defaultContent.faq as {
        title: string;
        items: { question: string; answer: string }[];
      },
    ),
    getPublicServices(),
  ]);
  const featured = services.filter((service) => service.featured).slice(0, 6);
  const titleParts = hero.title.split("em soluções digitais.");
  return (
    <>
      <section className="hero-section">
        <div className="hero-grid page-wrap">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="status-dot" /> {hero.eyebrow}
            </div>
            <h1>
              {titleParts.length === 2 ? (
                <>
                  {titleParts[0]}
                  <span>em soluções digitais.</span>
                  {titleParts[1]}
                </>
              ) : (
                hero.title
              )}
            </h1>
            <p className="hero-description">{hero.description}</p>
            <div className="hero-actions">
              <Link
                href="/orcamento"
                className="button button-primary button-large"
              >
                {hero.primaryCta} <ArrowUpRight size={17} />
              </Link>
              <Link
                href="/solucoes"
                className="button button-ghost button-large"
              >
                {hero.secondaryCta} <ArrowRight size={16} />
              </Link>
            </div>
            <div className="hero-signals">
              <span>
                <i /> Sites e software sob medida
              </span>
              <span>
                <i /> Automação e dados
              </span>
              <span>
                <i /> Consultoria tecnológica
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-visual-heading">
              <span>DO SEU CENÁRIO À SOLUÇÃO</span>
              <span className="hero-visual-tag">Sob medida</span>
            </div>
            <HeroFlow />
            <div className="hero-visual-stages" aria-label="Nosso processo">
              <span>
                <b>01</b> Entender
              </span>
              <ArrowRight size={13} aria-hidden="true" />
              <span>
                <b>02</b> Construir
              </span>
              <ArrowRight size={13} aria-hidden="true" />
              <span>
                <b>03</b> Evoluir
              </span>
            </div>
          </div>
        </div>
        <a className="hero-scroll" href="#problema">
          <span>Role para explorar</span>
          <ArrowDown size={15} />
        </a>
        <div className="hero-bottom-line" />
      </section>

      <section className="section section-problem" id="problema">
        <div className="page-wrap">
          <div className="problem-intro">
            <Reveal>
              <span className="eyebrow">A TECNOLOGIA VEM DEPOIS</span>
              <h2>Você não precisa saber qual tecnologia precisa.</h2>
            </Reveal>
            <Reveal delay={90}>
              <p>
                Explique o problema. Nós entendemos o cenário, mapeamos o
                processo e encontramos uma solução que faça sentido para o
                trabalho real.
              </p>
              <Link href="/consultoria" className="text-link">
                Como funciona o diagnóstico <ArrowUpRight size={15} />
              </Link>
            </Reveal>
          </div>
          <Reveal className="problem-map" delay={120}>
            <div className="problem-pain-list">
              <span className="map-label">O QUE ATRAPALHA</span>
              <span>Retrabalho</span>
              <span>Planilhas isoladas</span>
              <span>Dados espalhados</span>
              <span>Sistemas desconectados</span>
            </div>
            <div className="map-center">
              <span className="map-line map-line-left" />
              <div className="map-brand">
                <BrandIcon size={55} />
              </div>
              <strong>
                VIEIRA
                <br />
                SYSTEMS
              </strong>
              <span className="map-line map-line-right" />
            </div>
            <div className="problem-result-list">
              <span className="map-label">O QUE PODE MUDAR</span>
              <span>Automação</span>
              <span>Integração</span>
              <span>Software</span>
              <span>Decisões com dados</span>
            </div>
            <div className="map-caption">
              Entender antes de desenvolver. Construir para melhorar o que
              acontece todos os dias.
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-explorer" id="solucoes">
        <div className="page-wrap">
          <Reveal>
            <SectionHeading
              eyebrow="COMECE PELO QUE PRECISA MELHORAR"
              title={solutions.title}
              description={solutions.description}
            />
          </Reveal>
          <Reveal delay={80}>
            <ProblemSelector items={solutions.items} />
          </Reveal>
        </div>
      </section>

      <section className="section section-services" id="servicos">
        <div className="page-wrap">
          <Reveal>
            <div className="section-top-row">
              <SectionHeading
                eyebrow="CAPACIDADES QUE TRABALHAM JUNTAS"
                title="Uma solução pode combinar várias disciplinas."
                description="Software, processos e dados conectados ao que sua empresa precisa fazer melhor."
              />
              <Link
                href="/servicos"
                className="button button-outline section-top-cta"
              >
                Ver todos os serviços <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
          <div className="discipline-grid">
            {featured.map((service, index) => {
              const ServiceIcon = serviceIcons[service.slug] ?? Braces;
              return (
                <Reveal key={service.id} delay={index * 45}>
                  <Link
                    href={`/servicos/${service.slug}`}
                    className="discipline-card"
                  >
                    <div className="discipline-top">
                      <span className="discipline-symbol" aria-hidden="true">
                        <ServiceIcon size={22} strokeWidth={1.5} />
                      </span>
                      <span className="discipline-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3>{service.name}</h3>
                    <p>{service.summary}</p>
                    <span className="discipline-link">
                      Explorar <ArrowUpRight size={14} />
                    </span>
                    <span className="discipline-glow" />
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-spreadsheet" id="automacao">
        <div className="page-wrap spreadsheet-layout">
          <Reveal className="spreadsheet-copy">
            <span className="eyebrow">
              A EVOLUÇÃO PODE COMEÇAR DO QUE JÁ EXISTE
            </span>
            <h2>Planilhas também podem fazer parte de um processo melhor.</h2>
            <p>
              Nem todo processo precisa abandonar as ferramentas atuais. Muitas
              vezes podemos integrar, automatizar e melhorar o que já funciona.
            </p>
            <Link href="/dados" className="text-link">
              Entenda automação de dados <ArrowUpRight size={15} />
            </Link>
          </Reveal>
          <Reveal className="spreadsheet-flow" delay={100}>
            <div className="flow-column flow-before">
              <span className="flow-column-title">ANTES · ETAPAS MANUAIS</span>
              <span>
                <i className="file-mini">X</i> Excel
              </span>
              <b>↓</b>
              <span>Conferência manual</span>
              <b>↓</b>
              <span>E-mail</span>
              <b>↓</b>
              <span>Outra planilha</span>
              <b>↓</b>
              <span>Relatório manual</span>
            </div>
            <div className="flow-bridge">
              <span className="bridge-line" />
              <div>
                <BrandIcon size={40} />
              </div>
              <span className="bridge-line" />
            </div>
            <div className="flow-column flow-after">
              <span className="flow-column-title">
                DEPOIS · FLUXO CONECTADO
              </span>
              <span>
                <Braces size={16} /> Sistema
              </span>
              <b>↓</b>
              <span>
                <Database size={16} /> Banco organizado
              </span>
              <b>↓</b>
              <span>
                <Zap size={16} /> Automação
              </span>
              <b>↓</b>
              <span>
                <ChartNoAxesCombined size={16} /> Dashboard
              </span>
              <b>↓</b>
              <span>
                <Workflow size={16} /> Notificação
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-method">
        <div className="page-wrap">
          <Reveal>
            <SectionHeading
              eyebrow="DO PRIMEIRO ENTENDIMENTO À EVOLUÇÃO"
              title="Um processo claro para uma solução que funciona."
              description="Cada etapa reduz incertezas e aproxima a tecnologia da rotina de quem vai usar."
              align="center"
            />
          </Reveal>
          <MethodTimeline />
          <div className="method-bottom">
            <span>
              <Layers3 size={17} /> Visão de processo antes de código
            </span>
            <span>
              <GitMerge size={17} /> Integração pensada desde o desenho
            </span>
            <span>
              <Zap size={17} /> Evolução acompanhada
            </span>
          </div>
        </div>
      </section>

      <section className="section section-case">
        <div className="page-wrap">
          <Reveal>
            <div className="case-panel">
              <div className="case-orb">
                <BrandIcon size={130} />
                <span className="case-orb-ring" />
                <span className="case-orb-ring case-orb-ring-two" />
              </div>
              <div className="case-copy">
                <span className="eyebrow">
                  DEMONSTRAÇÃO TÉCNICA · VIEIRA SYSTEMS
                </span>
                <h2>Uma plataforma que mostra o trabalho de ponta a ponta.</h2>
                <p>
                  Este projeto reúne presença institucional, captação
                  estruturada e uma base administrativa para acompanhar
                  oportunidades. Um exemplo prático de como software e processo
                  podem trabalhar juntos.
                </p>
                <Link href="/projetos" className="button button-outline">
                  Explorar projetos <ArrowRight size={16} />
                </Link>
              </div>
              <div className="case-aside">
                <span>
                  <i /> Site institucional
                </span>
                <span>
                  <i /> Wizard de orçamento
                </span>
                <span>
                  <i /> Mini CRM integrado
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-differences" id="diferenciais">
        <div className="page-wrap">
          <Reveal>
            <SectionHeading
              eyebrow="COMO PENSAMOS CADA ENTREGA"
              title={differentials.title}
              description={differentials.description}
            />
          </Reveal>
          <div className="difference-grid">
            {differentials.items.map(({ title, description }, index) => (
              <Reveal key={title} delay={index * 35}>
                <article>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      {faq.items.length > 0 && (
        <section className="section section-faq" id="faq">
          <div className="page-wrap faq-layout">
            <Reveal>
              <SectionHeading
                eyebrow="UMA CONVERSA MAIS CLARA"
                title={faq.title}
                description="Algumas respostas para ajudar a dar o primeiro passo."
              />
            </Reveal>
            <div>
              {faq.items.map((item) => (
                <details className="faq-item" key={item.question}>
                  <summary>
                    {item.question}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="section section-cta">
        <div className="page-wrap">
          <Reveal>
            <div className="final-cta">
              <div className="final-cta-icon">
                <BrandIcon size={58} />
              </div>
              <span className="eyebrow">
                O PRÓXIMO PASSO COMEÇA COM UMA CONVERSA
              </span>
              <h2>
                Existe algum processo na sua empresa que poderia funcionar
                melhor?
              </h2>
              <p>
                Conte como ele funciona hoje. A VIEIRA SYSTEMS pode analisar seu
                cenário e identificar oportunidades de automação, integração ou
                desenvolvimento.
              </p>
              <div className="final-cta-actions">
                <Link
                  href="/orcamento"
                  className="button button-primary button-large"
                >
                  Analisar meu processo <ArrowUpRight size={17} />
                </Link>
                <Link
                  href="/contato"
                  className="button button-ghost button-large"
                >
                  Falar com a VIEIRA SYSTEMS <ArrowRight size={16} />
                </Link>
              </div>
              <span className="cta-note">
                Você descreve o cenário. Nós ajudamos a encontrar o caminho.
              </span>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
