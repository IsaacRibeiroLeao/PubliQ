# PubliQ

Hub de automação visual-para-publicação (SaaS B2B) para agências de marketing. Este repositório contém o monólito modular Next.js do MVP PubliQ.

Documentação de produto e design:

- [`docs/PRD-System-Design.md`](docs/PRD-System-Design.md) — PRD e system design
- [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) — tokens, tipografia e componentes-base

## Pré-requisitos

- Node.js 20+
- [pnpm](https://pnpm.io/) 9+

## Instalação

```bash
pnpm install
cp .env.example .env
```

## Modo mock vs real

O PubliQ roda **sem credenciais** em modo mock (padrão). Copie `.env.example` para `.env` e mantenha:

```env
NEXT_PUBLIC_INTEGRATION_MODE=mock
```

Servidor e cliente usam `getIntegrationMode()` (`src/shared/integration-mode.ts`), que lê essa única variável. Não há configuração duplicada de modo.

Nesse modo:

- A aplicação inicia normalmente com fixtures determinísticas.
- Integrações externas (Supabase, Gemini, Mercado Pago, Upstash, Meta) não são chamadas.
- Ideal para desenvolvimento local, testes e demos.
- `/login`, `/onboarding`, `/app` e `/app/marcas` podem ser percorridos sem
  credenciais externas.

Para conectar serviços reais, defina `NEXT_PUBLIC_INTEGRATION_MODE=real` e preencha as variáveis de credenciais no `.env`. Nunca commite segredos.

## Autenticação, dados e autorização

O App Router usa clientes Supabase tipados separados para navegador e servidor. Sessões reais são validadas no servidor pelo Supabase Auth; no modo mock, `getCurrentSession()` retorna sempre o usuário e workspace de demonstração exportados por `src/shared/demo-fixtures.ts`.

As fronteiras server-side estão em `src/modules/auth`:

- `getCurrentSession()` e `requireSession()` resolvem a identidade atual.
- `requireWorkspaceAccess(workspaceId, roles?)` consulta a membership autoritativa e aplica RBAC.
- `login()` e `logout()` mantêm os cookies SSR, e o callback `/auth/callback` aceita apenas redirects locais.

O modelo PostgreSQL, RLS e o bucket privado `media` ficam em `supabase/migrations`. Para validar e recriar o banco local:

```bash
pnpm dlx supabase@latest start
pnpm dlx supabase@latest db reset --local
pnpm dlx supabase@latest test db --local supabase/tests/database/rls.test.sql
```

O reset carrega `supabase/seed.sql`. A senha do usuário local `demo@publiq.local` é `publiq-demo-2026`; essa credencial existe somente no seed de desenvolvimento.

## Interface do produto

O design system implementa os tokens documentados em `docs/DESIGN-SYSTEM.md` e
expõe componentes reutilizáveis em `src/components`: controles de formulário,
botões, badges semânticos, progresso, avatar e tratamentos de estado.

A área autenticada em `/app` usa o shell responsivo com navegação lateral e
móvel. O dashboard demonstra a esteira Upload → Análise → Aprovação →
Publicação, cota mensal, criativos recentes e alertas usando as fixtures
compartilhadas.

O módulo de marcas expõe listagem, criação e detalhe em `/app/marcas`. O perfil
compartilha um contrato Zod entre formulário e servidor, aplica limite do plano
e RBAC, e usa repository Supabase com RLS no modo real. A conexão Meta começa no
detalhe da marca, valida `state` OAuth de uso único, mantém o token no servidor e
persiste somente sua forma criptografada após a seleção de ativos. Configure
`META_APP_ID`, `META_APP_SECRET`, `META_GRAPH_VERSION` e
`META_TOKEN_ENCRYPTION_KEY` para usar o adapter real.

## Scripts

| Comando | Descrição |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento (Turbopack) |
| `pnpm build` | Build de produção |
| `pnpm start` | Servidor de produção |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Verificação TypeScript |
| `pnpm test` | Testes unitários (Vitest) |
| `pnpm test:watch` | Vitest em modo watch |
| `pnpm test:e2e` | Testes E2E (Playwright) |

## Estrutura

```
src/
  app/           # App Router (rotas e layouts)
  components/    # Componentes React (um por arquivo)
  hooks/         # Custom hooks
  utils/         # Utilitários puros
  modules/       # Domínio (services, repositories)
  shared/        # Contratos Zod e tipos compartilhados
  integrations/  # Adapters externos (Supabase, Gemini, Meta, etc.)
```

## Verificação local

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e   # requer browsers Playwright instalados
```

Para instalar os browsers do Playwright pela primeira vez:

```bash
pnpm exec playwright install chromium
```
