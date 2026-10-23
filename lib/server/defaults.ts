import type { PublicSettings, PublicService } from "@/lib/validators";
import { defaultProblems, defaultDifferentials } from "@/lib/home-content";
export const defaultSettings: PublicSettings = {
  companyName: "VIEIRA SYSTEMS",
  slogan: "Entender. Automatizar. Integrar. Desenvolver. Evoluir.",
  siteUrl: "",
  email: "vieirasystems@gmail.com",
  whatsapp: "5531994994744",
  instagram: "",
  linkedin: "",
  github: "",
  seoTitle: "VIEIRA SYSTEMS | Software, automação e dados",
  seoDescription:
    "Sistemas personalizados, automação de processos, integração, dados e inteligência artificial para a forma como sua empresa trabalha.",
  googleAnalyticsId: "",
  googleTagManagerId: "",
  metaPixelId: "",
  budgetEnabled: false,
  budgetRanges: [],
};
const serviceData = [
  [
    "software",
    "Desenvolvimento de software",
    "Sistemas personalizados construídos a partir do processo da sua empresa.",
    "Aplicações web, sistemas internos, portais e plataformas com regras de negócio, permissões e integrações definidas para cada operação.",
    "Code2",
  ],
  [
    "automacao-de-processos",
    "Automação de processos",
    "Processos que hoje dependem de trabalho manual podem trabalhar por você.",
    "Mapeamos entrada de dados, validações, aprovações, documentos, relatórios e notificações para construir fluxos confiáveis e acompanháveis.",
    "Workflow",
  ],
  [
    "automacao-de-dados",
    "Automação de dados",
    "Transformamos dados espalhados em informação organizada e automatizada.",
    "Captura, validação, transformação e sincronização de Excel, CSV, APIs e bancos. Pipelines e ETL que conectam fontes e entregam informação consistente.",
    "Database",
  ],
  [
    "dados-e-bi",
    "Dados e Business Intelligence",
    "Dados precisam gerar decisões, não apenas planilhas.",
    "Dashboards, KPIs, relatórios e monitoramento com definições claras e fontes rastreáveis para acompanhar a operação e apoiar decisões.",
    "ChartNoAxesCombined",
  ],
  [
    "integracoes",
    "Integração de sistemas",
    "Conectamos ferramentas que hoje trabalham separadamente.",
    "Integrações de ERP, CRM, aplicativos e serviços por APIs, webhooks, middleware e sincronização de dados.",
    "Network",
  ],
  [
    "inteligencia-artificial",
    "Inteligência artificial",
    "Aplicamos IA onde ela realmente gera valor.",
    "Assistentes internos, análise documental, classificação, extração de informações e automação inteligente com escopo, critérios e acompanhamento humano.",
    "Sparkles",
  ],
  [
    "aplicativos",
    "Aplicativos e PWA",
    "A operação da empresa acessível de onde o trabalho acontece.",
    "Aplicações móveis e PWAs com navegação responsiva, autenticação e funcionalidades pensadas para o contexto de uso.",
    "Smartphone",
  ],
  [
    "saas",
    "Plataformas SaaS",
    "Uma base técnica organizada para transformar uma ideia em produto.",
    "Arquitetura de plataformas, gestão de usuários, permissões e evolução modular para produtos digitais com operação contínua.",
    "Layers",
  ],
  [
    "sites",
    "Sites e portais sob medida",
    "Sites sob medida, com design e funcionalidades definidos a partir do que você precisa.",
    "Criamos sites institucionais, landing pages e portais de acordo com os objetivos, o público e a identidade de cada cliente. Planejamos o conteúdo, o design e as funcionalidades para cada projeto, com navegação responsiva, acessibilidade e integrações conforme a necessidade.",
    "Globe",
  ],
  [
    "consultoria",
    "Consultoria tecnológica",
    "Você conhece o problema. Nós ajudamos a definir o caminho.",
    "Diagnóstico, requisitos, desenho de solução, escolha de tecnologia e planejamento por etapas e prioridades.",
    "Compass",
  ],
  [
    "assessoria",
    "Assessoria tecnológica",
    "Acompanhamento para que sistemas e processos continuem evoluindo.",
    "Apoio contínuo em melhorias, integrações, dados, backlog técnico e decisões de arquitetura.",
    "Handshake",
  ],
  [
    "mapeamento",
    "Mapeamento de processos",
    "Entender como o trabalho acontece antes de desenhar a solução.",
    "Levantamento de etapas, responsáveis, decisões, exceções e transferências para identificar gargalos e oportunidades.",
    "GitBranch",
  ],
];
export const defaultServices: PublicService[] = serviceData.map(
  ([slug, name, summary, description, icon], index) => ({
    id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    slug,
    name,
    summary,
    description,
    icon,
    image: "",
    order: index,
    featured: index < 6,
    active: true,
    seoTitle: `${name} | VIEIRA SYSTEMS`,
    seoDescription: summary,
  }),
);
export const defaultContent: Record<string, unknown> = {
  hero: {
    eyebrow: "SITES · SOFTWARE · AUTOMAÇÃO · DADOS",
    title: "Transformamos processos, dados e ideias em soluções digitais.",
    description:
      "A VIEIRA SYSTEMS desenvolve sites, sistemas e automações sob medida, de acordo com os objetivos e as necessidades de cada cliente.",
    primaryCta: "Conte seu projeto",
    secondaryCta: "Conheça nossas soluções",
  },
  about: {
    title: "Nosso trabalho começa antes do código.",
    description:
      "A VIEIRA SYSTEMS nasceu com uma proposta simples: entender problemas reais e desenvolver soluções tecnológicas capazes de melhorar a forma como empresas trabalham.",
    body: "Atuamos combinando software, automação, dados, inteligência artificial e consultoria tecnológica. Primeiro entendemos. Depois desenvolvemos.",
  },
  contact: {
    title: "Vamos entender o seu cenário.",
    description:
      "Conte como o processo funciona hoje. Vamos identificar oportunidades de automação, integração ou desenvolvimento.",
  },
  footer: {
    description:
      "Software, automação e dados construídos a partir do seu processo.",
  },
  solutions: {
    title: "O que você precisa resolver?",
    description: "Comece pelo problema. A tecnologia vem depois.",
    items: defaultProblems,
  },
  differentials: {
    title: "Engenharia com visão de processo.",
    description:
      "Entendimento do contexto, desenvolvimento sob medida e evolução contínua.",
    items: defaultDifferentials,
  },
  faq: {
    title: "Antes de começar",
    items: [
      {
        question: "Preciso saber qual tecnologia quero?",
        answer:
          "Não. O primeiro passo é entender o problema, as pessoas e as ferramentas do processo atual.",
      },
      {
        question: "Precisamos abandonar nossas planilhas?",
        answer:
          "Nem sempre. Podemos integrar e automatizar as ferramentas que já funcionam, preservando o que faz sentido para a operação.",
      },
      {
        question: "Como é definido o investimento?",
        answer:
          "Depois do levantamento de requisitos e do desenho do escopo, construímos uma proposta adequada à necessidade.",
      },
    ],
  },
};
