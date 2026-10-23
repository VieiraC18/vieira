"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { BrandIcon, BrandLogo } from "@/components/brand/brand";
import { ThemeToggle } from "@/components/site/theme-toggle";

const links = [
  ["Soluções", "/solucoes"],
  ["Serviços", "/servicos"],
  ["Automação", "/automacao"],
  ["Dados", "/dados"],
  ["IA", "/inteligencia-artificial"],
  ["Projetos", "/projetos"],
  ["Sobre", "/sobre"],
];

export function SiteNav() {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 16);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);
  function openMenu() {
    menuRef.current?.showModal();
    setOpen(true);
  }
  function closeMenu() {
    menuRef.current?.close();
    setOpen(false);
  }
  return (
    <header className={`site-header${scrolled ? " site-header-scrolled" : ""}`}>
      <div className="nav-inner page-wrap">
        <Link
          href="/"
          className="nav-brand"
          aria-label="VIEIRA SYSTEMS, início"
          onClick={() => setOpen(false)}
        >
          <span className="nav-brand-full">
            <BrandLogo priority />
          </span>
          <span className="nav-brand-icon">
            <BrandIcon size={37} priority />
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Navegação principal">
          {links.map(([label, href]) => (
            <Link
              href={href}
              key={href}
              aria-current={
                pathname === href || pathname.startsWith(`${href}/`)
                  ? "page"
                  : undefined
              }
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          <Link className="button button-primary nav-cta" href="/orcamento">
            Conte seu projeto <ArrowUpRight size={15} />
          </Link>
          <button
            className="icon-button menu-toggle"
            onClick={openMenu}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label="Abrir menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <dialog
        ref={menuRef}
        id="mobile-navigation"
        className={`mobile-menu${open ? " mobile-menu-open" : ""}`}
        onClose={() => setOpen(false)}
        aria-label="Menu de navegação"
      >
        <div className="mobile-menu-top">
          <BrandLogo compact />
          <button
            className="icon-button"
            onClick={closeMenu}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav aria-label="Navegação móvel">
          {links.map(([label, href], index) => (
            <Link
              href={href}
              key={href}
              aria-current={
                pathname === href || pathname.startsWith(`${href}/`)
                  ? "page"
                  : undefined
              }
              style={{ "--menu-index": index } as React.CSSProperties}
              onClick={closeMenu}
            >
              {label}
              <ArrowUpRight size={17} />
            </Link>
          ))}
        </nav>
        <Link
          className="button button-primary mobile-menu-cta"
          href="/orcamento"
          onClick={closeMenu}
        >
          Conte seu projeto <ArrowUpRight size={16} />
        </Link>
        <p>Entender. Automatizar. Integrar. Desenvolver.</p>
      </dialog>
    </header>
  );
}
