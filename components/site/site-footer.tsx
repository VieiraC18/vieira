import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand";
import { CookiePreferencesButton } from "@/components/site/analytics-consent";
import { safeWebUrl } from "@/lib/public-links";
import type { PublicSettings } from "@/lib/validators";
import type { defaultFooter } from "@/lib/site-content";
import styles from "@/components/site/public-content.module.css";

export function SiteFooter({
  settings,
  content,
}: {
  settings: PublicSettings;
  content: typeof defaultFooter;
}) {
  const socials = [
    ["Instagram", settings.instagram],
    ["LinkedIn", settings.linkedin],
    ["GitHub", settings.github],
  ].flatMap(([name, value]) => {
    const href = safeWebUrl(value);
    return href ? [{ name, href }] : [];
  });
  return (
    <footer className="site-footer">
      <div className="page-wrap footer-main">
        <div className="footer-brand-block">
          <Link href="/" aria-label="VIEIRA SYSTEMS, início">
            <BrandLogo />
          </Link>
          <p>{content.description}</p>
          <span className="footer-location">{settings.slogan}</span>
        </div>
        <div className="footer-column">
          <span className="footer-label">EXPLORAR</span>
          <Link href="/solucoes">Soluções</Link>
          <Link href="/servicos">Serviços</Link>
          <Link href="/projetos">Projetos</Link>
          <Link href="/sobre">Sobre</Link>
        </div>
        <div className="footer-column">
          <span className="footer-label">ESPECIALIDADES</span>
          <Link href="/automacao">Automação</Link>
          <Link href="/dados">Dados e BI</Link>
          <Link href="/inteligencia-artificial">Inteligência artificial</Link>
          <Link href="/consultoria">Consultoria</Link>
          <Link href="/assessoria">Assessoria</Link>
        </div>
        <div className="footer-contact">
          <span className="footer-label">PRÓXIMO PASSO</span>
          <h3>Tem um processo que poderia funcionar melhor?</h3>
          <Link href="/orcamento" className="footer-link">
            {content.ctaLabel} <ArrowUpRight size={16} />
          </Link>
          <Link href="/contato">Canais de contato</Link>
        </div>
      </div>
      <div className={`page-wrap footer-bottom ${styles.footerBottom}`}>
        <span>
          © {new Date().getFullYear()} VIEIRA SYSTEMS. Todos os direitos
          reservados.
        </span>
        <div className={`footer-legal ${styles.footerLegal}`}>
          <Link href="/politica-de-privacidade">Privacidade</Link>
          <Link href="/termos">Termos</Link>
          <CookiePreferencesButton />
          <Link href="/admin/login">Acesso administrativo</Link>
        </div>
        {socials.length > 0 && (
          <div
            className={`footer-social ${styles.socialLinks}`}
            aria-label="Redes sociais"
          >
            {socials.map(({ name, href }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${name} da VIEIRA SYSTEMS (abre em nova aba)`}
              >
                {name}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}
