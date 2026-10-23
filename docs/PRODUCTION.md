# Produção — VIEIRA SYSTEMS

Configuração realizada em 23 de outubro de 2026.

| Recurso            | Configuração                                   |
| ------------------ | ---------------------------------------------- |
| Site               | https://vieira-systems.vercel.app              |
| Administração      | https://vieira-systems.vercel.app/admin/login  |
| Repositório        | https://github.com/VieiraC18/vieira            |
| Branch de produção | `main`                                         |
| Projeto Vercel     | `vieira-systems`                               |
| Projeto Neon       | `vieira-systems`                               |
| Região             | São Paulo: Vercel `gru1`, Neon `aws-sa-east-1` |
| Runtime            | Node.js 24, PostgreSQL 17                      |
| Contatos           | +55 31 99499-4744 · vieirasystems@gmail.com    |

O projeto Vercel é ligado ao repositório GitHub. A qualidade é verificada pelo workflow `Qualidade`; a integração Git da Vercel recebe alterações em `main`. Consulte os checks do commit e o estado do deployment antes de considerar uma atualização concluída.

## Variáveis e acesso

Vercel recebe `DATABASE_URL` com conexão pooled, `AUTH_SECRET`, `APP_URL`, `NEXT_PUBLIC_SITE_URL` e `TRUST_PROXY`. A origem de produção é `https://vieira-systems.vercel.app`. O painel mantém a própria autenticação; o site público não exige login na Vercel.

A senha administrativa não fica no GitHub nem nas variáveis permanentes da Vercel. O administrador inicial é criado por bootstrap local contra o banco remoto. As credenciais deste workspace estão no arquivo ignorado `.env.production.local`. O e-mail de acesso é `vieirasystems@gmail.com`. Use o painel de usuários para trocar a senha.

Para uma nova máquina, configure as credenciais por um canal privado. Não adicione o arquivo de produção ao Git nem o envie em issues, commits, screenshots ou relatórios públicos.

## Atualizações

1. Edite o código e execute as verificações apropriadas.
2. Se houver mudança de banco, gere e revise uma migração versionada. Use conexão direta na aplicação da migração e conexão pooled no runtime.
3. Envie o commit para `main`; acompanhe os checks do GitHub e o build da Vercel.
4. Confira o domínio público, os contatos, o formulário e o login administrativo.

Preview e desenvolvimento continuam ambientes separados. As variáveis de produção não são copiadas automaticamente para previews. Mudanças de domínio exigem atualizar `APP_URL`, `NEXT_PUBLIC_SITE_URL` e os aliases da Vercel.

O banco local PGlite fica em `.data/vieira`; o banco de produção é independente. O bootstrap de produção cadastra serviços, conteúdo e o case do próprio site como demonstração técnica. Clientes, depoimentos e resultados comerciais fictícios não são criados.

As imagens do portfólio aceitam URLs ou arquivos versionados em `public/`. Upload binário continua dependendo de um adaptador de armazenamento. Analytics só carrega quando IDs são configurados e há consentimento.
