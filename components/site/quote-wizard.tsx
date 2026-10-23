"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { getAttribution } from "@/lib/attribution";

const needs = [
  "Sistema",
  "Automação de processos",
  "Automação de dados",
  "Site",
  "Aplicativo",
  "SaaS",
  "Dashboard",
  "Business Intelligence",
  "Integração",
  "Inteligência artificial",
  "Consultoria",
  "Assessoria",
  "Mapeamento",
  "Ainda não sei",
  "Outro",
];
const features = [
  "Login",
  "Usuários",
  "Dashboard",
  "Clientes",
  "Banco de dados",
  "Financeiro",
  "Estoque",
  "Agenda",
  "Relatórios",
  "PDF",
  "WhatsApp",
  "E-mail",
  "IA",
  "Upload",
  "Automação",
  "Integração",
  "Pagamentos",
  "API",
  "Notificações",
  "Processamento de dados",
  "Outro",
];
const priorities = [
  "Pesquisando",
  "Quero começar em breve",
  "Prioritário",
  "Urgente",
];
const stepNames = [
  "Seus dados",
  "Necessidade",
  "O problema",
  "Processo atual",
  "Seu cenário",
  "Funcionalidades",
  "Prioridade",
];
const emptyForm = {
  name: "",
  company: "",
  phone: "",
  email: "",
  need: "",
  otherNeed: "",
  problem: "",
  currentProcess: "",
  manualWork: "",
  usesSpreadsheets: "",
  hasSystem: "",
  features: [] as string[],
  priority: "",
  investment: "",
  consent: false,
  website: "",
};
type QuoteForm = typeof emptyForm;
type Errors = Partial<Record<keyof QuoteForm, string>>;
type Props = {
  initialNeed?: string;
  investmentEnabled?: boolean;
  investmentRanges?: string[];
  hasWhatsapp?: boolean;
};

function normalizeNeed(value: string) {
  const aliases: Record<string, string> = {
    "desenvolvimento de software": "Sistema",
    "software sob medida": "Sistema",
    "dados e bi": "Business Intelligence",
    "integração de sistemas": "Integração",
    "aplicativo ou pwa": "Aplicativo",
    "consultoria tecnológica": "Consultoria",
    "assessoria tecnológica": "Assessoria",
    "automação de dados · bi": "Automação de dados",
    "inteligência artificial aplicada": "Inteligência artificial",
  };
  return (
    needs.find(
      (item) =>
        item.toLocaleLowerCase("pt-BR") === value.toLocaleLowerCase("pt-BR"),
    ) ??
    aliases[value.toLocaleLowerCase("pt-BR")] ??
    ""
  );
}

function FieldError({ name, error }: { name: string; error?: string }) {
  return error ? (
    <span className="field-error" id={`${name}-error`}>
      {error}
    </span>
  ) : null;
}

export function QuoteWizard({
  initialNeed = "",
  investmentEnabled = false,
  investmentRanges = [],
  hasWhatsapp = false,
}: Props) {
  const [form, setForm] = useState<QuoteForm>(() => ({
    ...emptyForm,
    need: normalizeNeed(initialNeed),
  }));
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const idempotencyKey = useRef<string | null>(null);
  const inFlight = useRef(false);
  const interacted = useRef(false);

  useEffect(() => {
    if (interacted.current) heading.current?.focus({ preventScroll: true });
  }, [step]);
  function update<K extends keyof QuoteForm>(key: K, value: QuoteForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    idempotencyKey.current = null;
  }
  function validate() {
    const errors: Errors = {};
    if (step === 0) {
      if (form.name.trim().length < 2)
        errors.name = "Informe seu nome completo.";
      if (!/^\+?\d{10,15}$/.test(form.phone.replace(/[^\d+]/g, "")))
        errors.phone = "Informe um telefone com DDD (10 a 15 dígitos).";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
        errors.email = "Informe um e-mail válido.";
    }
    if (step === 1 && !form.need)
      errors.need = "Escolha a necessidade mais próxima.";
    if (step === 1 && form.need === "Outro" && form.otherNeed.trim().length < 2)
      errors.otherNeed = "Descreva a necessidade.";
    if (step === 2 && form.problem.trim().length < 12)
      errors.problem = "Descreva o problema com pelo menos 12 caracteres.";
    if (step === 3 && form.currentProcess.trim().length < 10)
      errors.currentProcess =
        "Descreva o processo com pelo menos 10 caracteres.";
    if (step === 4) {
      if (!form.manualWork) errors.manualWork = "Selecione uma opção.";
      if (!form.usesSpreadsheets)
        errors.usesSpreadsheets = "Selecione uma opção.";
      if (!form.hasSystem) errors.hasSystem = "Selecione uma opção.";
    }
    if (step === 6) {
      if (!form.priority) errors.priority = "Selecione a prioridade.";
      if (!form.consent)
        errors.consent =
          "Autorize o uso dos dados para receber retorno sobre este pedido.";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setError("Revise os campos indicados antes de continuar.");
      document.getElementById(Object.keys(errors)[0])?.focus();
      return false;
    }
    setError("");
    return true;
  }
  async function send() {
    if (inFlight.current || !validate()) return;
    inFlight.current = true;
    setBusy(true);
    idempotencyKey.current ??= crypto.randomUUID();
    const chatWindow = hasWhatsapp
      ? window.open("about:blank", "_blank")
      : null;
    if (chatWindow) chatWindow.opener = null;
    try {
      const attribution = getAttribution();
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey.current,
        },
        body: JSON.stringify({
          ...form,
          investment: investmentEnabled ? form.investment : "",
          ...attribution,
          idempotencyKey: idempotencyKey.current,
        }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(
          response.status === 503
            ? "O envio está temporariamente indisponível. Tente novamente em instantes."
            : typeof payload.error === "string"
              ? payload.error
              : "Não foi possível registrar o pedido. Revise as informações e tente novamente.",
        );
      const url =
        typeof payload.whatsappUrl === "string" &&
        /^https:\/\/wa\.me\//.test(payload.whatsappUrl)
          ? payload.whatsappUrl
          : "";
      setWhatsapp(url);
      setDone(true);
      if (url && chatWindow) chatWindow.location.replace(url);
      else chatWindow?.close();
    } catch (cause) {
      chatWindow?.close();
      setError(
        cause instanceof Error
          ? cause.message
          : "A conexão falhou. Tente enviar novamente.",
      );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    interacted.current = true;
    if (step === 6) {
      void send();
      return;
    }
    if (validate()) setStep((current) => current + 1);
  }
  function choice(
    key: "need" | "manualWork" | "usesSpreadsheets" | "hasSystem" | "priority",
    values: string[],
  ) {
    return (
      <div
        className="choice-grid"
        id={key}
        tabIndex={-1}
        aria-describedby={fieldErrors[key] ? `${key}-error` : undefined}
      >
        {values.map((item) => (
          <button
            key={item}
            type="button"
            className={`choice-chip${form[key] === item ? " choice-chip-active" : ""}`}
            aria-pressed={form[key] === item}
            onClick={() => update(key, item)}
          >
            {form[key] === item && <Check size={15} aria-hidden />}
            {item}
          </button>
        ))}
      </div>
    );
  }

  if (done)
    return (
      <div className="wizard-shell wizard-success" role="status">
        <span className="wizard-success-icon">
          <Check size={29} />
        </span>
        <span className="eyebrow">PEDIDO REGISTRADO</span>
        <h2>Obrigado por compartilhar seu cenário.</h2>
        <p>
          Seu pedido foi salvo. A VIEIRA SYSTEMS poderá analisar o processo e
          entrar em contato pelos canais que você informou.
        </p>
        {whatsapp && (
          <a
            className="button button-primary"
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            Continuar no WhatsApp <ArrowRight size={16} />
          </a>
        )}
        <Link href="/" className="text-link">
          Voltar ao início
        </Link>
      </div>
    );

  return (
    <form
      className="wizard-shell"
      onSubmit={submit}
      noValidate
      aria-label="Solicitação de projeto"
    >
      <div className="wizard-heading">
        <div>
          <span className="eyebrow">VAMOS COMEÇAR PELO SEU CENÁRIO</span>
          <h2>Conte seu projeto.</h2>
          <p>Descreva o problema. Não é preciso conhecer a solução técnica.</p>
        </div>
        <span className="wizard-step-count">
          {String(step + 1).padStart(2, "0")} <i>/</i> 07
        </span>
      </div>
      <div
        className="wizard-progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={7}
        aria-valuenow={step + 1}
        aria-label={`Etapa ${step + 1}: ${stepNames[step]}`}
      >
        <div style={{ transform: `scaleX(${(step + 1) / 7})` }} />
      </div>
      <div className="wizard-step-labels" aria-hidden="true">
        {stepNames.map((name, index) => (
          <span
            key={name}
            className={
              index === step
                ? "wizard-label-active"
                : index < step
                  ? "wizard-label-done"
                  : ""
            }
          >
            {name}
          </span>
        ))}
      </div>
      <div className="honeypot" aria-hidden>
        <label>
          Website
          <input
            name="website"
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>
      <div className="wizard-content" key={step}>
        {step === 0 && (
          <>
            <h3 ref={heading} tabIndex={-1}>
              Quem é você?
            </h3>
            <p>Como podemos entrar em contato para conversar?</p>
            <div className="form-grid">
              {(
                [
                  {
                    key: "name",
                    label: "Nome",
                    autoComplete: "name",
                    placeholder: "Seu nome",
                    type: "text",
                    max: 120,
                    required: true,
                  },
                  {
                    key: "company",
                    label: "Empresa",
                    autoComplete: "organization",
                    placeholder: "Nome da empresa",
                    type: "text",
                    max: 200,
                    required: false,
                  },
                  {
                    key: "phone",
                    label: "WhatsApp",
                    autoComplete: "tel",
                    placeholder: "DDD + telefone",
                    type: "tel",
                    max: 24,
                    required: true,
                  },
                  {
                    key: "email",
                    label: "E-mail",
                    autoComplete: "email",
                    placeholder: "voce@empresa.com",
                    type: "email",
                    max: 254,
                    required: true,
                  },
                ] as const
              ).map((field) => (
                <label key={field.key} className="field" htmlFor={field.key}>
                  <span>
                    {field.label}
                    {field.required && <i> *</i>}
                  </span>
                  <input
                    id={field.key}
                    name={field.key}
                    type={field.type}
                    value={form[field.key]}
                    onChange={(e) => update(field.key, e.target.value)}
                    autoComplete={field.autoComplete}
                    placeholder={field.placeholder}
                    maxLength={field.max}
                    required={field.required}
                    aria-invalid={!!fieldErrors[field.key]}
                    aria-describedby={
                      fieldErrors[field.key] ? `${field.key}-error` : undefined
                    }
                  />
                  <FieldError name={field.key} error={fieldErrors[field.key]} />
                </label>
              ))}
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <h3 ref={heading} tabIndex={-1}>
              O que você precisa?
            </h3>
            <p>Selecione a opção mais próxima. Você pode detalhar depois.</p>
            {choice("need", needs)}
            <FieldError name="need" error={fieldErrors.need} />
            {form.need === "Outro" && (
              <label className="field field-spaced" htmlFor="otherNeed">
                <span>Qual necessidade?</span>
                <input
                  id="otherNeed"
                  value={form.otherNeed}
                  maxLength={110}
                  onChange={(e) => update("otherNeed", e.target.value)}
                  aria-invalid={!!fieldErrors.otherNeed}
                />
                <FieldError name="otherNeed" error={fieldErrors.otherNeed} />
              </label>
            )}
          </>
        )}
        {step === 2 && (
          <>
            <h3 ref={heading} tabIndex={-1}>
              Qual problema precisa resolver?
            </h3>
            <p>Conte o que está difícil, lento ou repetitivo hoje.</p>
            <label className="field" htmlFor="problem">
              <span>O problema *</span>
              <textarea
                id="problem"
                rows={6}
                maxLength={1600}
                value={form.problem}
                onChange={(e) => update("problem", e.target.value)}
                placeholder="Por exemplo: conferimos dados em três planilhas antes de enviar o relatório…"
                aria-invalid={!!fieldErrors.problem}
                aria-describedby="problem-error"
                required
              />
              <small>{form.problem.length}/1600 caracteres</small>
              <FieldError name="problem" error={fieldErrors.problem} />
            </label>
          </>
        )}
        {step === 3 && (
          <>
            <h3 ref={heading} tabIndex={-1}>
              Como funciona atualmente?
            </h3>
            <p>Descreva etapas, ferramentas e pessoas envolvidas.</p>
            <label className="field" htmlFor="currentProcess">
              <span>Processo atual *</span>
              <textarea
                id="currentProcess"
                rows={6}
                maxLength={1600}
                value={form.currentProcess}
                onChange={(e) => update("currentProcess", e.target.value)}
                placeholder="O processo começa quando… depois… no final…"
                aria-invalid={!!fieldErrors.currentProcess}
                aria-describedby="currentProcess-error"
                required
              />
              <small>{form.currentProcess.length}/1600 caracteres</small>
              <FieldError
                name="currentProcess"
                error={fieldErrors.currentProcess}
              />
            </label>
          </>
        )}
        {step === 4 && (
          <>
            <h3 ref={heading} tabIndex={-1}>
              Sobre o seu cenário
            </h3>
            <p>O que já faz parte da rotina da empresa?</p>
            <div className="scenario-questions">
              {(
                [
                  {
                    key: "manualWork",
                    question: "Existe trabalho manual?",
                    options: ["Sim", "Não", "Parcialmente", "Não sei"],
                  },
                  {
                    key: "usesSpreadsheets",
                    question: "A equipe usa planilhas?",
                    options: ["Sim", "Não"],
                  },
                  {
                    key: "hasSystem",
                    question: "Já existe algum sistema?",
                    options: ["Sim", "Não"],
                  },
                ] as const
              ).map((item) => (
                <fieldset key={item.key} className="scenario-question">
                  <legend>{item.question}</legend>
                  {choice(item.key, [...item.options])}
                  <FieldError name={item.key} error={fieldErrors[item.key]} />
                </fieldset>
              ))}
            </div>
          </>
        )}
        {step === 5 && (
          <>
            <h3 ref={heading} tabIndex={-1}>
              O que a solução pode precisar?
            </h3>
            <p>
              Marque o que parece relevante ou continue para definir isso
              depois.
            </p>
            <div className="choice-grid feature-choice-grid">
              {features.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`choice-chip${form.features.includes(item) ? " choice-chip-active" : ""}`}
                  aria-pressed={form.features.includes(item)}
                  onClick={() =>
                    update(
                      "features",
                      form.features.includes(item)
                        ? form.features.filter((feature) => feature !== item)
                        : [...form.features, item],
                    )
                  }
                >
                  {form.features.includes(item) && <Check size={14} />}
                  {item}
                </button>
              ))}
            </div>
          </>
        )}
        {step === 6 && (
          <>
            <h3 ref={heading} tabIndex={-1}>
              Qual é a prioridade?
            </h3>
            <p>Conte em que momento está o projeto.</p>
            {choice("priority", priorities)}
            <FieldError name="priority" error={fieldErrors.priority} />
            {investmentEnabled && (
              <label className="field field-spaced" htmlFor="investment">
                <span>
                  Preferência de investimento <em>opcional</em>
                </span>
                {investmentRanges.length ? (
                  <select
                    id="investment"
                    value={form.investment}
                    onChange={(e) => update("investment", e.target.value)}
                  >
                    <option value="">Prefiro conversar primeiro</option>
                    {investmentRanges.map((range) => (
                      <option key={range}>{range}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="investment"
                    maxLength={200}
                    value={form.investment}
                    onChange={(e) => update("investment", e.target.value)}
                    placeholder="Se já tiver uma faixa em mente"
                  />
                )}
              </label>
            )}
            <details className="quote-review">
              <summary>Revisar informações do pedido</summary>
              <dl>
                <dt>Contato</dt>
                <dd>
                  {form.name} · {form.email} · {form.phone}
                </dd>
                <dt>Necessidade</dt>
                <dd>{form.need === "Outro" ? form.otherNeed : form.need}</dd>
                <dt>Problema</dt>
                <dd>{form.problem}</dd>
                <dt>Processo atual</dt>
                <dd>{form.currentProcess}</dd>
                <dt>Funcionalidades</dt>
                <dd>{form.features.join(", ") || "A definir na conversa"}</dd>
              </dl>
            </details>
            <label className="consent-check">
              <input
                id="consent"
                type="checkbox"
                checked={form.consent}
                onChange={(e) => update("consent", e.target.checked)}
                aria-invalid={!!fieldErrors.consent}
                required
              />
              <span>
                Autorizo o tratamento dos meus dados para receber retorno sobre
                este pedido, conforme a{" "}
                <Link
                  href="/politica-de-privacidade"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Política de Privacidade
                </Link>
                .
              </span>
            </label>
            <FieldError name="consent" error={fieldErrors.consent} />
            <div className="wizard-privacy">
              <ShieldCheck size={17} /> Seus dados serão usados para analisar e
              responder a este pedido.
            </div>
          </>
        )}
      </div>
      {error && (
        <div className="wizard-error" role="alert">
          <CircleAlert size={18} />
          {error}
        </div>
      )}
      <div className="wizard-actions">
        <button
          className="button button-ghost"
          type="button"
          onClick={() => {
            interacted.current = true;
            setError("");
            setFieldErrors({});
            setStep((current) => Math.max(0, current - 1));
          }}
          disabled={step === 0 || busy}
        >
          <ArrowLeft size={17} /> Voltar
        </button>
        <button className="button button-primary" type="submit" disabled={busy}>
          {busy ? (
            <>
              <LoaderCircle size={17} className="spin-icon" /> Enviando…
            </>
          ) : (
            <>
              {step === 6 ? "Enviar pedido" : "Continuar"}
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
