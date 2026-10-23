"use client";

import { useState, type FormEvent } from "react";
import { Building2, Globe, BarChart3, Wallet, Search } from "lucide-react";
import type { PublicSettings } from "@/lib/validators";
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

function SettingsEditor({ initial }: { initial: PublicSettings }) {
  const [draft, setDraft] = useState(initial);
  const [budgetRanges, setBudgetRanges] = useState(
    initial.budgetRanges.join("\n"),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  function update<K extends keyof PublicSettings>(
    key: K,
    value: PublicSettings[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSuccess("");
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify({ ...draft, budgetRanges: lines(budgetRanges) }),
      });
      setSuccess(
        "Configurações salvas. Os novos dados já podem ser usados pelo site.",
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="adm-settings-form">
      <section className="adm-panel adm-panel-body">
        <div className="adm-settings-heading">
          <Building2 size={22} />
          <div>
            <h2>Identidade e contato</h2>
            <p>Esses dados aparecem nas áreas de contato do site.</p>
          </div>
        </div>
        <div className="adm-form-grid">
          <Field label="Nome da empresa">
            <input value="VIEIRA SYSTEMS" readOnly />
          </Field>
          <Field label="Slogan">
            <input
              maxLength={300}
              value={draft.slogan}
              onChange={(event) => update("slogan", event.target.value)}
            />
          </Field>
          <Field
            label="Endereço do site"
            help="URL HTTPS completa do domínio publicado."
          >
            <input
              type="url"
              placeholder="https://seudominio.com.br"
              pattern="https://.*"
              value={draft.siteUrl}
              onChange={(event) => update("siteUrl", event.target.value)}
            />
          </Field>
          <Field label="E-mail de contato">
            <input
              type="email"
              maxLength={254}
              value={draft.email}
              onChange={(event) => update("email", event.target.value)}
            />
          </Field>
          <Field
            label="WhatsApp"
            help="DDI + DDD + número. Exemplo de formato: 5511999999999."
          >
            <input
              type="tel"
              maxLength={20}
              inputMode="tel"
              pattern="\+?[0-9]{10,15}"
              value={draft.whatsapp}
              onChange={(event) =>
                update("whatsapp", event.target.value.replace(/[^\d+]/g, ""))
              }
            />
          </Field>
        </div>
      </section>
      <section className="adm-panel adm-panel-body">
        <div className="adm-settings-heading">
          <Globe size={22} />
          <div>
            <h2>Redes sociais</h2>
            <p>Preencha apenas os canais que a empresa realmente utiliza.</p>
          </div>
        </div>
        <div className="adm-form-grid">
          {(
            [
              ["instagram", "Instagram"],
              ["linkedin", "LinkedIn"],
              ["github", "GitHub"],
            ] as const
          ).map(([key, label]) => (
            <Field label={label} key={key}>
              <input
                type="url"
                pattern="https://.*"
                placeholder="https://"
                value={draft[key]}
                onChange={(event) => update(key, event.target.value)}
              />
            </Field>
          ))}
        </div>
      </section>
      <section className="adm-panel adm-panel-body">
        <div className="adm-settings-heading">
          <Search size={22} />
          <div>
            <h2>Presença em buscadores</h2>
            <p>
              Defina o título e a descrição padrão usados quando uma página não
              tem uma configuração própria.
            </p>
          </div>
        </div>
        <div className="adm-form-grid">
          <Field
            label="Título padrão"
            wide
            help={`${draft.seoTitle.length} caracteres`}
          >
            <input
              maxLength={200}
              value={draft.seoTitle}
              onChange={(event) => update("seoTitle", event.target.value)}
            />
          </Field>
          <Field
            label="Descrição padrão"
            wide
            help={`${draft.seoDescription.length} caracteres`}
          >
            <textarea
              rows={3}
              maxLength={350}
              value={draft.seoDescription}
              onChange={(event) => update("seoDescription", event.target.value)}
            />
          </Field>
        </div>
      </section>
      <section className="adm-panel adm-panel-body">
        <div className="adm-settings-heading">
          <BarChart3 size={22} />
          <div>
            <h2>Mensuração e campanhas</h2>
            <p>
              As ferramentas de análise só são ativadas após o consentimento do
              visitante.
            </p>
          </div>
        </div>
        <div className="adm-form-grid">
          <Field
            label="Google Analytics"
            help="Identificador no formato G-XXXXXXXXXX."
          >
            <input
              pattern="G-[A-Z0-9]+"
              placeholder="G-XXXXXXXXXX"
              value={draft.googleAnalyticsId}
              onChange={(event) =>
                update(
                  "googleAnalyticsId",
                  event.target.value.trim().toUpperCase(),
                )
              }
            />
          </Field>
          <Field
            label="Google Tag Manager"
            help="Identificador no formato GTM-XXXXXXX."
          >
            <input
              pattern="GTM-[A-Z0-9]+"
              placeholder="GTM-XXXXXXX"
              value={draft.googleTagManagerId}
              onChange={(event) =>
                update(
                  "googleTagManagerId",
                  event.target.value.trim().toUpperCase(),
                )
              }
            />
          </Field>
          <Field
            label="Meta Pixel"
            help="Somente o identificador numérico do pixel."
          >
            <input
              inputMode="numeric"
              pattern="[0-9]+"
              maxLength={30}
              value={draft.metaPixelId}
              onChange={(event) =>
                update("metaPixelId", event.target.value.replace(/\D/g, ""))
              }
            />
          </Field>
        </div>
      </section>
      <section className="adm-panel adm-panel-body">
        <div className="adm-settings-heading">
          <Wallet size={22} />
          <div>
            <h2>Investimento no formulário</h2>
            <p>
              Você decide se o formulário deve perguntar uma faixa de
              investimento.
            </p>
          </div>
        </div>
        <label className="adm-checkbox">
          <input
            type="checkbox"
            checked={draft.budgetEnabled}
            onChange={(event) => update("budgetEnabled", event.target.checked)}
          />
          <span>Exibir pergunta opcional sobre investimento</span>
        </label>
        {draft.budgetEnabled && (
          <Field
            label="Faixas disponíveis"
            help="Uma opção por linha, até 12 opções. Use faixas adequadas à oferta da empresa."
          >
            <textarea
              rows={5}
              value={budgetRanges}
              onChange={(event) => {
                setBudgetRanges(event.target.value);
                setSuccess("");
              }}
              maxLength={1200}
              required
            />
          </Field>
        )}
      </section>
      <div className="adm-settings-save">
        <Feedback error={error} success={success} />
        <SaveButton busy={busy} />
      </div>
    </form>
  );
}
export function SettingsManager() {
  const { data, error, loading, reload } = useResource<{
    settings: PublicSettings;
  }>("/api/admin/settings");
  return (
    <>
      <PageHeading
        title="Configurações"
        description="Informações da empresa, canais de contato e preferências do site."
      />
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : (
        data && <SettingsEditor initial={data.settings} />
      )}
    </>
  );
}
