import Link from "next/link";
import { JsonLd } from "@/components/site/json-ld";
import { breadcrumbSchema, getSiteOrigin, pageMetadata } from "@/lib/seo";

export function generateMetadata() {
  return pageMetadata({
    title: "Termos de Uso",
    description:
      "Condições de uso das páginas, conteúdos e formulário de contato da VIEIRA SYSTEMS.",
    path: "/termos",
  });
}

export default async function TermsPage() {
  const origin = await getSiteOrigin();
  return (
    <>
      <JsonLd
        data={breadcrumbSchema(origin, [
          { name: "Início", path: "/" },
          { name: "Termos de Uso", path: "/termos" },
        ])}
      />
      <article className="legal-page page-wrap">
        <nav className="breadcrumb" aria-label="Você está em">
          <Link href="/">Início</Link>
          <span aria-hidden="true">/</span>
          <span>Termos de Uso</span>
        </nav>
        <span className="eyebrow">CONDIÇÕES DE USO</span>
        <h1>Termos de Uso</h1>
        <p className="legal-updated">
          Última atualização: 4 de outubro de 2026
        </p>
        <p>
          Estes termos explicam as condições de uso do site da VIEIRA SYSTEMS,
          de seu conteúdo e dos recursos de contato.
        </p>
        <h2>Conteúdo e apresentação dos serviços</h2>
        <p>
          As páginas apresentam áreas de atuação e projetos para fins
          informativos. Os exemplos ajudam a entender possíveis aplicações da
          tecnologia. Não representam uma proposta comercial nem garantem
          escopo, prazo ou resultado específico.
        </p>
        <p>
          Projetos conceituais e demonstrações técnicas são identificados.
          Imagens, descrições e resultados de cada projeto devem ser
          interpretados no contexto apresentado.
        </p>
        <h2>Solicitações de projeto</h2>
        <p>
          O formulário organiza as informações para análise e contato. O envio
          de uma solicitação não cria um contrato de prestação de serviços.
          Escopo, investimento, responsabilidades e condições de execução
          dependem de alinhamento e formalização entre as partes.
        </p>
        <p>
          Ao preencher o formulário, forneça dados corretos e utilize
          informações que você tenha autorização para compartilhar. Não inclua
          segredos comerciais ou dados sensíveis desnecessários ao primeiro
          contato.
        </p>
        <h2>Uso dos recursos</h2>
        <p>
          Não utilize o site para atividades ilícitas, envio de conteúdo
          malicioso, tentativas de acesso a áreas restritas ou ações que
          comprometam o serviço. Podemos limitar requisições repetidas e impedir
          acessos que apresentem sinais de abuso.
        </p>
        <h2>Propriedade intelectual</h2>
        <p>
          A marca VIEIRA SYSTEMS e o conteúdo original do site pertencem a seus
          respectivos titulares. Tecnologias, bibliotecas e recursos de
          terceiros seguem suas próprias licenças. A publicação de um projeto
          não transfere direitos sobre seu código, marca ou conteúdo.
        </p>
        <h2>Serviços e links externos</h2>
        <p>
          O site pode oferecer links para WhatsApp, redes sociais e projetos
          externos. Esses serviços têm condições próprias e seu funcionamento é
          de responsabilidade dos respectivos provedores.
        </p>
        <h2>Disponibilidade e alterações</h2>
        <p>
          O site pode passar por manutenção, atualizações e correções. Os
          recursos e conteúdos podem mudar, e o acesso pode ser temporariamente
          interrompido. Estas condições não afastam direitos previstos na
          legislação aplicável.
        </p>
        <h2>Privacidade</h2>
        <p>
          O uso dos dados enviados e as escolhas sobre cookies estão descritos
          na{" "}
          <Link href="/politica-de-privacidade">Política de Privacidade</Link>.
        </p>
        <h2>Contato</h2>
        <p>
          Para dúvidas sobre o site ou estes termos, acesse a página{" "}
          <Link href="/contato">Contato</Link>.
        </p>
        <div className="legal-note">
          A contratação de serviços possui condições próprias, acordadas para
          cada projeto.
        </div>
      </article>
    </>
  );
}
