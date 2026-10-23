"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, LockKeyhole, ArrowLeft } from "lucide-react";
import { BrandLogo, BrandIcon } from "@/components/brand/brand";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { api, Feedback, Field } from "./shared";

export function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      await api("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({
          email: data.get("email"),
          password: data.get("password"),
        }),
      });
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }
  return (
    <main className="adm-login">
      <div className="adm-login-top">
        <Link href="/" aria-label="Voltar ao site VIEIRA SYSTEMS">
          <BrandLogo />
        </Link>
        <ThemeToggle />
      </div>
      <div className="adm-login-grid">
        <section className="adm-login-story">
          <span className="adm-login-mark">
            <BrandIcon size={100} priority />
          </span>
          <p className="adm-eyebrow">VIEIRA SYSTEMS / WORKSPACE</p>
          <h1>
            Um lugar para
            <br />
            conectar tudo.
          </h1>
          <p>
            Projetos, oportunidades e conteúdo.
            <br />A visão completa do seu próximo passo.
          </p>
          <div className="adm-login-flow">
            <span>Entender</span>
            <i />
            <span>Construir</span>
            <i />
            <span>Evoluir</span>
          </div>
        </section>
        <section className="adm-login-panel">
          <div className="adm-login-lock">
            <LockKeyhole size={23} />
          </div>
          <h2>Bem-vindo ao workspace.</h2>
          <p>Acesse sua conta para gerenciar a VIEIRA SYSTEMS.</p>
          {!configured && (
            <div className="adm-notice">
              <LockKeyhole size={19} />
              <div>
                <strong>Configuração inicial necessária</strong>
                <p>
                  Conecte o banco de dados e configure a autenticação no
                  ambiente de implantação. Depois, crie o primeiro administrador
                  seguindo o README do projeto.
                </p>
              </div>
            </div>
          )}
          <form onSubmit={submit}>
            <Field label="E-mail">
              <input
                type="email"
                name="email"
                autoComplete="username"
                required
                placeholder="seu@email.com"
                disabled={!configured}
              />
            </Field>
            <Field label="Senha">
              <span className="adm-password">
                <input
                  type={visible ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  required
                  disabled={!configured}
                />
                <button
                  type="button"
                  aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </span>
            </Field>
            <Feedback error={error} />
            <button
              className="adm-button adm-button-primary adm-login-submit"
              disabled={busy || !configured}
            >
              {busy ? "Entrando…" : "Entrar no workspace"}
              <ArrowRight size={18} />
            </button>
          </form>
          <p className="adm-login-help">
            Acesso exclusivo para pessoas autorizadas. Para recuperar o acesso,
            contate o administrador responsável.
          </p>
          <Link className="adm-login-back" href="/">
            <ArrowLeft size={15} /> Voltar ao site
          </Link>
        </section>
      </div>
      <footer className="adm-login-footer">
        VIEIRA SYSTEMS <span>Software que entende o seu processo.</span>
      </footer>
    </main>
  );
}
