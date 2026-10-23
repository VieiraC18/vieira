# Design system — VIEIRA SYSTEMS

## Identidade

Logo 1 é a assinatura completa, PNG RGBA 2172 × 724, proporção 3:1. Logo 2 é o símbolo, PNG RGBA 1254 × 1254, proporção 1:1. Os originais permanecem na raiz. Cópias oficiais em `public/brand`; favicon e ícones PWA em `public/icons` preservam o desenho e a proporção.

`BrandLogo`, `BrandIcon`, `BrandMark` e `BrandLoader` centralizam aplicação e caminhos. A assinatura tem superfície escura controlada no tema claro para manter o contraste original. O maskable mantém margem de segurança ao redor do símbolo.

## Sistema visual

O site combina navy, azul e ciano derivados da marca com tipografia Manrope nos títulos e DM Sans no texto. As fontes variáveis são locais, com preload via `next/font/local`. Não há requisição de fonte ao Google.

As variáveis CSS separam fundo, superfície, texto, borda, ação, estado e movimento. Os temas reutilizam os mesmos componentes com valores semânticos próprios. Azul/ciano de texto do tema claro é mais escuro que a cor ornamental do tema escuro.

Hierarquia: títulos amplos com quebra balanceada, parágrafos com medida limitada, rótulos curtos e detalhes editoriais. O conteúdo tem largura máxima de 1240 px. A navegação pública ocupa uma superfície flutuante com separação discreta e indica a rota atual. Os serviços usam três colunas no desktop, duas no tablet e uma no celular, com ícones e alinhamento entre cartões. Administração usa superfícies mais densas, números tabulares, tabelas com scroll interno e estados vazios que explicam o próximo passo.

O refinamento da apresentação pública fica em `app/(site)/premium.css`; os tokens e componentes de base permanecem no CSS global. As superfícies usam bordas translúcidas, luz interna sutil e sombras estáticas. O hero mantém o núcleo VS e explicita as etapas Entender → Construir → Evoluir.

## Motion system

| Uso                  | Duração                     | Comportamento                              |
| -------------------- | --------------------------- | ------------------------------------------ |
| Pressão de controles | 100 ms                      | Escala sutil, resposta imediata            |
| Feedback e foco      | 150 ms                      | Cor e borda                                |
| Botões e ícones      | 160–180 ms                  | Transições interrompíveis                  |
| Cartões e painel     | 240–260 ms                  | Pequena translação e mudança de superfície |
| Scroll reveal        | 420 ms                      | Opacidade e translação de 12 px            |
| Entrada de títulos   | 520 ms                      | Deslocamento curto com texto já visível    |
| Stagger              | 35–45 ms                    | Sequência curta, limitada                  |
| Curva base           | `cubic-bezier(.2,0,0,1)`    | Desaceleração consistente                  |
| Feedback refinado    | `cubic-bezier(.23,1,.32,1)` | Resposta rápida e acomodação suave         |

O hero representa entradas → núcleo VS → soluções, com SVG e CSS. O botão de pausa interrompe o movimento contínuo. No celular, entradas e saídas ficam acima/abaixo do núcleo. A linha de metodologia progride quando as etapas entram na viewport; o texto mantém contraste mesmo antes da animação.

Scroll reveal usa IntersectionObserver, sem dependência pesada, e mantém visível o conteúdo que já está na tela ao iniciar. O menu mobile usa `<dialog>` nativo. Movimentos de hover ficam restritos a mouse/ponteiro preciso; o toque recebe feedback de pressão. Links deslocam o ícone sem animar o espaçamento. Sombras de cartões não são animadas. `prefers-reduced-motion` reduz animações e torna o conteúdo imediatamente legível. Não existe espera artificial antes de mostrar conteúdo pronto.

O refinamento de 22 de outubro de 2026 usa as orientações `emil-design-eng` e `animation-performance` de `E:\Skills\Design\skills-main-premium.zip`. A biblioteca orienta os detalhes da interface; identidade, conteúdo e requisitos da VIEIRA SYSTEMS guiam a composição final.

## Acessibilidade e estados

- Foco visível, link para pular conteúdo, landmarks e títulos ordenados.
- Controles principais com área de pelo menos 44 px; campos em 16 px para leitura e zoom mobile.
- Formulário com rótulos, validação por etapa, mensagens específicas, foco no erro e estado de envio.
- Consentimento explícito, confirmação após persistência e alternativa manual ao popup do WhatsApp.
- Menu com Escape e retenção/restauração de foco; painel mobile torna o restante da tela inerte.
- Estados de carregamento, erro, sucesso, lista vazia e 404 próprios.

## Critérios de revisão

Verificar desktop e celular nos dois temas, overflow, foco, contraste, imagens sem deformação e nenhum link sem destino. A avaliação automática é complementada por screenshots: gradientes e elementos decorativos exigem inspeção visual. Logos e conteúdo real prevalecem sobre sugestões genéricas de qualquer biblioteca de design.
