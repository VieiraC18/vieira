import { getPublicSettings } from "@/lib/server/public";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { QuoteWizard } from "@/components/site/quote-wizard";
import { BrandIcon } from "@/components/brand/brand";
export const generateMetadata = () =>
  pageMetadata({
    title: "Conte seu projeto",
    description:
      "Conte como funciona o processo que você quer melhorar. A VIEIRA SYSTEMS ajuda a identificar o próximo passo.",
    path: "/orcamento",
  });
export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ necessidade?: string }>;
}) {
  const [settings, params] = await Promise.all([
    getPublicSettings(),
    searchParams,
  ]);
  return (
    <section className="quote-page">
      <div className="page-wrap">
        <div className="quote-top">
          <Link href="/" className="quote-back">
            <ArrowLeft size={15} /> Início
          </Link>
          <BrandIcon size={35} />
          <span className="quote-secure">
            <ShieldCheck size={15} /> Formulário seguro
          </span>
        </div>
        <div className="quote-layout">
          <div className="quote-side">
            <span className="eyebrow">VIEIRA SYSTEMS · PROJETOS</span>
            <h1>O próximo passo é entender o cenário.</h1>
            <p>
              Não precisa chegar com uma solução pronta. Conte como o trabalho
              acontece hoje e nós ajudamos a descobrir o que pode melhorar.
            </p>
            <div className="quote-side-points">
              <span>
                <i /> Uma conversa começa pelo seu processo.
              </span>
              <span>
                <i /> Suas informações não viram uma proposta automática.
              </span>
              <span>
                <i /> A tecnologia é definida depois do diagnóstico.
              </span>
            </div>
            <div className="quote-side-note">
              <span className="quote-note-line" />
              <span>
                Entender.
                <br />
                Mapear.
                <br />
                Construir com propósito.
              </span>
            </div>
          </div>
          <QuoteWizard
            initialNeed={
              typeof params.necessidade === "string" ? params.necessidade : ""
            }
            investmentEnabled={settings.budgetEnabled}
            investmentRanges={settings.budgetRanges}
            hasWhatsapp={!!settings.whatsapp}
          />
        </div>
        <div className="quote-foot">
          <ShieldCheck size={14} /> Seus dados são utilizados apenas para dar
          retorno sobre este pedido.
          <Link href="/politica-de-privacidade">Política de Privacidade</Link>
        </div>
      </div>
    </section>
  );
}
