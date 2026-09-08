# Task 2 Report — Authentication, data, RBAC and RLS

## Status

Completed. Authentication/session boundaries, workspace RBAC, typed Supabase clients, the complete MVP PostgreSQL model, RLS, private storage, deterministic fixtures, and verification are implemented.

## Files

- Dependencies and documentation: `package.json`, `pnpm-lock.yaml`, `README.md`
- Supabase clients: `src/integrations/supabase/config.ts`, `client.ts`, `server.ts`
- Authentication: `src/modules/auth/actions.ts`, `authorization.ts`, `redirect.ts`, `session.ts`
- App Router boundaries: `src/app/auth/callback/route.ts`, `src/middleware.ts`
- Shared contracts: `src/shared/domain.ts`, `database.types.ts`, `demo-fixtures.ts`
- Demo repository: `src/modules/domain/domain-fixture-repository.ts`
- Tests: `src/modules/auth/authorization.test.ts`, `redirect.test.ts`, `session.test.ts`
- Supabase local project: `supabase/config.toml`, `supabase/.gitignore`
- Database: `supabase/migrations/20260908190000_create_mvp_schema.sql`, `20260908190100_add_tenant_rls_and_storage.sql`
- Seed and database tests: `supabase/seed.sql`, `supabase/tests/database/rls.test.sql`

## Red/green evidence

RED:

- `pnpm test src/modules/auth/authorization.test.ts src/modules/auth/redirect.test.ts src/modules/auth/session.test.ts`
- Result: 3 suites failed because the new authorization, redirect, and session modules did not exist.

GREEN:

- The same focused command passed 3 files and 12 tests after implementation.
- Full `pnpm test` passed 5 files and 18 tests.
- Database pgTAP passed 3 checks: workspace isolation, brand isolation, and RLS enabled on all 18 public MVP tables.

## Commands and results

- `pnpm add @supabase/supabase-js@^2.116.0 @supabase/ssr@^0.12.7 zod@^4.5.4` — passed.
- `pnpm typecheck` — passed.
- `pnpm lint` — passed.
- `pnpm test` — passed, 18/18 tests.
- `pnpm build` — passed; `/auth/callback` and middleware included in the production build.
- `pnpm dlx supabase@latest db reset --local` — passed; both migrations and seed applied.
- `pnpm dlx supabase@latest test db --local supabase/tests/database/rls.test.sql` — passed, 3/3 checks.
- `pnpm dlx supabase@latest db advisors --local --type all --level warn --fail-on warn` — passed, no issues found.

## Concerns

- The migrations were validated against the local Supabase PostgreSQL 17 stack but were not applied to or tested against a linked remote project.
- `src/shared/database.types.ts` is checked in and typed, but it should be regenerated from the deployed Supabase schema whenever future migrations change the database contract.

## Round 1 fixes

### Completed findings

- Workspace membership transitions now have both RLS policy checks and a private `BEFORE` trigger. `ADMIN` may manage only non-`OWNER` memberships; it cannot insert an `OWNER`, modify or delete an existing `OWNER`, or promote itself/another member. `OWNER` retains management authority, initial self-`OWNER` bootstrap remains available, membership identity columns are immutable, and the final `OWNER` cannot be removed or demoted.
- `src/shared/database.types.ts` is now emitted by `supabase gen types typescript --local`. Inserts preserve database-required fields, no table shape has an arbitrary string index, `payment_transactions` contains required `workspace_id` in `Row` and `Insert`, and `meta_connection_summaries` is present under `Views`.
- pgTAP now exercises role writes, `ADMIN` escalation, owner management/bootstrap, cross-tenant read/insert/update/delete isolation, storage workspace prefixes and malformed paths, storage update/delete isolation, and RLS enablement across all 18 public MVP tables.

### Red/green evidence

RED:

- `pnpm dlx supabase@latest test db --local supabase/tests/database/rls.test.sql` against the pre-fix policies reported failures for `ADMIN cannot insert an OWNER membership` and `ADMIN cannot promote a lower membership to OWNER`.
- After the initial policy hardening, the added final-owner regression reported `Failed test 4: "the last OWNER membership cannot be deleted"` and `Failed 1/25 subtests`.

GREEN:

- `pnpm dlx supabase@latest db reset --local` applied both migrations and the seed successfully.
- `pnpm dlx supabase@latest test db --local supabase/tests/database/rls.test.sql` passed all 25 database security tests.
- `pnpm dlx supabase@latest db advisors --local --type all --level warn --fail-on warn` returned `No issues found`.
- `pnpm dlx supabase@latest gen types typescript --local > src/shared/database.types.ts` completed successfully; the CLI emitted a non-fatal Node `MaxListenersExceededWarning`.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `pnpm test` passed 5 files and 18 tests.
- `pnpm build` completed successfully with the callback route and middleware in the production output.

### Remaining concerns

- Round 1 remains validated only against the local Supabase PostgreSQL 17 stack; no linked remote project was changed.
- Regenerate `src/shared/database.types.ts` from the deployed schema after every future migration. The local generator warning did not affect its exit status or the subsequent typecheck/build.

## Round 2 fixes

### Completed finding

- Every transition that changes the OWNER set now obtains `pg_advisory_xact_lock(hashtextextended(workspace_id::text, 0))` before authorization and invariant checks. OWNER insertion, promotion, demotion, and deletion therefore serialize per workspace until transaction end.
- The final-OWNER count is evaluated only after the workspace lock is acquired. Privileged database paths also pass through the lock and invariant; only membership cascades for an already-deleted workspace bypass the final-OWNER requirement.
- The database suite opens a second authenticated PostgreSQL session through `dblink`. After an OWNER transition, that session proves the same workspace lock is unavailable while an unrelated workspace lock remains available. This complements the existing test that rejects deletion of the final OWNER.

### Red/green evidence

RED:

- `pnpm dlx supabase@latest test db --local supabase/tests/database/rls.test.sql` against the pre-lock trigger reported `Failed test 25: "OWNER transition holds the workspace advisory lock until transaction end"`, with `have: true`, `want: false`, and `Failed 1/27 subtests`.

GREEN:

- `pnpm dlx supabase@latest db reset --local` applied both migrations and the seed successfully.
- `pnpm dlx supabase@latest test db --local supabase/tests/database/rls.test.sql` passed all 27 database tests.
- `pnpm dlx supabase@latest db advisors --local --type all --level warn --fail-on warn` returned `No issues found`.
- `pnpm typecheck` passed.
- `pnpm lint` passed.
- `pnpm test` passed 5 files and 18 tests.
- `pnpm build` completed successfully with the callback route and middleware in the production output.

### Remaining concerns

- Round 2 was validated against local Supabase PostgreSQL 17 only; no linked remote project was changed.
- The 64-bit workspace lock key is derived with PostgreSQL `hashtextextended`. A theoretical hash collision can serialize unrelated workspaces, but cannot weaken the owner-presence invariant.
