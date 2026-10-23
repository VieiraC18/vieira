import Link from "next/link";
import { CookiePreferencesButton } from "@/components/site/analytics-consent";
import { JsonLd } from "@/components/site/json-ld";
import { analyticsIds } from "@/lib/analytics-config";
import { getPublicSettings } from "@/lib/server/public";
import { emailUrl } from "@/lib/public-links";
import { breadcrumbSchema, getSiteOrigin, pageMetadata } from "@/lib/seo";
import styles from "@/components/site/public-content.module.css";

export function generateMetadata() {
  return pageMetadata({
    title: "Política de Privacidade",
    description:
      "Saiba como o site da VIEIRA SYSTEMS usa as informações de contato, preferências e dados de navegação.",
    path: "/politica-de-privacidade",
  });
}

export default async function PrivacyPage() {
  const [settings, origin] = await Promise.all([
    getPublicSettings(),
    getSiteOrigin(),
  ]);
  const ids = analyticsIds(settings);
  const providers = [
    ids.ga && "Google Analytics",
    ids.gtm && "Google Tag Manager",
    ids.pixel && "Meta Pixel",
  ].filter(Boolean);
  const email = emailUrl(settings.email);
  return (
    <>
      <JsonLd
        data={breadcrumbSchema(origin, [
          { name: "Início", path: "/" },
          { name: "Política de Privacidade", path: "/politica-de-privacidade" },
        ])}
      />
      <article className="legal-page page-wrap">
        <nav className="breadcrumb" aria-label="Você está em">
          <Link href="/">Início</Link>
          <span aria-hidden="true">/</span>
          <span>Política de Privacidade</span>
        </nav>
        <span className="eyebrow">TRANSPARÊNCIA SOBRE SEUS DADOS</span>
        <h1>Política de Privacidade</h1>
        <p className="legal-updated">
          Última atualização: 4 de outubro de 2026
        </p>
        <p>
          Esta página descreve o tratamento de informações pelo site da VIEIRA
          SYSTEMS: o que recebemos, como usamos e quais escolhas estão
          disponíveis durante sua navegação.
        </p>
        <h2>Informações que você envia</h2>
        <p>
          O formulário de orçamento solicita nome, empresa, e-mail, WhatsApp,
          necessidade, descrição do problema e do processo atual, uso de
          planilhas e sistemas, funcionalidades desejadas e prioridade. Uma
          preferência de investimento pode ser solicitada quando essa opção
          estiver disponível. Registramos também a confirmação de consentimento,
          a data do envio e a origem da solicitação, incluindo parâmetros de
          campanha presentes na visita.
        </p>
        <p>
          Envie apenas as informações necessárias para explicar o projeto. Evite
          incluir senhas, dados financeiros, documentos pessoais ou dados
          sensíveis de outras pessoas nos campos de texto.
        </p>
        <h2>Como utilizamos essas informações</h2>
        <p>
          Usamos os dados para analisar sua solicitação, responder pelo contato
          informado, preparar uma proposta e organizar o acompanhamento da
          oportunidade. O histórico administrativo pode incluir anotações de
          atendimento e mudanças de status.
        </p>
        <p>
          O envio é voluntário. O formulário pede sua autorização para usar os
          dados no atendimento da solicitação e registra esse aceite. Uma
          solicitação de orçamento não equivale à contratação de serviços.
        </p>
        <h2>Armazenamento e acesso</h2>
        <p>
          As solicitações são armazenadas no banco de dados da plataforma. O
          acesso ao painel exige autenticação e as permissões de usuários
          limitam as ações administrativas. Provedores de hospedagem e de banco
          de dados participam do processamento necessário para operar o serviço
          e podem manter infraestrutura em outros países.
        </p>
        <p>
          As informações são mantidas enquanto necessárias ao atendimento, ao
          histórico do relacionamento e a obrigações aplicáveis. Solicitações de
          exclusão são analisadas considerando essas finalidades. A plataforma
          permite excluir registros de leads; não aplica um prazo automático
          único de retenção para todos os pedidos.
        </p>
        <h2>Dados técnicos e proteção contra abuso</h2>
        <p>
          A infraestrutura pode registrar informações técnicas sobre requisições
          e falhas. Para limitar tentativas repetidas nos formulários e no
          acesso administrativo, a aplicação usa identificadores protegidos
          derivados do endereço de rede e, quando pertinente, do e-mail. Também
          registra ações administrativas para acompanhamento de alterações.
        </p>
        <h2>Preferências, sessão e cookies opcionais</h2>
        <p>
          O navegador guarda a preferência de tema e a escolha sobre cookies. Na
          aba atual, também guardamos o caminho inicial e parâmetros de campanha
          para associar a origem ao pedido, sem armazenar os campos de contato
          nesse registro. A decisão sobre cookies opcionais é lembrada por até
          180 dias. Para quem acessa a administração, um cookie mantém a sessão
          autenticada por até oito horas.
        </p>
        <p>
          {providers.length
            ? `As ferramentas configuradas neste momento são: ${providers.join(", ")}. Elas só são carregadas depois que você aceita os cookies opcionais.`
            : "Nenhuma ferramenta opcional de medição ou publicidade está configurada neste momento."}
        </p>
        <p>
          Quando autorizadas, ferramentas de medição e publicidade podem receber
          dados de navegação e identificadores de dispositivo conforme suas
          configurações. Google Tag Manager permite administrar outras tags. O
          conteúdo dos campos do orçamento não é enviado pela aplicação como
          evento de analytics.
        </p>
        <p>
          Você pode recusar os cookies opcionais e continuar usando o site.
          Também pode mudar sua escolha pelo botão abaixo ou pelo rodapé. Ao
          revogar, o site remove os cookies conhecidos dessas ferramentas que
          estão acessíveis neste domínio e recarrega a página para interromper
          os scripts. Isso não apaga dados já recebidos pelos provedores.
        </p>
        <div className={styles.privacyActions}>
          <CookiePreferencesButton label="Revisar minhas preferências de cookies" />
        </div>
        <h2>WhatsApp e links externos</h2>
        <p>
          Os links de WhatsApp e redes sociais abrem serviços externos com
          políticas próprias. Depois de enviar o orçamento, você pode escolher
          abrir uma mensagem de WhatsApp com o resumo do projeto. O texto só é
          enviado no WhatsApp quando você confirma o envio naquele aplicativo.
        </p>
        <h2>Solicitações sobre seus dados</h2>
        <p>
          Você pode pedir informações sobre o tratamento, acesso, correção ou
          exclusão de seus dados, além de revogar o consentimento, conforme
          aplicável. Para localizar o registro, informe o e-mail usado no
          contato. Pode ser necessário confirmar sua identidade antes de atender
          o pedido.
        </p>
        <p>
          {email ? (
            <>
              Envie sua solicitação para <a href={email}>{settings.email}</a>.
            </>
          ) : (
            <>
              Use os canais disponíveis em <Link href="/contato">Contato</Link>{" "}
              ou envie um pedido pelo{" "}
              <Link href="/orcamento?necessidade=Privacidade%20e%20dados%20pessoais">
                formulário de contato
              </Link>
              , indicando que se trata de privacidade.
            </>
          )}
        </p>
        <p>
          Conheça também as{" "}
          <a
            href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares"
            target="_blank"
            rel="noopener noreferrer"
          >
            orientações da ANPD sobre os direitos dos titulares
          </a>
          .
        </p>
        <h2>Atualizações</h2>
        <p>
          Esta política pode mudar quando o funcionamento do site for alterado.
          A data no início identifica a revisão mais recente.
        </p>
      </article>
    </>
  );
}
