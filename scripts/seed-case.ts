import { loadEnvConfig } from "@next/env";
import { closeLocalClient, query, transaction } from "../lib/db";
import { randomUUID } from "node:crypto";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
async function main() {
  const slug = "plataforma-vieira-systems";
  if ((await query("SELECT id FROM projects WHERE slug=$1", [slug])).length) {
    console.log(
      "O case da plataforma já existe. Altere o conteúdo pelo painel.",
    );
    return;
  }
  const id = randomUUID();
  const description =
    "O próprio site da VIEIRA SYSTEMS como demonstração de uma plataforma que conecta conteúdo, solicitação de projetos e acompanhamento comercial.";
  const statements = [
    {
      text: `INSERT INTO projects (id,title,slug,category,description,problem,context,analysis,solution,development,result,kind,featured,published,image) VALUES ($1,$2,$3,'Software e automação',$4,$5,$6,$7,$8,$9,$10,'technical',true,true,'/projects/plataforma-vieira-systems.webp')`,
      values: [
        id,
        "Plataforma VIEIRA SYSTEMS",
        slug,
        description,
        "Apresentar diferentes capacidades técnicas de forma clara e receber solicitações com contexto suficiente para começar uma conversa de diagnóstico.",
        "Projeto da própria VIEIRA SYSTEMS. Uma presença institucional que precisava se conectar a um processo de captação e gestão de oportunidades, com conteúdo atualizável pela administração.",
        "O fluxo começa pela necessidade do visitante. Um formulário dividido em etapas organiza problema, processo atual e prioridade. No atendimento, essas informações precisam permanecer ligadas ao histórico da oportunidade.",
        "Site responsivo com um seletor de problemas e formulário de orçamento, ligado a um mini CRM. O painel permite acompanhar status, adicionar notas, gerenciar projetos e serviços e publicar conteúdo pelo CMS.",
        "Interface em React e Next.js, validação no servidor, schema e migrações com Drizzle e persistência PostgreSQL. A integração de produção utiliza Neon. Sessões revogáveis, perfis de acesso e auditoria protegem a gestão. Testes automatizados exercitam o fluxo do formulário até o painel.",
        "A implementação conecta o envio de um pedido ao acompanhamento administrativo. Conteúdo, portfólio e configurações podem ser atualizados no painel. Esta demonstração descreve funcionalidades do próprio projeto; não apresenta resultados comerciais ou ganhos percentuais de clientes.",
      ],
    },
  ];
  await transaction(statements);
  for (const name of [
    "Next.js",
    "React",
    "TypeScript",
    "PostgreSQL",
    "Drizzle",
    "Playwright",
  ]) {
    await query(
      "INSERT INTO technologies (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
      [name],
    );
    await query(
      "INSERT INTO project_technologies (project_id,technology_id) SELECT $1,id FROM technologies WHERE name=$2 ON CONFLICT DO NOTHING",
      [id, name],
    );
  }
  console.log(
    "Demonstração técnica da plataforma cadastrada. Nenhum cliente ou resultado comercial foi inventado.",
  );
}
main()
  .catch((error) => {
    console.error(
      error instanceof Error ? error.message : "Falha ao criar case.",
    );
    process.exitCode = 1;
  })
  .finally(closeLocalClient);
