"use client";

import { useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import {
  servicePages,
  defaultAbout,
  defaultContact,
  defaultFooter,
} from "@/lib/site-content";
import {
  api,
  useResource,
  PageHeading,
  LoadingState,
  ErrorState,
  Feedback,
  Field,
  SaveButton,
  lines,
} from "./shared";

type ContentValue = string | string[] | Record<string, string>[];
type ContentRecord = Record<string, ContentValue>;
type ContentField = {
  key: string;
  label: string;
  multiline?: boolean;
  list?: boolean;
  help?: string;
};
type Section = {
  key: string;
  label: string;
  href: string;
  fields: ContentField[];
  defaults?: ContentRecord;
  items?: { key: string; label: string; fields: ContentField[] };
};
const title: ContentField = { key: "title", label: "Título" };
const description: ContentField = {
  key: "description",
  label: "Descrição",
  multiline: true,
};
const sections: Section[] = [
  {
    key: "hero",
    label: "Abertura da home",
    href: "/",
    fields: [
      { key: "eyebrow", label: "Texto acima do título" },
      title,
      description,
      { key: "primaryCta", label: "Botão principal" },
      { key: "secondaryCta", label: "Botão secundário" },
    ],
  },
  {
    key: "about",
    label: "Sobre a empresa",
    href: "/sobre",
    fields: [
      title,
      description,
      {
        key: "body",
        label: "Texto completo",
        multiline: true,
        help: "Separe os parágrafos com uma linha em branco.",
      },
    ],
    defaults: defaultAbout,
  },
  {
    key: "solutions",
    label: "Soluções da home",
    href: "/#solucoes",
    fields: [title, description],
    items: {
      key: "items",
      label: "Soluções",
      fields: [
        title,
        description,
        {
          key: "need",
          label: "Necessidade no orçamento",
          help: "Ex.: Sistema, Automação de dados, SaaS, Dashboard ou Consultoria.",
        },
      ],
    },
  },
  {
    key: "differentials",
    label: "Diferenciais",
    href: "/#diferenciais",
    fields: [title, description],
    items: {
      key: "items",
      label: "Diferenciais",
      fields: [title, description],
    },
  },
  {
    key: "faq",
    label: "Perguntas frequentes",
    href: "/#faq",
    fields: [title],
    items: {
      key: "items",
      label: "Perguntas",
      fields: [
        { key: "question", label: "Pergunta" },
        { key: "answer", label: "Resposta", multiline: true },
      ],
    },
  },
  {
    key: "contact",
    label: "Contato",
    href: "/contato",
    fields: [title, description],
    defaults: defaultContact,
  },
  {
    key: "footer",
    label: "Rodapé",
    href: "/",
    fields: [description, { key: "ctaLabel", label: "Texto do botão" }],
    defaults: defaultFooter,
  },
  ...Object.entries(servicePages).map(([slug, defaults]) => ({
    key: `page:${slug}`,
    label: (
      {
        servicos: "Serviços",
        solucoes: "Soluções",
        automacao: "Automação",
        dados: "Dados e BI",
        "inteligencia-artificial": "Inteligência artificial",
        consultoria: "Consultoria",
        assessoria: "Assessoria",
      } as Record<string, string>
    )[slug],
    href: `/${slug}`,
    defaults: {
      ...defaults,
      points: [...defaults.points],
      seoTitle: "",
      seoDescription: "",
    },
    fields: [
      { key: "eyebrow", label: "Texto acima do título" },
      title,
      description,
      { key: "intro", label: "Introdução", multiline: true },
      {
        key: "points",
        label: "O que esta solução oferece",
        multiline: true,
        list: true,
        help: "Um item por linha.",
      },
      { key: "outcome", label: "Resultado esperado", multiline: true },
      {
        key: "seoTitle",
        label: "Título para buscadores",
        help: "Opcional. Quando vazio, o título da página é utilizado.",
      },
      {
        key: "seoDescription",
        label: "Descrição para buscadores",
        multiline: true,
      },
    ],
  })),
];

function ContentEditor({
  section,
  saved,
  onSaved,
  onDirty,
}: {
  section: Section;
  saved?: ContentRecord;
  onSaved: (value: ContentRecord) => void;
  onDirty: (value: boolean) => void;
}) {
  const [draft, setDraft] = useState<ContentRecord>({
    ...section.defaults,
    ...saved,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dirty, setDirty] = useState(false);
  function update(key: string, value: ContentValue) {
    setDraft((current) => ({ ...current, [key]: value }));
    setDirty(true);
    onDirty(true);
    setSuccess("");
  }
  const itemValues =
    section.items && Array.isArray(draft[section.items.key])
      ? (draft[section.items.key] as Record<string, string>[])
      : [];
  function updateItem(index: number, key: string, value: string) {
    if (section.items)
      update(
        section.items.key,
        itemValues.map((item, current) =>
          current === index ? { ...item, [key]: value } : item,
        ),
      );
  }
  function moveItem(index: number, direction: number) {
    if (!section.items) return;
    const next = [...itemValues];
    [next[index], next[index + direction]] = [
      next[index + direction],
      next[index],
    ];
    update(section.items.key, next);
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    const value = { ...draft };
    for (const field of section.fields)
      if (field.list && typeof value[field.key] === "string")
        value[field.key] = lines(value[field.key] as string);
    try {
      await api("/api/admin/content", {
        method: "PUT",
        body: JSON.stringify({ key: section.key, value }),
      });
      setSuccess("Conteúdo salvo e disponível no site.");
      setDirty(false);
      onDirty(false);
      onSaved(value);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="adm-panel adm-editor" onSubmit={submit}>
      <div className="adm-editor-heading">
        <div>
          <span className="adm-eyebrow">
            {section.key.startsWith("page:")
              ? "Página institucional"
              : "Conteúdo do site"}
          </span>
          <h2>{section.label}</h2>
        </div>
        <a
          href={section.href}
          target="_blank"
          rel="noreferrer"
          className="adm-text-link"
        >
          Ver no site <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="adm-form-grid">
        {section.fields.map((field) => (
          <Field label={field.label} key={field.key} wide help={field.help}>
            {field.multiline ? (
              <textarea
                rows={field.list ? 7 : field.key === "body" ? 7 : 3}
                maxLength={16000}
                value={
                  Array.isArray(draft[field.key])
                    ? (draft[field.key] as string[]).join("\n")
                    : String(draft[field.key] ?? "")
                }
                onChange={(event) => update(field.key, event.target.value)}
              />
            ) : (
              <input
                value={String(draft[field.key] ?? "")}
                maxLength={
                  field.key.toLowerCase().includes("title") ? 250 : 500
                }
                onChange={(event) => update(field.key, event.target.value)}
              />
            )}
          </Field>
        ))}
      </div>
      {section.items && (
        <div className="adm-repeat-section">
          <div className="adm-panel-heading">
            <h3>{section.items.label}</h3>
            <span>{itemValues.length} itens</span>
          </div>
          {itemValues.map((item, index) => (
            <div className="adm-repeat-item" key={index}>
              <div className="adm-repeat-heading">
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                <div className="adm-inline-actions">
                  <button
                    type="button"
                    className="adm-icon-button"
                    aria-label={`Mover item ${index + 1} para cima`}
                    disabled={busy || index === 0}
                    onClick={() => moveItem(index, -1)}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    className="adm-icon-button"
                    aria-label={`Mover item ${index + 1} para baixo`}
                    disabled={busy || index === itemValues.length - 1}
                    onClick={() => moveItem(index, 1)}
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    className="adm-icon-button adm-danger-text"
                    disabled={busy}
                    aria-label={`Remover item ${index + 1}`}
                    onClick={() =>
                      update(
                        section.items!.key,
                        itemValues.filter((_, current) => current !== index),
                      )
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {section.items!.fields.map((field) => (
                <Field key={field.key} label={field.label}>
                  {field.multiline ? (
                    <textarea
                      rows={3}
                      maxLength={16000}
                      value={item[field.key] || ""}
                      onChange={(event) =>
                        updateItem(index, field.key, event.target.value)
                      }
                    />
                  ) : (
                    <input
                      maxLength={250}
                      value={item[field.key] || ""}
                      onChange={(event) =>
                        updateItem(index, field.key, event.target.value)
                      }
                    />
                  )}
                </Field>
              ))}
            </div>
          ))}
          <button
            className="adm-button"
            type="button"
            disabled={busy || itemValues.length >= 30}
            onClick={() =>
              update(section.items!.key, [
                ...itemValues,
                Object.fromEntries(
                  section.items!.fields.map((field) => [field.key, ""]),
                ),
              ])
            }
          >
            <Plus size={17} /> Adicionar item
          </button>
        </div>
      )}
      <Feedback error={error} success={success} />
      <div className="adm-form-actions">
        <p>
          {dirty
            ? "Você tem alterações para salvar."
            : "As alterações são publicadas ao salvar."}
        </p>
        <SaveButton busy={busy} />
      </div>
    </form>
  );
}

export function ContentManager() {
  const { data, error, loading, reload } = useResource<{
    sections: Record<string, ContentRecord>;
  }>("/api/admin/content");
  const [active, setActive] = useState("hero");
  const [saved, setSaved] = useState<Record<string, ContentRecord>>({});
  const [dirty, setDirty] = useState(false);
  function select(key: string) {
    if (key === active) return;
    if (
      dirty &&
      !window.confirm(
        "Há alterações não salvas. Deseja descartá-las e abrir outra seção?",
      )
    )
      return;
    setDirty(false);
    setActive(key);
  }
  const section = sections.find((item) => item.key === active)!;
  return (
    <>
      <PageHeading
        title="Conteúdo"
        description="Mantenha a voz da VIEIRA SYSTEMS em cada parte do site."
      />
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : (
        data && (
          <div className="adm-content-layout">
            <aside className="adm-content-nav">
              <p className="adm-nav-label">SEÇÕES E PÁGINAS</p>
              {sections.map((item) => (
                <button
                  key={item.key}
                  className={active === item.key ? "is-active" : ""}
                  onClick={() => select(item.key)}
                  aria-pressed={active === item.key}
                >
                  <FileText size={16} />
                  <span>{item.label}</span>
                </button>
              ))}
            </aside>
            <ContentEditor
              key={section.key}
              section={section}
              saved={saved[section.key] ?? data.sections[section.key]}
              onDirty={setDirty}
              onSaved={(value) =>
                setSaved((current) => ({ ...current, [section.key]: value }))
              }
            />
          </div>
        )
      )}
    </>
  );
}
