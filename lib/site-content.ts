export const servicePages = {
  servicos: {
    eyebrow: "O QUE CONSTRUÍMOS",
    title: "Tecnologia aplicada ao jeito que sua empresa trabalha.",
    description:
      "Da primeira análise à implantação, combinamos desenvolvimento de software, automação, dados e integração para resolver necessidades concretas.",
    intro:
      "Cada projeto parte das pessoas, das regras e das ferramentas que fazem o trabalho acontecer hoje.",
    points: [
      "Sistemas personalizados e aplicações web",
      "Automação de processos e dados",
      "Integração entre sistemas e APIs",
      "Business Intelligence e dashboards",
      "Inteligência artificial aplicada",
      "Aplicativos, PWA e plataformas SaaS",
      "Consultoria, diagnóstico e assessoria tecnológica",
    ],
    outcome:
      "Uma solução desenhada para o contexto da operação, com espaço para crescer e evoluir.",
  },
  solucoes: {
    eyebrow: "SOLUÇÕES PARA PROBLEMAS REAIS",
    title: "Uma ferramenta não resolve tudo. Um bom desenho começa pelo todo.",
    description:
      "Conectamos processos, pessoas e sistemas em soluções que reduzem atrito e tornam o trabalho mais claro.",
    intro:
      "A solução pode ser uma automação pequena, uma integração ou um sistema completo. O diagnóstico ajuda a decidir.",
    points: [
      "Fluxos empresariais digitais",
      "Portais e áreas de trabalho internas",
      "Integrações de ERP, CRM e APIs",
      "Pipelines e processamento de dados",
      "Dashboards e indicadores operacionais",
      "Aplicações web e mobile",
      "Assistentes e agentes de IA",
    ],
    outcome:
      "A tecnologia acompanha o processo e se conecta ao que a empresa já usa.",
  },
  automacao: {
    eyebrow: "AUTOMAÇÃO DE PROCESSOS",
    title:
      "Processos que hoje dependem de trabalho manual podem trabalhar por você.",
    description:
      "Mapeamos tarefas repetitivas e construímos fluxos que validam, encaminham e atualizam informações com consistência.",
    intro:
      "Automação começa entendendo cada exceção, decisão e transferência que existe no processo atual.",
    points: [
      "Entrada e validação de dados",
      "Aprovações e notificações",
      "Geração de documentos e relatórios",
      "Cadastros, conferências e atualização de sistemas",
      "Workflows administrativos",
      "Rotinas agendadas e processamento de arquivos",
      "Integrações com APIs e ferramentas externas",
    ],
    outcome:
      "Menos repetição, mais previsibilidade e um processo que pode ser acompanhado.",
  },
  dados: {
    eyebrow: "AUTOMAÇÃO DE DADOS · BI",
    title:
      "Transformamos dados espalhados em informação organizada e automatizada.",
    description:
      "Capturamos, tratamos, validamos e conectamos dados para que relatórios e decisões deixem de depender de atualizações manuais.",
    intro:
      "Excel e CSV podem continuar no processo. O importante é que dados, validações e atualizações circulem de forma confiável.",
    points: [
      "Pipelines e processos ETL",
      "Consolidação de Excel, CSV, APIs e bancos",
      "Limpeza, validação e cruzamento de dados",
      "Relatórios e atualizações automáticas",
      "Dashboards, KPIs e monitoramento",
      "Sincronização entre sistemas",
      "Análise e visualização para apoiar decisões",
    ],
    outcome: "Dados consistentes, acessíveis e úteis para entender a operação.",
  },
  "inteligencia-artificial": {
    eyebrow: "INTELIGÊNCIA ARTIFICIAL APLICADA",
    title: "Aplicamos IA onde ela realmente gera valor.",
    description:
      "Projetamos usos práticos de inteligência artificial com escopo definido, dados protegidos e validação humana quando necessário.",
    intro:
      "A pergunta não é onde colocar IA. É qual tarefa pode melhorar com ela e como medir a qualidade do resultado.",
    points: [
      "Análise e classificação de documentos",
      "Extração de informações estruturadas",
      "Assistentes internos e busca contextual",
      "Análise de texto e categorização",
      "Geração assistida de relatórios",
      "Automação inteligente de tarefas",
      "Agentes conectados a processos empresariais",
    ],
    outcome:
      "IA integrada a um fluxo claro, com limites, critérios e acompanhamento.",
  },
  consultoria: {
    eyebrow: "CONSULTORIA TECNOLÓGICA",
    title:
      "A empresa conhece o problema. Vamos descobrir juntos o próximo passo.",
    description:
      "Analisamos processos, requisitos e ferramentas para transformar uma necessidade difusa em um plano técnico acionável.",
    intro:
      "Você não precisa chegar com a especificação. O trabalho começa ouvindo quem vive o processo.",
    points: [
      "Diagnóstico e mapeamento de processos",
      "Levantamento de requisitos",
      "Identificação de oportunidades de automação",
      "Desenho de solução e arquitetura",
      "Escolha de tecnologias com critério",
      "Planejamento por etapas e prioridades",
      "Acompanhamento de implantação",
    ],
    outcome:
      "Uma recomendação ligada ao seu cenário, com próximos passos claros.",
  },
  assessoria: {
    eyebrow: "ASSESSORIA TECNOLÓGICA CONTÍNUA",
    title:
      "Tecnologia também precisa de acompanhamento depois de entrar em operação.",
    description:
      "Apoiamos a evolução de sistemas, processos, integrações e dados conforme novas necessidades aparecem.",
    intro:
      "A assessoria cria um ponto de apoio para avaliar mudanças, reduzir riscos e priorizar melhorias.",
    points: [
      "Acompanhamento de sistemas e automações",
      "Avaliação de melhorias e novas integrações",
      "Organização de backlog técnico",
      "Análise de processos e gargalos",
      "Orientação sobre dados e indicadores",
      "Apoio em decisões de arquitetura",
      "Planejamento de evolução tecnológica",
    ],
    outcome:
      "Decisões técnicas com contexto e uma visão contínua do que pode melhorar.",
  },
} as const;

export type ServiceSlug = keyof typeof servicePages;

export const servicePageNames: Record<ServiceSlug, string> = {
  servicos: "Serviços de tecnologia",
  solucoes: "Soluções para empresas",
  automacao: "Automação de processos",
  dados: "Automação de dados e BI",
  "inteligencia-artificial": "Inteligência artificial aplicada",
  consultoria: "Consultoria tecnológica",
  assessoria: "Assessoria tecnológica",
};

export type LandingContent = {
  eyebrow: string;
  title: string;
  description: string;
  intro: string;
  points: string[];
  outcome: string;
  seoTitle: string;
  seoDescription: string;
};

export const defaultAbout = {
  title: "Nosso trabalho começa antes do código.",
  description:
    "A VIEIRA SYSTEMS nasceu com uma proposta simples: entender problemas reais e desenvolver soluções tecnológicas capazes de melhorar a forma como empresas trabalham.",
  body: "Atuamos combinando software, automação, dados, inteligência artificial e consultoria tecnológica. Cada escolha considera o processo e o resultado que a empresa precisa alcançar.\n\nComeçamos ouvindo quem vive o processo, mapeamos o cenário e definimos juntos o que vale a pena construir.",
};

export const defaultFooter = {
  description:
    "Entendemos o trabalho por trás do processo. Depois, construímos a tecnologia que faz ele fluir.",
  ctaLabel: "Conte seu projeto",
};

export const defaultContact = {
  title: "Uma conversa é suficiente para começar.",
  description:
    "Conte como o processo funciona hoje, onde ele trava e o que você gostaria de melhorar. Não precisa saber qual tecnologia usar.",
};
