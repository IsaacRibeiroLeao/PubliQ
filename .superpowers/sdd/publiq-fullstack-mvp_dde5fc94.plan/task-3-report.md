# Task 3 — Relatório de implementação

## Status

Concluída. O design system, o shell autenticado, o dashboard e as rotas visuais
de autenticação/onboarding foram implementados preservando os contratos da Task
2.

## Áreas entregues

- Primitivos em `src/components`: `Button`, `Badge`, `Input`, `Textarea`,
  `Select`, `Progress`, `Avatar`, `EmptyState`, `ErrorState` e `LoadingState`.
- Shell responsivo: `AppShell`, `AppNavigation`, `WorkspaceSwitcher` e
  `ContextHeader`, com sidebar desktop e navegação móvel.
- Dashboard `/app` em português, consumindo `getCurrentSession`,
  `DEMO_USER`, `DEMO_WORKSPACE`, `DEMO_BRAND` e tipos compartilhados.
- Esteira visual Upload → Análise → Aprovação → Publicação, cota mensal,
  criativos recentes, atividade e alertas.
- Rotas `/login` e `/onboarding` conectadas às actions e fronteiras de sessão
  da Task 2; em modo mock não há alegações de segurança simulada.
- Metadata por rota, página 404 e tratamento global de erro.
- Dependência `lucide-react` adicionada para iconografia.
- README atualizado com rotas e APIs visuais.

## Arquivos

Criados:

- `src/app/app/layout.tsx`
- `src/app/app/page.tsx`
- `src/app/login/page.tsx`
- `src/app/onboarding/page.tsx`
- `src/app/not-found.tsx`
- `src/app/error.tsx`
- `src/components/AppNavigation.tsx`
- `src/components/AppShell.tsx`
- `src/components/Avatar.tsx`
- `src/components/Badge.tsx`
- `src/components/Button.tsx`
- `src/components/ContextHeader.tsx`
- `src/components/CreativeCard.tsx`
- `src/components/Dashboard.tsx`
- `src/components/EmptyState.tsx`
- `src/components/ErrorState.tsx`
- `src/components/Input.tsx`
- `src/components/LoadingState.tsx`
- `src/components/LoginForm.tsx`
- `src/components/Progress.tsx`
- `src/components/Select.tsx`
- `src/components/Textarea.tsx`
- `src/components/WorkspaceSwitcher.tsx`
- `src/components/Dashboard.test.tsx`
- `src/components/design-system.test.tsx`

Alterados:

- `src/test/setup.ts`
- `README.md`
- `package.json`
- `pnpm-lock.yaml`

## Evidência TDD

RED:

- `pnpm test -- src/components/design-system.test.tsx` falhou com import
  inexistente de `AppNavigation`, confirmando ausência dos novos primitivos.
- `pnpm exec vitest run src/components/Dashboard.test.tsx` falhou com import
  inexistente de `Dashboard`, confirmando ausência da nova experiência.

GREEN:

- `pnpm exec vitest run src/components/Dashboard.test.tsx
  src/components/design-system.test.tsx` passou com 9 testes.
- Os testes cobrem estado de navegação, semântica de status, limite e
  acessibilidade do progresso, descrição/erro acessível de input, quatro
  etapas da esteira e cota mensal.

## Verificação

- `pnpm typecheck` — passou.
- `pnpm lint` — passou sem erros.
- `pnpm test` — 7 arquivos e 27 testes passaram.
- `pnpm build` — passou; `/app`, `/login`, `/onboarding` e `/_not-found`
  foram geradas.

## Preocupações

- O build emite apenas avisos de desempenho do cache do webpack ao serializar
  strings grandes; não houve erro de compilação.
- Tasks 4–8 ainda precisarão criar as rotas secundárias já expostas pela
  navegação.
- O formulário de onboarding é visual nesta task; persistência da marca fica
  para a etapa funcional correspondente.

## Round 1

### Correções

- Adicionado `--on-signal` (`#ffffff` no tema claro e `#18181b` no escuro) e
  aplicado a todo texto ou ícone sobre `--signal`. Contrastes medidos:
  `7.90:1` no tema claro e `6.40:1` no escuro.
- `/login` agora recebe, normaliza e valida `redirectTo` com
  `getSafeRedirectPath` antes de repassá-lo ao `LoginForm`; o retorno de
  `/onboarding` funciona sem aceitar destinos externos.
- `AppNavigation` deriva o item ativo de `usePathname`, incluindo subrotas.
- `ContextHeader` recebe `contextLabel` explicitamente via `AppShell`.
- `Input`, `Textarea` e `Select` geram IDs estáveis com `useId` quando `id` e
  `name` não são informados.
- `docs/DESIGN-SYSTEM.md` atualizado com o novo token semântico.

### Evidência TDD

RED:

- Os testes direcionados falharam mostrando: `/app` ativo numa subrota de
  criativos, labels sem controles associados, contexto fixo `Café Aurora` e
  ausência do retorno `/onboarding` no formulário.

GREEN:

- `pnpm exec vitest run src/components/design-system.test.tsx
  src/app/login/page.test.tsx` — 11 testes passaram.
- `pnpm test` — 8 arquivos e 31 testes passaram.

### Verificação

- `pnpm typecheck` — passou.
- `pnpm lint` — passou sem erros.
- `pnpm test` — 31 testes passaram.
- `pnpm build` — passou.
