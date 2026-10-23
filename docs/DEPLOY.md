# Deploy e operação

## GitHub

O projeto possui `.gitignore`, lockfile e workflow de qualidade. Revise o diff e crie o repositório na conta desejada. Inclua os arquivos de código e documentação; `.env.local`, bancos locais, traces e screenshots de testes são ignorados.

```powershell
git init -b main
git add .
git commit -m "Implementa plataforma VIEIRA SYSTEMS"
git remote add origin <URL_DO_REPOSITORIO>
git push -u origin main
```

O workflow não publica automaticamente. Ele executa lint, TypeScript, auditoria de dependências de produção, testes de banco, Playwright e build. Os testes não precisam de secrets de produção. Restrinja acesso a artefatos de diagnóstico e habilite proteção de branch antes de compartilhar o projeto com colaboradores.

## Neon

1. Crie um projeto PostgreSQL e uma branch separada para homologação.
2. Obtenha a connection string com TLS (`sslmode=require`). Use uma conexão apropriada ao driver HTTP Neon e mantenha as credenciais no ambiente servidor.
3. Configure `DATABASE_URL`; remova `DATABASE_MODE=local` nesse ambiente.
4. Execute `npm run db:migrate`, `npm run db:seed` e o bootstrap administrativo contra o banco correto.
5. Cadastre o case do próprio site com `npm run db:seed:case`, se desejar publicá-lo.

O projeto não copia automaticamente o banco `.data/vieira` para o Neon. Ele é um ambiente independente. Revise conteúdo e cadastros na homologação antes de publicar. Migrações aplicadas possuem checksum; uma alteração de estrutura deve gerar um novo arquivo SQL.

## Vercel

Importe o repositório como Next.js. Use Node.js 24 e os comandos definidos em `vercel.json` (`npm ci`, `npm run build`). A região configurada é São Paulo (`gru1`); alinhe a região do banco e do projeto conforme sua conta.

Configure separadamente para Preview e Production:

| Variável               | Valor                                                                 |
| ---------------------- | --------------------------------------------------------------------- |
| `DATABASE_URL`         | Credencial Neon do ambiente correspondente                            |
| `AUTH_SECRET`          | Segredo aleatório de pelo menos 32 caracteres, diferente por ambiente |
| `APP_URL`              | Origem HTTPS exata usada no navegador                                 |
| `NEXT_PUBLIC_SITE_URL` | Domínio público canônico HTTPS                                        |

Não configure `DATABASE_MODE=local` na Vercel. O PGlite é explicitamente desabilitado pelo código em produção. Não copie `.env.local` para GitHub ou arquivos públicos.

Para um preview temporário, use sua origem exata em `APP_URL`. A proteção de origem rejeita outros domínios. Na produção, configure o domínio principal e redirecione aliases para ele no painel da Vercel. Isso evita formulários abertos em domínios diferentes do autorizado.

Após cadastrar o primeiro administrador, remova `ADMIN_PASSWORD` do ambiente. O bootstrap pode ser executado localmente usando temporariamente as variáveis do banco remoto, sem adicionar a senha às configurações permanentes do deploy.

## Publicação e homologação

No painel da aplicação, configure o WhatsApp real com DDI, e-mail, redes e dados de SEO. Revise a política de privacidade para a identidade jurídica da empresa, os provedores contratados e os procedimentos reais de atendimento e retenção. Confirme o canal de solicitações sobre dados. Os textos não inventam CNPJ, equipe, endereço ou certificações.

Valide no domínio de homologação:

- Login, criação de lead, status e notas.
- WhatsApp correto após registro do pedido.
- Criação/publicação de um projeto e edição do CMS.
- Canonical, sitemap, OG, favicon e manifest.
- Cookie de produção `__Host-vieira_session` com `Secure` e `HttpOnly`.
- Nenhuma chamada de analytics antes do aceite.
- Instalação PWA por HTTPS e comportamento offline.

Promova o deployment validado. Preserve a versão anterior para rollback. Reverter o deployment não desfaz migrações de banco; mantenha migrações compatíveis com a versão anterior durante a transição.

## Dados e arquivos

Configure backups e restauração no provedor do banco. Defina quem pode excluir leads e o prazo de retenção da empresa. A auditoria registra ator, ação, entidade, data e metadados operacionais, sem copiar senhas ou conteúdos de notas.

As imagens do portfólio podem ser URLs HTTPS ou arquivos em `public/`. O código `lib/server/storage.ts` define um adaptador para object storage. Para habilitar uploads, implemente um provedor, configure `OBJECT_STORAGE_*`, valide conteúdo e adicione uma rota autenticada; o produto atual não exibe um botão de upload sem implementação.

## Diagnóstico

- **403 ao enviar:** confira `APP_URL`, origem do navegador e proxy.
- **503 ao enviar ou entrar:** confira banco e `AUTH_SECRET`.
- **Erro ao migrar:** confirme credenciais, branch e checksum. Não apague o registro de uma migração para forçar execução.
- **Sessão expirada:** faça login novamente; duração máxima de oito horas.
- **Rate limit local:** requisições sem proxy confiável compartilham o limite por endereço. Aguarde a janela ou use um banco isolado de testes.
- **Servidor local e script no mesmo PGlite:** pare o servidor antes do script.

Logs de API são reduzidos a tipo e código de erro. Procure o contexto no monitoramento do provedor sem adicionar dados pessoais aos logs.
