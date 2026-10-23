# VIEIRA SYSTEMS

Site institucional, portfólio, captação de projetos, mini CRM e CMS em uma aplicação Next.js. A identidade utiliza os arquivos oficiais **Logo 1.png** e **Logo 2.png**, preservados na raiz.

## O que funciona

- Páginas de software, automação de processos e dados, integração, BI, IA, consultoria e assessoria.
- Home com diagrama animado da marca, seletor de problemas e linha de etapas; temas claro/escuro e movimento reduzido.
- Orçamento em sete etapas, validação, consentimento, origem/UTMs, envio idempotente e WhatsApp após persistência.
- Administração com login, dashboard de dados reais, filtros de período, leads, notas, histórico, projetos, serviços, conteúdo, configurações, usuários e auditoria.
- Portfólio publicado pelo CMS, cliente ocultável, galeria por URL, tecnologias, ordem e tipo de projeto.
- SEO, JSON-LD, sitemap, Open Graph oficial, ícones, manifest, instalação PWA e página offline.
- Analytics opcional, carregado após consentimento e revogável pelo rodapé.

## Stack e arquitetura

Next.js 16.3.8 (App Router), React 19.3, TypeScript, CSS com tokens próprios, Lucide, Zod, Drizzle e PostgreSQL. O driver Neon HTTP atende a produção serverless. PGlite fornece PostgreSQL local para desenvolvimento e testes, com o mesmo schema SQL.

O site usa Server Components para conteúdo e pequenos componentes de cliente para interação. O painel consome Route Handlers protegidos. A autorização acontece em cada operação; o layout também protege a navegação administrativa. O CMS é consultado por requisição, sem cache público persistente que atrase publicações.

```text
app/(site)          Site público e orçamento
app/(admin)         Login e telas administrativas
app/api            Endpoints públicos e administrativos
components/brand   Componentes e caminhos oficiais da marca
components/site    Interações públicas
components/admin   Interface de gestão
lib/db             Schema Drizzle e acesso PostgreSQL
lib/security       Validação de origem, limites e erros de API
lib/server         Consultas, auditoria, defaults e abstração de arquivos
drizzle            Migrações SQL versionadas
scripts            Bootstrap e verificações locais
tests              Playwright (browser + HTTP)
docs               Arquitetura, operação, design e revisão
```

## Começar localmente

Pré-requisitos: Node.js 22 ou 24 e npm. Os comandos abaixo partem da raiz do projeto.

```powershell
npm ci
Copy-Item .env.example .env.local
```

Edite `.env.local`: mantenha `DATABASE_MODE=local`, defina `AUTH_SECRET` aleatório (mínimo 32 caracteres), `ADMIN_EMAIL`, `ADMIN_PASSWORD` (mínimo 12 caracteres, máximo 72 bytes) e `ADMIN_NAME`.

Para gerar um segredo:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Depois:

```powershell
npm run db:migrate
npm run db:seed
npm run db:seed:admin
npm run db:seed:case
npm run dev -- --hostname 127.0.0.1
```

Acesse `http://127.0.0.1:3000` e `/admin/login`. `APP_URL` deve corresponder exatamente à origem usada no navegador, inclusive porta. Não misture `localhost` e `127.0.0.1` ao enviar formulários.

**Neste workspace, o ambiente local e o administrador já foram criados.** As credenciais geradas estão somente no arquivo ignorado `.env.local`. Consulte esse arquivo para o primeiro acesso. Não repita o bootstrap com o mesmo e-mail. Remova `ADMIN_PASSWORD` do ambiente de produção após criar o primeiro administrador.

O banco local fica em `.data/vieira`. Pare o servidor antes de executar scripts que abram esse mesmo banco; PGlite não deve ter dois processos escrevendo no mesmo diretório. Os testes usam bancos próprios e não alteram os dados desse ambiente.

## Variáveis

| Variável                                      | Uso                                                                                                 |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                | Conexão PostgreSQL Neon com TLS em produção                                                         |
| `DATABASE_MODE`                               | `local` somente no desenvolvimento; omitir na produção                                              |
| `LOCAL_DATABASE_PATH`                         | Diretório PGlite local; padrão `.data/vieira`                                                       |
| `AUTH_SECRET`                                 | Chave de pelo menos 32 caracteres para identificadores protegidos e prevenção de abuso              |
| `APP_URL`                                     | Origem exata autorizada a enviar formulários e mutações                                             |
| `NEXT_PUBLIC_SITE_URL`                        | Origem pública para canonical, OG e sitemap; prevalece sobre a configuração do painel               |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Bootstrap; sem senha fixa no código                                                                 |
| `TRUST_PROXY`                                 | `1` apenas se seu proxy sobrescrever `X-Forwarded-For`; na Vercel o cabeçalho confiável é detectado |
| `OBJECT_STORAGE_*`                            | Reservadas para um adaptador de armazenamento externo                                               |

WhatsApp, e-mail, redes, IDs de analytics, conteúdo e faixas de investimento são configurados no painel. Sem número de WhatsApp, o pedido ainda é salvo e a confirmação aparece sem um link fictício.

## Banco e migrações

```powershell
npm run db:generate    # gera uma nova migração a partir do schema
npm run db:migrate     # aplica SQL pendente, com checksum e transação
npm run db:seed        # serviços/textos reais da empresa; preserva dados existentes
npm run db:seed:admin  # cria o administrador definido no ambiente
npm run db:seed:case   # opcional: case do próprio projeto, identificado como demonstração técnica
```

As migrações não são executadas automaticamente no build. Aplique-as uma vez por ambiente antes de liberar a versão. Não altere arquivos de migração já aplicados. `db:push` é uma ferramenta de desenvolvimento contra o banco configurado; use migrações versionadas no deploy.

O seed nunca cria contatos, clientes ou métricas fictícios. O case opcional descreve funcionalidades deste projeto, sem resultados comerciais inventados.

## Testes e qualidade

```powershell
npm run lint
npm run typecheck
npm run test:db
npx playwright install chromium
npm test
npm run build
```

Para conferir PWA e headers de uma versão compilada, inicie `npm run start -- --hostname 127.0.0.1 --port 3200` em outro terminal e execute `npm run test:production`. O endereço pode ser alterado com `PREVIEW_URL`. Esse smoke test é somente de leitura e registra o resultado em `.review/production.json`.

Playwright inicia um servidor isolado em `127.0.0.1:3100`, gera credenciais temporárias e usa `.next-test` e um banco em `.data/e2e-*`. Não precisa do Neon nem do servidor da porta 3000. Os dados de teste são sintéticos e as chamadas de WhatsApp/analytics nos testes são interceptadas; nenhuma mensagem é enviada.

O servidor dos testes usa Webpack para evitar uma falha interna observada no Turbopack de desenvolvimento no Windows. O build de produção usa Turbopack e possui uma verificação independente de PWA e headers.

Cobertura: páginas públicas, SEO, menu e foco mobile, temas, 320–2560 px, wizard, validações, persistência, UTMs, idempotência, WhatsApp, consentimento de analytics, autenticação, RBAC, revogação de sessões, CRUD, CMS, configurações, auditoria, acessibilidade automatizada e erros. Relatórios ficam em `playwright-report/` e `test-results/`.

`npm run test:db` valida migrações/seed idempotentes, transações, rollback, eventos, CSRF, URLs, rate limit e auditoria no PostgreSQL local. Os testes não substituem uma homologação final do domínio e das credenciais de produção.

## Publicar

Veja [o guia de deploy](docs/DEPLOY.md). A aplicação está preparada para GitHub e Vercel, mas contas remotas, domínio e banco Neon exigem configuração do responsável. Não há credenciais de terceiros incluídas no repositório.

## Ambiente de produção

- Site: [vieira-systems.vercel.app](https://vieira-systems.vercel.app)
- Administração: [acesso ao painel](https://vieira-systems.vercel.app/admin/login)
- Código: [VieiraC18/vieira](https://github.com/VieiraC18/vieira)
- Contato: **+55 31 99499-4744** e **vieirasystems@gmail.com**.

Vercel e PostgreSQL Neon usam a região de São Paulo. As credenciais administrativas de produção são diferentes das locais e ficam somente no arquivo ignorado `.env.production.local` deste workspace. Consulte [a configuração de produção](docs/PRODUCTION.md) para operação e publicação de alterações.

## Documentação

- [Arquitetura e segurança](docs/ARCHITECTURE.md)
- [Design system e motion](docs/DESIGN_SYSTEM.md)
- [Deploy e operação](docs/DEPLOY.md)
- [Revisão e evidências](docs/REVIEW.md)

## Limites intencionais

- O painel trabalha com URLs de imagens. Há uma interface para object storage; o upload binário requer um adaptador e credenciais antes de ser habilitado.
- Nenhum serviço de e-mail é necessário para registrar leads. A comunicação usa os contatos recebidos e o WhatsApp configurado.
- O PWA oferece instalação e orientação offline. Formulários e administração exigem conexão; dados privados nunca entram no cache do service worker.
- Retenção de leads é administrada pela empresa; não há exclusão automática por prazo. Preencha os contatos oficiais antes da publicação e revise os textos jurídicos conforme a operação real.
