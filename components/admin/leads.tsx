"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Search,
  Mail,
  Phone,
  Building2,
  Clock3,
  Send,
  Trash2,
} from "lucide-react";
import {
  api,
  useResource,
  PageHeading,
  LoadingState,
  ErrorState,
  EmptyState,
  Feedback,
  StatusBadge,
  statusLabels,
  dateLabel,
  Field,
  SplitList,
  type Lead,
} from "./shared";

export function LeadsList() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);
  const { data, error, loading, reload } = useResource<{
    items: Lead[];
    total: number;
  }>(
    `/api/admin/leads?search=${encodeURIComponent(debounced)}&status=${encodeURIComponent(status)}&page=${page}&limit=20`,
  );
  return (
    <>
      <PageHeading
        title="Leads"
        description="Da primeira conversa à solução entregue. Acompanhe cada oportunidade."
      />
      <div className="adm-toolbar">
        <label className="adm-search">
          <Search size={18} />
          <span className="sr-only">Buscar leads</span>
          <input
            type="search"
            placeholder="Buscar nome, empresa ou e-mail"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <select
          aria-label="Filtrar por status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option value="">Todos os status</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <span className="adm-muted">
          {data ? `${data.total} contatos` : ""}
        </span>
      </div>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : (
        <section className="adm-panel">
          {data?.items.length ? (
            <>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Contato</th>
                      <th>Necessidade</th>
                      <th>Prioridade</th>
                      <th>Status</th>
                      <th>Recebido em</th>
                      <th>
                        <span className="sr-only">Ação</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((lead) => (
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
                        <td>
                          {lead.needs?.slice(0, 2).join(", ") ||
                            "Não informado"}
                        </td>
                        <td>{lead.priority || "Não informada"}</td>
                        <td>
                          <StatusBadge status={lead.status} />
                        </td>
                        <td>{dateLabel(lead.createdAt)}</td>
                        <td>
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="adm-icon-button"
                            aria-label={`Abrir ${lead.name}`}
                          >
                            <ArrowUpRight size={18} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="adm-pagination">
                <span>
                  Página {page} de {Math.max(1, Math.ceil(data.total / 20))}
                </span>
                <div>
                  <button
                    className="adm-button"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Anterior
                  </button>
                  <button
                    className="adm-button"
                    disabled={page * 20 >= data.total}
                    onClick={() => setPage(page + 1)}
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              title={
                search || status
                  ? "Nenhum contato com esses filtros"
                  : "Sua próxima oportunidade aparece aqui"
              }
              description={
                search || status
                  ? "Experimente buscar por outro nome ou alterar o status."
                  : "Os contatos enviados no formulário do site serão organizados automaticamente neste espaço."
              }
            />
          )}
        </section>
      )}
    </>
  );
}

type LeadData = {
  lead: Lead;
  notes: { id: string; body: string; createdAt: string; authorName: string }[];
  events: {
    id: string;
    type: string;
    description: string;
    createdAt: string;
  }[];
};

export function LeadDetail({
  id,
  canDelete = false,
}: {
  id: string;
  canDelete?: boolean;
}) {
  const router = useRouter();
  const { data, error, loading, reload } = useResource<LeadData>(
    `/api/admin/leads/${id}`,
  );
  const [busy, setBusy] = useState(false);
  const [mutationError, setMutationError] = useState("");
  const [success, setSuccess] = useState("");
  const [note, setNote] = useState("");
  const [deleting, setDeleting] = useState(false);
  async function update(payload: { status?: string; note?: string }) {
    setBusy(true);
    setMutationError("");
    setSuccess("");
    try {
      await api(`/api/admin/leads/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      if (payload.note) setNote("");
      setSuccess(
        payload.note ? "Nota adicionada ao histórico." : "Status atualizado.",
      );
      reload();
    } catch (err) {
      setMutationError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    try {
      await api(`/api/admin/leads/${id}`, { method: "DELETE" });
      router.push("/admin/leads");
    } catch (err) {
      setMutationError((err as Error).message);
      setBusy(false);
    }
  }
  function submitNote(event: FormEvent) {
    event.preventDefault();
    if (note.trim()) void update({ note: note.trim() });
  }
  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} retry={reload} />;
  if (!data) return null;
  const { lead, notes, events } = data;
  const phone = lead.whatsapp.replace(/\D/g, "");
  const whatsapp = phone.length <= 11 ? `55${phone}` : phone;
  return (
    <>
      <Link className="adm-back-link" href="/admin/leads">
        <ArrowLeft size={16} /> Todos os leads
      </Link>
      <PageHeading
        title={lead.name}
        description={`Oportunidade recebida em ${dateLabel(lead.createdAt, true)}`}
      >
        <StatusBadge status={lead.status} />
      </PageHeading>
      <Feedback error={mutationError} success={success} />
      <div className="adm-detail-grid">
        <div>
          <section className="adm-panel adm-panel-body">
            <h2>Entenda o cenário</h2>
            <div className="adm-detail-section">
              <h3>Necessidade</h3>
              <SplitList values={lead.needs} />
            </div>
            <div className="adm-detail-section">
              <h3>O problema</h3>
              <p>{lead.problem || "Não informado"}</p>
            </div>
            <div className="adm-detail-section">
              <h3>Como funciona hoje</h3>
              <p>{lead.currentProcess || "Não informado"}</p>
            </div>
            <div className="adm-detail-section">
              <h3>Trabalho manual</h3>
              <p>{String(lead.manualWork || "Não informado")}</p>
            </div>
            <div className="adm-detail-columns">
              <div>
                <h3>Usa planilhas</h3>
                <p>
                  {lead.usesSpreadsheets === true
                    ? "Sim"
                    : lead.usesSpreadsheets === false
                      ? "Não"
                      : "Não informado"}
                </p>
              </div>
              <div>
                <h3>Possui sistema</h3>
                <p>
                  {lead.hasSystem === true
                    ? "Sim"
                    : lead.hasSystem === false
                      ? "Não"
                      : "Não informado"}
                </p>
              </div>
            </div>
            <div className="adm-detail-section">
              <h3>Funcionalidades desejadas</h3>
              <SplitList values={lead.features} />
            </div>
            <div className="adm-detail-columns">
              <div>
                <h3>Prioridade</h3>
                <p>{lead.priority || "Não informada"}</p>
              </div>
              <div>
                <h3>Investimento indicado</h3>
                <p>{lead.budget || "Não informado"}</p>
              </div>
            </div>
          </section>
          <section className="adm-panel adm-panel-body">
            <h2>Notas da oportunidade</h2>
            <form className="adm-note-form" onSubmit={submitNote}>
              <Field label="Adicionar uma nota">
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  maxLength={6000}
                  placeholder="Registre o que foi conversado e o próximo passo…"
                  required
                />
              </Field>
              <button
                className="adm-button adm-button-primary"
                disabled={busy || !note.trim()}
              >
                <Send size={16} />
                {busy ? "Salvando…" : "Adicionar nota"}
              </button>
            </form>
            {notes.length ? (
              <div className="adm-notes">
                {notes.map((item) => (
                  <article key={item.id}>
                    <div>
                      <strong>
                        {item.authorName || "Equipe VIEIRA SYSTEMS"}
                      </strong>
                      <time>{dateLabel(item.createdAt, true)}</time>
                    </div>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="adm-muted">
                As notas ajudam a manter contexto entre uma conversa e outra.
              </p>
            )}
          </section>
        </div>
        <aside>
          <section className="adm-panel adm-panel-body">
            <h2>Próximo passo</h2>
            <Field label="Status da oportunidade">
              <select
                value={lead.status}
                disabled={busy}
                onChange={(event) =>
                  void update({ status: event.target.value })
                }
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <div className="adm-contact-data">
              <p>
                <Building2 size={17} />
                <span>{lead.company || "Empresa não informada"}</span>
              </p>
              <a href={`mailto:${lead.email}`}>
                <Mail size={17} />
                <span>{lead.email}</span>
              </a>
              {lead.whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Phone size={17} />
                  <span>{lead.whatsapp}</span>
                  <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          </section>
          <section className="adm-panel adm-panel-body">
            <h2>Origem e campanha</h2>
            <dl className="adm-properties">
              {[
                ["Origem", lead.source],
                ["UTM source", lead.utmSource],
                ["UTM medium", lead.utmMedium],
                ["Campanha", lead.utmCampaign],
                ["Termo", lead.utmTerm],
                ["Conteúdo", lead.utmContent],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value || "Direto / não informado"}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="adm-panel adm-panel-body">
            <h2>Histórico de atividade</h2>
            {events.length ? (
              <ol className="adm-timeline">
                {events.map((item) => (
                  <li key={item.id}>
                    <Clock3 size={15} />
                    <div>
                      <p>{item.description}</p>
                      <time>{dateLabel(item.createdAt, true)}</time>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="adm-muted">
                Os eventos serão registrados conforme esta oportunidade evoluir.
              </p>
            )}
          </section>
          {canDelete && (
            <div className="adm-danger-zone">
              {deleting ? (
                <>
                  <p>
                    Excluir este contato, suas notas e seu histórico? Esta ação
                    não pode ser desfeita.
                  </p>
                  <div className="adm-inline-actions">
                    <button
                      className="adm-button adm-button-danger"
                      disabled={busy}
                      onClick={remove}
                    >
                      Confirmar exclusão
                    </button>
                    <button
                      className="adm-button"
                      onClick={() => setDeleting(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <button
                  className="adm-button adm-button-quiet adm-danger-text"
                  onClick={() => setDeleting(true)}
                >
                  <Trash2 size={16} /> Excluir lead
                </button>
              )}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
