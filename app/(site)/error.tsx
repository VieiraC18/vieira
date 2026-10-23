"use client";
import Link from "next/link";
import { BrandIcon } from "@/components/brand/brand";

export default function PublicError({ retry }: { retry: () => void }) {
  return (
    <section className="not-found page-wrap" role="alert">
      <BrandIcon size={72} />
      <p className="eyebrow">VAMOS TENTAR NOVAMENTE</p>
      <h1>Não foi possível abrir esta página.</h1>
      <p>
        Pode ser uma falha temporária. Tente carregar de novo ou volte ao
        início.
      </p>
      <div className="hero-actions">
        <button className="button button-primary" onClick={retry}>
          Tentar novamente
        </button>
        <Link className="button button-outline" href="/">
          Voltar ao início
        </Link>
      </div>
    </section>
  );
}
