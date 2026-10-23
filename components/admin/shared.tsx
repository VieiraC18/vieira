"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  AlertCircle,
  Inbox,
  RefreshCw,
  Check,
  LoaderCircle,
} from "lucide-react";

export const statusLabels: Record<string, string> = {
  new: "Novo",
  analyzing: "Analisando",
  contacted: "Contato iniciado",
  meeting: "Reunião",
  proposal: "Proposta",
  negotiation: "Negociação",
  closed: "Fechado",
  lost: "Perdido",
  archived: "Arquivado",
};
export type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  whatsapp: string;
  needs: string[];
  problem: string;
  currentProcess: string;
  manualWork: string;
  usesSpreadsheets: boolean;
  hasSystem: boolean;
  features: string[];
  priority: string;
  budget: string;
  status: string;
  source: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  createdAt: string;
};
export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (response.status === 401 && !url.endsWith("/login")) {
    window.dispatchEvent(new Event("vs-session-expired"));
    throw new Error("Sua sessão expirou. Entre novamente.");
  }
  if (!response.ok) {
    const details = Array.isArray(result.issues)
      ? result.issues
          .slice(0, 3)
          .map(
            (issue: { path?: string; message?: string }) =>
              `${issue.path ? `${issue.path}: ` : ""}${issue.message || "Campo inválido"}`,
          )
          .join("; ")
      : "";
    throw new Error(
      details ||
        result.message ||
        result.error ||
        "Não foi possível concluir. Tente novamente.",
    );
  }
  return result as T;
}

export function useResource<T>(url: string) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{
    url: string;
    revision: number;
    data: T | null;
    error: string;
  }>({ url: "", revision: -1, data: null, error: "" });
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    api<T>(url, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted)
          setResult({ url, revision, data, error: "" });
      })
      .catch((err: Error) => {
        if (!controller.signal.aborted)
          setResult({ url, revision, data: null, error: err.message });
      });
    return () => controller.abort();
  }, [url, revision]);
  const loading = result.url !== url || result.revision !== revision;
  return {
    data: result.url === url ? result.data : null,
    error: loading ? "" : result.error,
    loading,
    reload,
  };
}

export function PageHeading({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className="adm-page-heading">
      <div>
        <p className="adm-eyebrow">Workspace / VIEIRA SYSTEMS</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children && <div className="adm-heading-actions">{children}</div>}
    </header>
  );
}
export function LoadingState() {
  return (
    <div
      className="adm-skeleton"
      role="status"
      aria-label="Carregando informações"
    >
      <div />
      <div />
      <div />
      <span className="sr-only">Carregando informações</span>
    </div>
  );
}
export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="adm-notice adm-error" role="alert">
      <AlertCircle size={20} />
      <div>
        <strong>Não foi possível carregar</strong>
        <p>{message}</p>
        {retry && (
          <button className="adm-button adm-button-quiet" onClick={retry}>
            <RefreshCw size={15} /> Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}
export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="adm-empty">
      <span className="adm-empty-icon">
        <Inbox size={25} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function Feedback({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  return (
    <div aria-live="polite">
      {error && (
        <p className="adm-feedback adm-feedback-error">
          <AlertCircle size={17} />
          {error}
        </p>
      )}
      {success && (
        <p className="adm-feedback adm-feedback-success">
          <Check size={17} />
          {success}
        </p>
      )}
    </div>
  );
}
export function SaveButton({
  busy,
  children = "Salvar alterações",
}: {
  busy: boolean;
  children?: ReactNode;
}) {
  return (
    <button
      className="adm-button adm-button-primary"
      type="submit"
      disabled={busy}
    >
      {busy ? (
        <LoaderCircle className="adm-spin" size={17} />
      ) : (
        <Check size={17} />
      )}
      {busy ? "Salvando…" : children}
    </button>
  );
}
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`adm-status adm-status-${status}`}>
      <i />
      {statusLabels[status] || status}
    </span>
  );
}
export function dateLabel(value: string, full = false) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    ...(full ? { timeStyle: "short" as const } : {}),
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}
export function Field({
  label,
  children,
  help,
  wide = false,
}: {
  label: string;
  children: ReactNode;
  help?: string;
  wide?: boolean;
}) {
  return (
    <label className={`adm-field${wide ? " adm-field-wide" : ""}`}>
      <span>{label}</span>
      {children}
      {help && <small>{help}</small>}
    </label>
  );
}
export function SplitList({ values }: { values?: string[] }) {
  return values?.length ? (
    <div className="adm-tags">
      {values.map((value, index) => (
        <span key={`${value}-${index}`}>{value}</span>
      ))}
    </div>
  ) : (
    <span className="adm-muted">Não informado</span>
  );
}
export const lines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

export function periodQuery(period = "30") {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const from = new Date(`${today}T12:00:00Z`);
  if (period === "month") from.setUTCDate(1);
  else if (period === "year") {
    from.setUTCMonth(0);
    from.setUTCDate(1);
  } else from.setUTCDate(from.getUTCDate() - (Number(period) - 1));
  return `from=${from.toISOString().slice(0, 10)}&to=${today}`;
}

export function PeriodFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (query: string) => void;
}) {
  const [period, setPeriod] = useState("30");
  const params = new URLSearchParams(value);
  function select(next: string) {
    setPeriod(next);
    if (next === "custom") return;
    onChange(periodQuery(next));
  }
  return (
    <div className="adm-period">
      <label className="sr-only" htmlFor="admin-period">
        Período
      </label>
      <select
        id="admin-period"
        value={period}
        onChange={(event) => select(event.target.value)}
      >
        <option value="1">Hoje</option>
        <option value="7">Últimos 7 dias</option>
        <option value="30">Últimos 30 dias</option>
        <option value="month">Este mês</option>
        <option value="year">Este ano</option>
        <option value="custom">Personalizado</option>
      </select>
      {period === "custom" && (
        <>
          <input
            aria-label="Data inicial"
            type="date"
            value={params.get("from") || ""}
            max={params.get("to") || undefined}
            onChange={(event) => {
              params.set("from", event.target.value);
              onChange(params.toString());
            }}
          />
          <input
            aria-label="Data final"
            type="date"
            value={params.get("to") || ""}
            min={params.get("from") || undefined}
            onChange={(event) => {
              params.set("to", event.target.value);
              onChange(params.toString());
            }}
          />
        </>
      )}
    </div>
  );
}
