# Task 4 Report — Brands, Brand Voice and Meta connection

## Status

Implemented. No commit was created.

## Completed areas

- Added `/app/marcas`, `/app/marcas/nova` and `/app/marcas/[brandId]`, including loading, empty, error and read-only states.
- Added the accessible `BrandForm` and a shared Zod contract for identity, persona, audience, tone, examples and forbidden words.
- Added `BrandRepository` with deterministic mutable mock storage and authenticated Supabase/RLS adapter boundaries.
- Added a brand service that validates writes, enforces `OWNER`/`ADMIN`/`EDITOR`, keeps `VIEWER` read-only and checks the subscription brand limit server-side.
- Added profile completeness, recent creative summaries and Meta connection status to brand detail.
- Added `MetaProvider`, mock and Graph API adapters, one-use OAuth state, sanitized callback failures and page/Instagram/ad-account selection.
- Added Redis-backed real-mode OAuth/selection state. The access token is encrypted before temporary Redis storage and before Supabase persistence, and is never rendered into client state.
- Added an AES-256-GCM `EncryptionService` boundary with key version, IV and authentication tag.
- Updated navigation, context header, dashboard links, `.env.example` and `README.md`; all visible primary navigation now targets implemented routes.

## Files

### Added

- `src/components/BrandForm.tsx`
- `src/components/BrandForm.test.tsx`
- `src/modules/brands/actions.ts`
- `src/modules/brands/repository.ts`
- `src/modules/brands/schemas.ts`
- `src/modules/brands/schemas.test.ts`
- `src/modules/brands/service.ts`
- `src/modules/brands/service.test.ts`
- `src/modules/meta/actions.ts`
- `src/modules/meta/encryption.ts`
- `src/modules/meta/oauth.ts`
- `src/modules/meta/oauth.test.ts`
- `src/modules/meta/provider.ts`
- `src/modules/meta/repository.ts`
- `src/modules/meta/selection-store.ts`
- `src/modules/meta/service.ts`
- `src/modules/meta/service.test.ts`
- `src/modules/meta/upstash.ts`
- `src/app/app/marcas/page.tsx`
- `src/app/app/marcas/nova/page.tsx`
- `src/app/app/marcas/[brandId]/page.tsx`
- `src/app/app/marcas/loading.tsx`
- `src/app/app/marcas/error.tsx`
- `src/app/app/meta/callback/route.ts`
- `src/app/app/meta/selecionar/page.tsx`

### Updated

- `.env.example`
- `README.md`
- `src/components/AppNavigation.tsx`
- `src/components/ContextHeader.tsx`
- `src/components/Dashboard.tsx`
- `src/components/design-system.test.tsx`

## TDD evidence

### Red

`pnpm test src/modules/brands/schemas.test.ts src/modules/brands/service.test.ts src/modules/meta/oauth.test.ts src/components/BrandForm.test.tsx`

- Failed in four suites because the new schemas, services, OAuth contract and form did not exist.

`pnpm test src/modules/meta/service.test.ts`

- Failed because the Meta connection service did not exist.

### Green

Focused brand and Meta suite:

- 5 files passed.
- 11 tests passed.

Full suite:

- 13 files passed.
- 42 tests passed.

Covered validation and normalization, plan limit, write-role authorization, profile completeness, one-use OAuth state, safe redirects, sanitized errors, encrypted token persistence, VIEWER denial and form submission.

## Verification

- `pnpm lint` — passed, no errors or warnings.
- `pnpm test` — passed, 13 files and 42 tests.
- `pnpm build` — passed; all brand and Meta routes were emitted.
- `pnpm typecheck` — passed after the production build regenerated Next route types.
- IDE diagnostics — no errors.

The build and typecheck were rerun sequentially after a parallel run caused `.next/types` and the Next ESLint cache to race.

## Concerns

- Real-mode Supabase, Upstash and Meta calls were not exercised because no live credentials or services were available.
- `META_GRAPH_VERSION` defaults to `v23.0`; deployments should pin the version approved for their Meta app.
- AES-256-GCM is implemented, but production key rotation, managed key custody and envelope-encryption hardening remain appropriate for Task 8.
- Mock brand and OAuth stores are process-local by design and reset when the development process restarts; real OAuth state uses Upstash Redis.
