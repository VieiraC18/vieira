import Link from "next/link";
import {
  ArrowUpRight,
  Mail,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand";
import { JsonLd } from "@/components/site/json-ld";
import { getContent, getPublicSettings } from "@/lib/server/public";
import { defaultContact } from "@/lib/site-content";
import { emailUrl, safeWebUrl, whatsappUrl } from "@/lib/public-links";
import { breadcrumbSchema, getSiteOrigin, pageMetadata } from "@/lib/seo";
import styles from "@/components/site/public-content.module.css";

export async function generateMetadata() {
  const content = await getContent("contact", defaultContact);
  return pageMetadata({
    title: "Contato",
    description: content.description,
    path: "/contato",
  });
}
export default async function ContactPage() {
  const [content, settings, origin] = await Promise.all([
    getContent("contact", defaultContact),
    getPublicSettings(),
    getSiteOrigin(),
  ]);
  const whatsapp = whatsappUrl(settings.whatsapp);
  const email = emailUrl(settings.email);
  const socials = [
    ["Instagram", settings.instagram],
    ["LinkedIn", settings.linkedin],
    ["GitHub", settings.github],
  ].flatMap(([name, value]) => {
    const href = safeWebUrl(value);
    return href ? [{ name, href }] : [];
  });
  return (
    <>
      <JsonLd
        data={breadcrumbSchema(origin, [
          { name: "Início", path: "/" },
          { name: "Contato", path: "/contato" },
        ])}
      />
      <section className="inner-hero contact-page page-wrap">
        <nav className="breadcrumb" aria-label="Você está em">
          <Link href="/">Início</Link>
          <span aria-hidden="true">/</span>
          <span>Contato</span>
        </nav>
        <div className="contact-panel">
          <div>
            <span className="eyebrow">
              <MessageSquareText size={13} /> FALE COM A VIEIRA SYSTEMS
            </span>
            <h1>{content.title}</h1>
            <p>{content.description}</p>
            <div className="contact-points">
              <span>
                <ShieldCheck size={17} /> Seus dados são usados para entender e
                responder ao pedido.
              </span>
              <span>
                <MessageSquareText size={17} /> A conversa começa pelo seu
                cenário.
              </span>
            </div>
            {(whatsapp || email) && (
              <div className={styles.contactLinks}>
                {whatsapp && (
                  <a
                    href={`${whatsapp}?text=${encodeURIComponent("Olá! Quero conversar com a VIEIRA SYSTEMS sobre um projeto.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button button-outline"
                  >
                    <MessageSquareText size={16} /> Conversar no WhatsApp
                    <span className="sr-only"> (abre em nova aba)</span>
                  </a>
                )}
                {email && (
                  <a href={email} className="button button-ghost">
                    <Mail size={16} />
                    {settings.email}
                  </a>
                )}
              </div>
            )}
            {socials.length > 0 && (
              <div className={styles.contactLinks}>
                {socials.map(({ name, href }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button button-ghost"
                  >
                    {name}
                    <ArrowUpRight size={14} />
                    <span className="sr-only"> (abre em nova aba)</span>
                  </a>
                ))}
              </div>
            )}
            <div className={styles.contactBrand}>
              <BrandLogo />
            </div>
          </div>
          <div className="contact-action-card">
            <span className="contact-card-icon">
              <ArrowUpRight size={21} />
            </span>
            <h2>Conte seu projeto</h2>
            <p>
              O fluxo leva alguns minutos e organiza as informações para uma
              conversa mais produtiva.
            </p>
            <Link
              href="/orcamento"
              className="button button-primary button-large"
            >
              Começar agora <ArrowUpRight size={16} />
            </Link>
            <small>
              Sem compromisso e sem precisar de uma especificação técnica.
            </small>
          </div>
        </div>
      </section>
    </>
  );
}
