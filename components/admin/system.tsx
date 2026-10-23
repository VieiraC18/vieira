"use client";

import { Activity, Database, RefreshCw, ShieldCheck } from "lucide-react";
import {
  useResource,
  PageHeading,
  LoadingState,
  ErrorState,
  EmptyState,
  dateLabel,
} from "./shared";
type SystemData = {
  database: { connected: boolean; configured: boolean; message?: string };
  counts: Record<string, number>;
  auditLogs: {
    id: string;
    action: string;
    entity: string;
    entityId?: string;
    userName?: string;
    createdAt: string;
  }[];
  environment: string;
};
const entities: Record<string, string> = {
  users: "Usuários",
  projects: "Projetos",
  services: "Serviços",
  leads: "Leads",
  sessions: "Sessões",
  contentSections: "Seções de conteúdo",
  content_sections: "Seções de conteúdo",
  leadNotes: "Notas",
  lead_notes: "Notas",
  auditLogs: "Registros de auditoria",
  audit_logs: "Registros de auditoria",
  project: "Projeto",
  service: "Serviço",
  user: "Usuário",
  lead: "Lead",
  content: "Conteúdo",
  settings: "Configurações",
  session: "Sessão",
};
const actions: Record<string, string> = {
  create: "Criação",
  update: "Atualização",
  delete: "Exclusão",
  login: "Entrada no workspace",
  logout: "Saída do workspace",
  status: "Alteração de status",
  note: "Nota adicionada",
};
export function SystemOverview() {
  const { data, error, loading, reload } =
    useResource<SystemData>("/api/admin/system");
  return (
    <>
      <PageHeading
        title="Sistema"
        description="Conexão, registros e rastreabilidade da operação administrativa."
      >
        <button className="adm-button" onClick={reload} disabled={loading}>
          <RefreshCw size={17} /> Atualizar
        </button>
      </PageHeading>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : (
        data && (
          <>
            <div className="adm-system-cards">
              <section className="adm-panel adm-panel-body">
                <Database size={24} />
                <h2>Banco de dados</h2>
                <span
                  className={`adm-status ${data.database.connected ? "adm-status-closed" : "adm-status-lost"}`}
                >
                  <i />
                  {data.database.connected
                    ? "Conectado"
                    : data.database.configured
                      ? "Conexão indisponível"
                      : "Não configurado"}
                </span>
                <p>
                  {data.database.message ||
                    "Status obtido ao consultar o banco neste momento."}
                </p>
              </section>
              <section className="adm-panel adm-panel-body">
                <ShieldCheck size={24} />
                <h2>Ambiente</h2>
                <strong className="adm-environment">
                  {data.environment === "production"
                    ? "Produção"
                    : data.environment === "development"
                      ? "Desenvolvimento"
                      : data.environment}
                </strong>
                <p>
                  Ações administrativas passam por validação de sessão e
                  permissões.
                </p>
              </section>
              <section className="adm-panel adm-panel-body">
                <Activity size={24} />
                <h2>Registros armazenados</h2>
                <dl className="adm-properties">
                  {Object.entries(data.counts).map(([key, count]) => (
                    <div key={key}>
                      <dt>{entities[key] || key}</dt>
                      <dd>{Number(count).toLocaleString("pt-BR")}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
            <section className="adm-panel">
              <div className="adm-panel-heading">
                <div>
                  <h2>Auditoria recente</h2>
                  <p>
                    Registro das ações realizadas por pessoas com acesso ao
                    workspace.
                  </p>
                </div>
              </div>
              {data.auditLogs.length ? (
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Ação</th>
                        <th>Área</th>
                        <th>Responsável</th>
                        <th>Quando</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td>{actions[log.action] || log.action}</td>
                          <td>{entities[log.entity] || log.entity}</td>
                          <td>{log.userName || "Sistema"}</td>
                          <td>{dateLabel(log.createdAt, true)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  title="O histórico começa com o uso"
                  description="As alterações feitas no workspace serão registradas aqui."
                />
              )}
            </section>
          </>
        )
      )}
    </>
  );
}
