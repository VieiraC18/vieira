"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  Users,
  UserPlus,
  CalendarDays,
  MessageSquare,
  FileCheck2,
  Handshake,
  CircleCheck,
  Goal,
} from "lucide-react";
import {
  PageHeading,
  PeriodFilter,
  LoadingState,
  ErrorState,
  EmptyState,
  StatusBadge,
  dateLabel,
  useResource,
  periodQuery,
  statusLabels,
  type Lead,
} from "./shared";

type Datum = { label: string; value: number };
type DashboardData = {
  metrics: {
    total: number;
    new: number;
    thisMonth: number;
    meetings: number;
    proposals: number;
    negotiation: number;
    closed: number;
    conversion: number;
  };
  charts: {
    period: Datum[];
    source: Datum[];
    category: Datum[];
    status: Datum[];
    services: Datum[];
  };
  leads: Lead[];
};
const metrics = [
  { key: "total", label: "Total de leads", icon: Users },
  { key: "new", label: "Novos leads", icon: UserPlus },
  { key: "thisMonth", label: "Leads do mês", icon: CalendarDays },
  { key: "meetings", label: "Reuniões", icon: MessageSquare },
  { key: "proposals", label: "Propostas", icon: FileCheck2 },
  { key: "negotiation", label: "Em negociação", icon: Handshake },
  { key: "closed", label: "Fechados", icon: CircleCheck },
  { key: "conversion", label: "Conversão", icon: Goal },
] as const;

function Chart({
  title,
  data = [],
  variant = "horizontal",
}: {
  title: string;
  data: Datum[];
  variant?: "horizontal" | "vertical";
}) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const hasData = data.some((item) => item.value > 0);
  return (
    <section className="adm-panel adm-chart-panel">
      <div className="adm-panel-heading">
        <h2>{title}</h2>
        <span>Leads</span>
      </div>
      {hasData ? (
        <div
          className={`adm-chart adm-chart-${variant}`}
          role="img"
          aria-label={`${title}: ${data.map((item) => `${item.label}, ${item.value}`).join("; ")}`}
        >
          {data.map((item, index) => (
            <div className="adm-chart-item" key={`${item.label}-${index}`}>
              <span className="adm-chart-label">
                {variant === "vertical" &&
                /^\d{4}-\d{2}-\d{2}$/.test(item.label)
                  ? `${item.label.slice(8)}/${item.label.slice(5, 7)}`
                  : item.label}
              </span>
              <div className="adm-chart-track">
                <div
                  style={
                    variant === "vertical"
                      ? {
                          height: `${Math.max((item.value / max) * 100, item.value ? 2 : 0)}%`,
                        }
                      : { width: `${(item.value / max) * 100}%` }
                  }
                />
              </div>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Seu próximo insight começa aqui"
          description="Os gráficos serão preenchidos conforme novos contatos chegarem pelo site."
        />
      )}
    </section>
  );
}

function ConversionChart({
  total,
  closed,
  rate,
}: {
  total: number;
  closed: number;
  rate: number;
}) {
  return (
    <section className="adm-panel adm-chart-panel">
      <div className="adm-panel-heading">
        <h2>Conversão das oportunidades</h2>
        <span>Período selecionado</span>
      </div>
      {total ? (
        <div className="adm-conversion-chart">
          <div
            className="adm-donut"
            style={{
              background: `conic-gradient(var(--brand-cyan) ${Math.min(100, Math.max(0, rate)) * 3.6}deg, var(--surface-3) 0deg)`,
            }}
            role="img"
            aria-label={`${closed} de ${total} leads fechados. Conversão de ${rate.toLocaleString("pt-BR")} por cento.`}
          >
            <div>
              <strong>
                {rate.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
              </strong>
              <span>conversão</span>
            </div>
          </div>
          <div>
            <p>
              <i className="adm-legend-dot" />
              Fechados <strong>{closed}</strong>
            </p>
            <p>
              <i className="adm-legend-dot adm-legend-rest" />
              Demais leads <strong>{Math.max(0, total - closed)}</strong>
            </p>
            <small>Leads fechados / total de leads criados no período.</small>
          </div>
        </div>
      ) : (
        <EmptyState
          title="Conversão ainda sem dados"
          description="O percentual será calculado a partir dos contatos recebidos e dos negócios marcados como fechados."
        />
      )}
    </section>
  );
}

export function Dashboard({ analytics = false }: { analytics?: boolean }) {
  const [query, setQuery] = useState(() => periodQuery());
  const { data, error, loading, reload } = useResource<DashboardData>(
    `/api/admin/dashboard${query ? `?${query}` : ""}`,
  );
  return (
    <>
      <PageHeading
        title={analytics ? "Analytics" : "Visão geral"}
        description={
          analytics
            ? "Entenda de onde vêm as oportunidades e como elas evoluem."
            : "Acompanhe as oportunidades e mantenha os próximos passos em vista."
        }
      >
        <PeriodFilter value={query} onChange={setQuery} />
      </PageHeading>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : (
        data && (
          <>
            <div className="adm-metrics">
              {metrics.map(({ key, label, icon: Icon }) => (
                <section className="adm-metric" key={key}>
                  <div>
                    <span>{label}</span>
                    <Icon size={18} />
                  </div>
                  <strong>
                    {key === "conversion"
                      ? `${Number(data.metrics[key]).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`
                      : Number(data.metrics[key]).toLocaleString("pt-BR")}
                  </strong>
                  <small>
                    {key === "conversion"
                      ? "Fechados / leads do período"
                      : key === "thisMonth"
                        ? "Mês corrente no período"
                        : "Período selecionado"}
                  </small>
                </section>
              ))}
            </div>
            <div className="adm-chart-grid">
              <Chart
                title="Leads por período"
                data={data.charts.period}
                variant="vertical"
              />
              <Chart
                title="Origem das oportunidades"
                data={data.charts.source.map((item) => ({
                  ...item,
                  label: item.label === "direct" ? "Acesso direto" : item.label,
                }))}
              />
            </div>
            <div className="adm-chart-grid">
              <Chart
                title="Distribuição por status"
                data={data.charts.status.map((item) => ({
                  ...item,
                  label: statusLabels[item.label] || item.label,
                }))}
              />
              <ConversionChart
                total={data.metrics.total}
                closed={data.metrics.closed}
                rate={Number(data.metrics.conversion || 0)}
              />
            </div>
            {analytics ? (
              <>
                <div className="adm-chart-grid">
                  <Chart
                    title="Necessidades dos leads"
                    data={data.charts.category}
                  />
                  <Chart
                    title="Serviços mais procurados"
                    data={data.charts.services}
                  />
                </div>
                <div className="adm-chart-grid">
                  <Chart
                    title="Distribuição por status"
                    data={data.charts.status.map((item) => ({
                      ...item,
                      label: statusLabels[item.label] || item.label,
                    }))}
                  />
                  <section className="adm-panel adm-analytics-note">
                    <Goal size={28} />
                    <h2>Uma visão do funil, com contexto.</h2>
                    <p>
                      A taxa de conversão relaciona leads fechados ao total de
                      leads criados no período. As origens usam os dados
                      enviados no formulário e parâmetros de campanha.
                    </p>
                    <p>
                      Um lead pode selecionar mais de uma necessidade. Por isso,
                      a soma das categorias pode superar o total de contatos.
                      Serviços mais procurados usa as necessidades declaradas no
                      formulário.
                    </p>
                    <Link className="adm-button" href="/admin/leads">
                      Explorar leads <ArrowUpRight size={16} />
                    </Link>
                  </section>
                </div>
              </>
            ) : (
              <section className="adm-panel">
                <div className="adm-panel-heading">
                  <div>
                    <h2>Oportunidades recentes</h2>
                    <p>Cada conversa pode ser o começo de uma solução.</p>
                  </div>
                  <Link href="/admin/leads" className="adm-text-link">
                    Ver todos <ArrowUpRight size={16} />
                  </Link>
                </div>
                {data.leads.length ? (
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Contato</th>
                          <th>Necessidade</th>
                          <th>Status</th>
                          <th>Recebido em</th>
                          <th>
                            <span className="sr-only">Ação</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.leads.slice(0, 6).map((lead) => (
                          <tr key={lead.id}>
                            <td>
                              <Link
                                href={`/admin/leads/${lead.id}`}
                                className="adm-table-primary"
                              >
                                {lead.name}
                              </Link>
                              <small>{lead.company || lead.email}</small>
                            </td>
                            <td>{lead.needs?.[0] || "A entender"}</td>
                            <td>
                              <StatusBadge status={lead.status} />
                            </td>
                            <td>{dateLabel(lead.createdAt)}</td>
                            <td>
                              <Link
                                href={`/admin/leads/${lead.id}`}
                                className="adm-icon-button"
                                aria-label={`Abrir lead ${lead.name}`}
                              >
                                <ArrowUpRight size={18} />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    title="Pronto para a primeira conversa"
                    description="Quando alguém enviar o formulário de orçamento, o contato aparecerá aqui e no seu CRM."
                  >
                    <Link
                      className="adm-button"
                      href="/orcamento"
                      target="_blank"
                    >
                      Abrir formulário <ArrowUpRight size={16} />
                    </Link>
                  </EmptyState>
                )}
              </section>
            )}
          </>
        )
      )}
    </>
  );
}
