"use client";

import { useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2, ArrowLeft, ArrowUpRight } from "lucide-react";
import {
  api,
  useResource,
  PageHeading,
  LoadingState,
  ErrorState,
  EmptyState,
  Feedback,
  Field,
  SaveButton,
  lines,
} from "./shared";

type Value = string | number | boolean | string[] | undefined;
type Item = Record<string, Value>;
type Descriptor = {
  key: string;
  label: string;
  type?:
    | "textarea"
    | "array"
    | "number"
    | "checkbox"
    | "select"
    | "email"
    | "password"
    | "url";
  required?: boolean;
  wide?: boolean;
  help?: string;
  options?: [string, string][];
};
type Collection = "projects" | "services" | "users";

const configs: Record<
  Collection,
  {
    title: string;
    singular: string;
    description: string;
    nameKey: string;
    defaults: Item;
    fields: Descriptor[];
  }
> = {
  projects: {
    title: "Projetos",
    singular: "projeto",
    description:
      "Conte a história do problema, do processo e da solução construída.",
    nameKey: "title",
    defaults: {
      kind: "concept",
      hideClient: true,
      featured: false,
      published: false,
      order: 0,
    },
    fields: [
      { key: "title", label: "Título do projeto", required: true },
      {
        key: "slug",
        label: "Endereço do projeto (slug)",
        required: true,
        help: "Use letras minúsculas, números e hífens.",
      },
      {
        key: "kind",
        label: "Tipo de projeto",
        type: "select",
        options: [
          ["concept", "Projeto conceitual"],
          ["technical", "Demonstração técnica"],
          ["client", "Projeto de cliente"],
        ],
      },
      {
        key: "category",
        label: "Categoria",
        required: true,
        help: "Ex.: Automação de dados, Software, Integrações.",
      },
      { key: "client", label: "Cliente" },
      {
        key: "hideClient",
        label: "Ocultar nome do cliente no site",
        type: "checkbox",
      },
      {
        key: "description",
        label: "Descrição resumida",
        type: "textarea",
        required: true,
        wide: true,
      },
      { key: "problem", label: "O problema", type: "textarea", wide: true },
      {
        key: "context",
        label: "Cenário inicial",
        type: "textarea",
        wide: true,
      },
      {
        key: "analysis",
        label: "Análise e diagnóstico",
        type: "textarea",
        wide: true,
      },
      {
        key: "solution",
        label: "Solução desenvolvida",
        type: "textarea",
        wide: true,
      },
      {
        key: "development",
        label: "Desenvolvimento e implantação",
        type: "textarea",
        wide: true,
      },
      {
        key: "result",
        label: "Resultado",
        type: "textarea",
        wide: true,
        help: "Registre apenas resultados que possam ser comprovados.",
      },
      {
        key: "technologies",
        label: "Tecnologias",
        type: "array",
        help: "Uma tecnologia por linha.",
      },
      {
        key: "image",
        label: "URL da imagem principal",
        type: "url",
        help: "URL HTTPS ou caminho local da imagem, como /images/projeto.webp.",
      },
      {
        key: "gallery",
        label: "Galeria de imagens",
        type: "array",
        help: "Uma URL HTTPS por linha.",
      },
      { key: "url", label: "Link do projeto", type: "url" },
      { key: "order", label: "Ordem de exibição", type: "number" },
      { key: "featured", label: "Destacar este projeto", type: "checkbox" },
      { key: "published", label: "Publicar no site", type: "checkbox" },
    ],
  },
  services: {
    title: "Serviços",
    singular: "serviço",
    description:
      "Organize as soluções que a VIEIRA SYSTEMS oferece e como elas aparecem no site.",
    nameKey: "name",
    defaults: { order: 0, featured: false, active: true, icon: "Code2" },
    fields: [
      { key: "name", label: "Nome do serviço", required: true },
      {
        key: "slug",
        label: "Endereço do serviço (slug)",
        required: true,
        help: "Use letras minúsculas, números e hífens.",
      },
      {
        key: "summary",
        label: "Resumo",
        type: "textarea",
        wide: true,
        required: true,
      },
      {
        key: "description",
        label: "Descrição completa",
        type: "textarea",
        wide: true,
      },
      {
        key: "icon",
        label: "Ícone",
        type: "select",
        options: [
          ["Code2", "Software"],
          ["Workflow", "Automação"],
          ["Database", "Dados"],
          ["ChartNoAxesCombined", "Indicadores"],
          ["Network", "Integração"],
          ["Sparkles", "Inteligência artificial"],
          ["Smartphone", "Aplicativos"],
          ["Globe", "Sites"],
          ["Compass", "Consultoria"],
          ["Handshake", "Assessoria"],
          ["GitBranch", "Mapeamento"],
          ["Layers", "SaaS"],
        ],
      },
      {
        key: "image",
        label: "URL da imagem",
        type: "url",
        help: "Use uma URL HTTPS ou um caminho local, como /images/servico.webp.",
      },
      { key: "order", label: "Ordem de exibição", type: "number" },
      { key: "featured", label: "Destacar serviço", type: "checkbox" },
      { key: "active", label: "Exibir no site", type: "checkbox" },
      { key: "seoTitle", label: "Título para buscadores" },
      {
        key: "seoDescription",
        label: "Descrição para buscadores",
        type: "textarea",
        wide: true,
      },
    ],
  },
  users: {
    title: "Usuários",
    singular: "usuário",
    description:
      "Gerencie os acessos ao workspace e as responsabilidades de cada pessoa.",
    nameKey: "name",
    defaults: { role: "editor", active: true },
    fields: [
      { key: "name", label: "Nome completo", required: true },
      { key: "email", label: "E-mail", type: "email", required: true },
      {
        key: "password",
        label: "Senha",
        type: "password",
        help: "Mínimo de 12 caracteres. Ao editar, deixe vazio para manter a senha atual.",
      },
      {
        key: "role",
        label: "Permissão",
        type: "select",
        options: [
          ["editor", "Editor — conteúdo, projetos e leads"],
          ["admin", "Administrador — acesso completo"],
        ],
      },
      { key: "active", label: "Acesso ativo", type: "checkbox" },
    ],
  },
};

function Editor({
  collection,
  item,
  onCancel,
  onSaved,
}: {
  collection: Collection;
  item: Item;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const config = configs[collection];
  const [draft, setDraft] = useState<Item>({ ...config.defaults, ...item });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const update = (key: string, value: Value) =>
    setDraft((current) => ({ ...current, [key]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const payload: Item = {};
    for (const field of config.fields) {
      const value = draft[field.key];
      if (field.type === "password" && !value) continue;
      payload[field.key] =
        field.type === "number"
          ? Number(value || 0)
          : field.type === "checkbox"
            ? Boolean(value)
            : field.type === "array"
              ? Array.isArray(value)
                ? value
                : lines(String(value || ""))
              : String(value ?? "");
    }
    if (item.id) payload.id = item.id;
    try {
      await api(`/api/admin/${collection}`, {
        method: item.id ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      onSaved();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }
  return (
    <>
      <button className="adm-back-link" onClick={onCancel}>
        <ArrowLeft size={16} /> Voltar para {config.title.toLowerCase()}
      </button>
      <PageHeading
        title={`${item.id ? "Editar" : "Novo"} ${config.singular}`}
        description={
          collection === "projects"
            ? "Construa um case claro, honesto e relevante para quem tem um desafio parecido."
            : "Revise as informações antes de salvar."
        }
      />
      <form className="adm-panel adm-editor" onSubmit={submit}>
        <div className="adm-form-grid">
          {config.fields.map((field) =>
            field.type === "checkbox" ? (
              <label className="adm-checkbox" key={field.key}>
                <input
                  type="checkbox"
                  checked={Boolean(draft[field.key])}
                  onChange={(event) => update(field.key, event.target.checked)}
                />
                <span>{field.label}</span>
              </label>
            ) : (
              <Field
                key={field.key}
                label={`${field.label}${field.required || (field.key === "password" && !item.id) ? " *" : ""}`}
                help={field.help}
                wide={field.wide}
              >
                {field.type === "textarea" || field.type === "array" ? (
                  <textarea
                    rows={
                      field.type === "array"
                        ? 4
                        : field.key === "description"
                          ? 5
                          : 3
                    }
                    required={field.required}
                    value={
                      Array.isArray(draft[field.key])
                        ? (draft[field.key] as string[]).join("\n")
                        : String(draft[field.key] ?? "")
                    }
                    onChange={(event) => update(field.key, event.target.value)}
                    maxLength={
                      field.key === "description" && collection === "projects"
                        ? 3000
                        : field.key === "summary"
                          ? 600
                          : field.key === "seoDescription"
                            ? 350
                            : 12000
                    }
                  />
                ) : field.type === "select" ? (
                  <select
                    value={String(
                      draft[field.key] ?? field.options?.[0]?.[0] ?? "",
                    )}
                    onChange={(event) => update(field.key, event.target.value)}
                  >
                    {field.options?.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={
                      field.type === "url" && field.key === "image"
                        ? "text"
                        : field.type || "text"
                    }
                    required={
                      field.required || (field.key === "password" && !item.id)
                    }
                    value={String(draft[field.key] ?? "")}
                    autoComplete={
                      field.type === "password" ? "new-password" : undefined
                    }
                    minLength={field.type === "password" ? 12 : undefined}
                    min={field.type === "number" ? 0 : undefined}
                    pattern={
                      field.key === "slug"
                        ? "[a-z0-9]+(?:-[a-z0-9]+)*"
                        : field.type === "url" && field.key !== "image"
                          ? "https://.*"
                          : undefined
                    }
                    onChange={(event) => update(field.key, event.target.value)}
                  />
                )}
              </Field>
            ),
          )}
        </div>
        <Feedback error={error} />
        <div className="adm-form-actions">
          <p>* Campos obrigatórios</p>
          <div>
            <button
              className="adm-button"
              type="button"
              onClick={onCancel}
              disabled={busy}
            >
              Cancelar
            </button>
            <SaveButton busy={busy}>
              {item.id ? "Salvar alterações" : `Criar ${config.singular}`}
            </SaveButton>
          </div>
        </div>
      </form>
    </>
  );
}

export function CollectionManager({ collection }: { collection: Collection }) {
  const config = configs[collection];
  const { data, error, loading, reload } = useResource<{
    items: Item[];
    total: number;
  }>(`/api/admin/${collection}`);
  const [editing, setEditing] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");
  async function remove(id: string) {
    setBusy(true);
    setActionError("");
    try {
      await api(`/api/admin/${collection}`, {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      setDeleting(null);
      setSuccess(
        `${config.singular[0].toUpperCase()}${config.singular.slice(1)} excluído.`,
      );
      reload();
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (editing)
    return (
      <Editor
        key={String(editing.id || "new")}
        collection={collection}
        item={editing}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          setSuccess("Alterações salvas com sucesso.");
          reload();
        }}
      />
    );
  return (
    <>
      <PageHeading title={config.title} description={config.description}>
        <button
          className="adm-button adm-button-primary"
          onClick={() => {
            setSuccess("");
            setEditing({});
          }}
        >
          <Plus size={18} /> Novo {config.singular}
        </button>
      </PageHeading>
      <Feedback error={actionError} success={success} />
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : (
        <section className="adm-panel">
          {data?.items.length ? (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>
                      {collection === "users"
                        ? "Pessoa"
                        : config.singular === "projeto"
                          ? "Projeto"
                          : "Serviço"}
                    </th>
                    <th>
                      {collection === "users"
                        ? "Permissão"
                        : collection === "projects"
                          ? "Categoria"
                          : "Endereço"}
                    </th>
                    <th>Status</th>
                    {collection !== "users" && <th>Ordem</th>}
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={String(item.id)}>
                      <td>
                        <button
                          className="adm-table-primary"
                          onClick={() => setEditing(item)}
                        >
                          {String(item[config.nameKey])}
                        </button>
                        <small>
                          {String(
                            collection === "users"
                              ? item.email
                              : item.slug || "",
                          )}
                        </small>
                      </td>
                      <td>
                        {collection === "users"
                          ? item.role === "admin"
                            ? "Administrador"
                            : "Editor"
                          : String(
                              collection === "projects"
                                ? item.category || "—"
                                : `/servicos/${item.slug}`,
                            )}
                      </td>
                      <td>
                        <span
                          className={`adm-status ${item.published || item.active ? "adm-status-closed" : "adm-status-archived"}`}
                        >
                          <i />
                          {collection === "projects"
                            ? item.published
                              ? "Publicado"
                              : "Rascunho"
                            : item.active
                              ? "Ativo"
                              : "Inativo"}
                        </span>
                        {item.featured && <small>Destaque</small>}
                      </td>
                      {collection !== "users" && (
                        <td>{String(item.order ?? 0)}</td>
                      )}
                      <td>
                        {deleting === item.id ? (
                          <div className="adm-delete-inline">
                            <p>Excluir permanentemente?</p>
                            <button
                              className="adm-button adm-button-danger"
                              disabled={busy}
                              onClick={() => void remove(String(item.id))}
                            >
                              Excluir
                            </button>
                            <button
                              className="adm-button"
                              onClick={() => setDeleting(null)}
                              disabled={busy}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="adm-inline-actions">
                            <button
                              className="adm-icon-button"
                              aria-label={`Editar ${String(item[config.nameKey])}`}
                              onClick={() => setEditing(item)}
                            >
                              <Pencil size={17} />
                            </button>
                            {collection !== "users" &&
                              (item.published || item.active) && (
                                <a
                                  href={`/${collection === "projects" ? "projetos" : "servicos"}/${item.slug}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="adm-icon-button"
                                  aria-label={`Abrir ${String(item[config.nameKey])} no site`}
                                >
                                  <ArrowUpRight size={17} />
                                </a>
                              )}
                            <button
                              className="adm-icon-button adm-danger-text"
                              aria-label={`Excluir ${String(item[config.nameKey])}`}
                              onClick={() => setDeleting(String(item.id))}
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title={`Seu primeiro ${config.singular} começa aqui`}
              description={
                collection === "projects"
                  ? "Cadastre trabalhos reais ou identifique claramente projetos conceituais e demonstrações técnicas."
                  : `Clique em “Novo ${config.singular}” para começar a organizar este espaço.`
              }
            >
              <button className="adm-button" onClick={() => setEditing({})}>
                <Plus size={17} /> Novo {config.singular}
              </button>
            </EmptyState>
          )}
        </section>
      )}
    </>
  );
}
