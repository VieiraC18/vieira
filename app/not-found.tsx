import Link from "next/link";
import { BrandIcon } from "@/components/brand/brand";

export default function NotFound() {
  return (
    <main className="not-found page-wrap">
      <BrandIcon size={84} priority />
      <p className="eyebrow">ERRO 404 · ROTA NÃO ENCONTRADA</p>
      <h1>Essa rota não existe.</h1>
      <p>
        Vamos voltar para um caminho conhecido e entender o que você precisa
        resolver.
      </p>
      <Link className="button button-primary" href="/">
        Voltar para o início <span aria-hidden>↗</span>
      </Link>
    </main>
  );
}
