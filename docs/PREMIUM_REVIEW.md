# Refinamento visual — 22 de outubro de 2026

Fonte: `E:\Skills\Design\skills-main-premium.zip`, pacote **Skills For Designers and Engineers**. Foram aplicadas as orientações `emil-design-eng` e `animation-performance`: hierarquia visual, resposta imediata, curvas de desaceleração, sombras estáticas, movimento com propósito e interação adequada ao dispositivo.

## Revisão e alterações

| Antes                                                                   | Depois                                                                                   | Motivo                                                        |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Navegação sobreposta diretamente ao conteúdo, marca em um bloco isolado | Barra flutuante com superfície única, sombra discreta e indicação da rota atual          | Organização da navegação e separação durante a rolagem        |
| Título muito fragmentado e diagrama sem contexto externo                | Tipografia balanceada, diagrama mais compacto e etapas Entender → Construir → Evoluir    | Melhor proporção entre mensagem e representação do trabalho   |
| Dois serviços largos, seguidos de quatro cartões em três colunas        | Seis cartões com ícones em duas fileiras de três; duas colunas no tablet, uma no celular | Eliminar cartão isolado e alinhar títulos, descrições e links |
| Sombras de cartões e espaçamento de links animados                      | Sombras estáticas e deslocamento apenas do ícone                                         | Reduzir repintura e evitar animação de layout                 |
| Movimento de hover também acionado por toque                            | Movimento condicionado a mouse e ponteiro preciso; resposta de pressão de 100 ms         | Evitar estado de hover persistente no celular                 |
| Revelação de 560 ms com deslocamento de 18 px                           | 420 ms, deslocamento de 12 px e curva `cubic-bezier(.23,1,.32,1)`                        | Entrada mais curta e acomodação suave                         |
| Efeito de revelação podia ocultar conteúdo já visível ao hidratar       | Elementos já na tela permanecem visíveis                                                 | Evitar lampejo do conteúdo pronto                             |
| Movimento reduzido encurtava a duração, mas preservava atrasos          | Duração e atrasos reduzidos; conteúdo imediatamente legível                              | Respeitar a preferência também nas entradas em sequência      |

As logos oficiais, os temas e o posicionamento em sites e software sob medida continuam guiando a apresentação. Nenhuma dependência de animação foi adicionada. O refinamento público está em `app/(site)/premium.css`; os ajustes de controles e movimento ficam no CSS global.

## Escopo da verificação

História verificada: visitante acessa conteúdo publicado pelo CMS → navega pelas capacidades e serviços → escolhe uma necessidade → encontra o caminho de orçamento. A alteração usa a leitura de conteúdo e os destinos já existentes; as APIs de gravação não foram modificadas.

As capturas de comparação estão em `.review/premium-before-*` e `.review/premium-after-*`, nos temas claro/escuro e em desktop/celular. A revisão inclui menu com toque, navegação por teclado, indicação de página atual, controle de pausa e movimento reduzido. Os testes públicos existentes verificam conteúdo/SEO, 15 rotas em oito larguras, foco do menu, temas e acessibilidade automatizada.

Resultado: **12 testes aprovados em 5,1 minutos** na execução direcionada de `tests/site.spec.ts`. ESLint, TypeScript, formatação e build de produção também passaram. A conferência com navegador de toque confirmou navegação e `aria-current` no menu. Capturas foram inspecionadas em desktop, tema claro e celular.

O checklist React foi aplicado aos componentes alterados: ícones estáticos fora da renderização, chaves estáveis, conteúdo no servidor, hook de rota apenas na navegação e nenhum estado atualizado por quadro de animação. O scroll reveal mantém um único observer por bloco e desconecta após a entrada.

Não foi feita medição em aparelho físico nem nova auditoria Lighthouse nesta revisão. As medições anteriores continuam identificadas pela data em `REVIEW.md`; não representam uma nova pontuação desta versão.
