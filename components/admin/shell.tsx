"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Boxes,
  FileText,
  ChartNoAxesCombined,
  Settings2,
  ShieldCheck,
  Server,
  ArrowUpRight,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { BrandIcon } from "@/components/brand/brand";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { api, type SessionUser } from "./shared";

const navigation = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/projetos", label: "Projetos", icon: FolderKanban },
  { href: "/admin/servicos", label: "Serviços", icon: Boxes },
  { href: "/admin/conteudo", label: "Conteúdo", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: ChartNoAxesCombined },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings2 },
  { href: "/admin/usuarios", label: "Usuários", icon: ShieldCheck },
  { href: "/admin/sistema", label: "Sistema", icon: Server },
];
function subscribeViewport(callback: () => void) {
  const query = window.matchMedia("(max-width: 1023px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function mobileSnapshot() {
  return window.matchMedia("(max-width: 1023px)").matches;
}

export function AdminShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const sidebar = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const mobile = useSyncExternalStore(
    subscribeViewport,
    mobileSnapshot,
    () => false,
  );
  useEffect(() => {
    const expired = () => router.replace("/admin/login");
    window.addEventListener("vs-session-expired", expired);
    return () => window.removeEventListener("vs-session-expired", expired);
  }, [router]);
  useEffect(() => {
    if (!open || !mobile) return;
    const previousOverflow = document.body.style.overflow;
    const opener = menuButton.current;
    document.body.style.overflow = "hidden";
    const focusable = () =>
      Array.from(
        sidebar.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex="0"]',
        ) ?? [],
      );
    focusable()[0]?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab") {
        const items = focusable();
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", close);
      opener?.focus();
    };
  }, [open, mobile]);
  const current = [...navigation]
    .reverse()
    .find(
      (item) =>
        pathname === item.href ||
        (item.href !== "/admin" && pathname.startsWith(`${item.href}/`)),
    );
  async function logout() {
    setSigningOut(true);
    try {
      await api("/api/admin/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setSigningOut(false);
    }
  }
  return (
    <div className={`adm-shell${open ? " adm-nav-open" : ""}`}>
      <a className="adm-skip-link" href="#admin-content">
        Pular para o conteúdo
      </a>
      {open && (
        <button
          className="adm-overlay"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        ref={sidebar}
        className="adm-sidebar"
        id="admin-navigation"
        inert={mobile && !open}
        aria-hidden={mobile && !open ? true : undefined}
      >
        <div className="adm-brand">
          <Link
            href="/admin"
            aria-label="VIEIRA SYSTEMS, visão geral"
            onClick={() => setOpen(false)}
          >
            <BrandIcon size={56} priority />
            <span>
              VIEIRA <b>SYSTEMS</b>
              <small>ADMIN WORKSPACE</small>
            </span>
          </Link>
          <button
            className="adm-icon-button adm-mobile-close"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>
        <p className="adm-nav-label">GESTÃO</p>
        <nav aria-label="Navegação administrativa">
          {navigation
            .filter(
              (item) =>
                user.role === "admin" ||
                ![
                  "/admin/usuarios",
                  "/admin/sistema",
                  "/admin/configuracoes",
                ].includes(item.href),
            )
            .map(({ href, label, icon: Icon }, index) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={current?.href === href ? "page" : undefined}
                className={`${current?.href === href ? "is-active" : ""}${index === 6 ? " adm-nav-separated" : ""}`}
              >
                <Icon size={18} />
                <span>{label}</span>
                {current?.href === href && <ChevronRight size={14} />}
              </Link>
            ))}
        </nav>
        <div className="adm-sidebar-bottom">
          <Link href="/" className="adm-site-link" target="_blank">
            Abrir site <ArrowUpRight size={16} />
          </Link>
          <div className="adm-user">
            <span className="adm-avatar">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <strong>{user.name}</strong>
              <small>
                {user.role === "admin" ? "Administrador" : "Editor"}
              </small>
            </div>
            <button
              className="adm-icon-button"
              onClick={logout}
              disabled={signingOut}
              aria-label="Sair da conta"
              title="Sair da conta"
            >
              <LogOut size={17} />
            </button>
          </div>
          {error && (
            <p className="adm-feedback-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </aside>
      <div className="adm-workspace" inert={open && mobile}>
        <div className="adm-topbar">
          <div>
            <button
              ref={menuButton}
              className="adm-icon-button adm-menu-toggle"
              aria-label="Abrir navegação"
              aria-controls="admin-navigation"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu size={21} />
            </button>
            <span>Painel administrativo</span>
            <ChevronRight size={14} />
            <strong>{current?.label || "Lead"}</strong>
          </div>
          <div>
            <span className="adm-private">
              <ShieldCheck size={14} /> Ambiente restrito
            </span>
            <ThemeToggle />
          </div>
        </div>
        <main id="admin-content" className="adm-main">
          {children}
        </main>
        <footer className="adm-bottom">
          VIEIRA SYSTEMS <span>Software. Processos. Evolução.</span>
        </footer>
      </div>
    </div>
  );
}
