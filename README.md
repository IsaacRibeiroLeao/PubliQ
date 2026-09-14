# ContentOS

SaaS multi-tenant de marketing de conteúdo para criadores, negócios e marcas pessoais. O backend vive **somente no ecossistema Supabase** (Postgres + RLS, Auth, Edge Functions, Storage, `pg_cron` e `pg_net`). O frontend é Next.js App Router.

## O que está pronto

- Chat copiloto estilo Gemini, com quick pills e cartões ricos (ética, roteiro em 3 atos, legendas IG/TikTok, ações em 1 clique).
- Teleprompter com velocidade configurável.
- Calendário editorial, estúdio de upload e fila de auto-post.
- Quota Starter de **3 prompts/dia**, reset à meia-noite no fuso do perfil (`America/Sao_Paulo` por padrão), bloqueio de geração em lote no plano gratuito.
- Planos Starter / Pro / Agency, checkout Stripe/Asaas via Edge Function e webhook.
- Tokens de Meta/TikTok no schema `private` (o cliente nunca lê `access_token`).
- Publicação agendada e sync de métricas via `pg_cron` → `pg_net` → Edge Functions.

## Stack

| Camada | Tecnologia |
| --- | --- |
| App | Next.js 16 (App Router), Tailwind CSS 4, Radix/Shadcn, Lucide |
| Auth | Supabase Auth (e-mail + Google) |
| Dados | Supabase Postgres, RLS em 100% das tabelas públicas |
| Jobs | `pg_cron` + `pg_net` |
| Mídia | Buckets `media-raw` (privado) e `media-public` (URLs para as APIs) |
| IA / APIs | Edge Functions Deno |

## Setup local

Pré-requisitos: Docker Desktop, Node 22, Yarn.

```bash
cp .env.example .env.local
yarn
npx supabase start
```

Depois de `supabase start`, copie `API URL` e a **publishable/anon key** para `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon-or-publishable>
```

Opcional, para publicação automática a partir do cron:

```sql
insert into private.app_settings (key, value) values
  ('functions_url', 'http://kong:8000/functions/v1'),
  ('service_role_key', '<service-role-jwt>')
on conflict (key) do update set value = excluded.value;
```

Suba o app e as funções:

```bash
npx supabase functions serve --env-file .env.local
yarn dev
```

Abra [http://127.0.0.1:3000](http://127.0.0.1:3000), crie uma conta Starter e use o copiloto.

### Google OAuth

1. Crie credenciais no Google Cloud (redirect `http://127.0.0.1:54321/auth/v1/callback`).
2. Defina `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
3. Em `supabase/config.toml`, `enabled = true` em `[auth.external.google]`.

### Modelo de IA

Sem `OPENAI_API_KEY`, a função `generate-content` usa um gerador local com filtro ético. Com a chave, passa a usar o modelo definido em `OPENAI_MODEL`.

## Rotas

| Rota | Função |
| --- | --- |
| `/` | Landing |
| `/login` | E-mail/senha e Google |
| `/chat` | Copiloto |
| `/calendar` | Calendário editorial |
| `/studio` | Upload e auto-post |
| `/analytics` | Métricas (Pro/Agency) |
| `/settings` | Perfil, redes e billing |
| `/pricing` | Planos |

## Edge Functions

| Função | Papel |
| --- | --- |
| `generate-content` | Consome crédito, aplica compliance, grava roteiros e mensagens |
| `queue-publish` | Sobe o vídeo público e enfileira `scheduled_posts` |
| `publish-scheduled` | Worker do cron: Reels (Meta Graph) e TikTok Direct Post |
| `sync-analytics` | Consolida métricas |
| `summarize-analytics` | Resumo executivo |
| `create-checkout` | Stripe / Asaas |
| `billing-webhook` | Atualiza `plan_tier` (JWT desligado; valida assinatura/token) |
| `connect-social` | Inicia OAuth oficial Meta/TikTok |

## Regras de negócio

- **Starter:** 3 créditos/dia, 1 dia de pauta por request, cópia manual, sem auto-post e sem dashboard.
- **Pro (R$ 97):** ilimitado, semana/mês, 1 IG + 1 TikTok, teleprompter, auto-post, analytics.
- **Agency (R$ 247):** até 5 contas por rede, PDF e suporte prioritário (flag no catálogo).

Créditos são atômicos (`FOR UPDATE`) na função `private.consume_prompt_credit_for`.

## Segurança (desvios conscientes do SQL original)

- Funções `SECURITY DEFINER` ficam no schema `private`.
- `auth.uid()` envolvido em `(select auth.uid())` nas policies.
- Tokens sociais fora da Data API pública.
- `plan_tier` não pode ser alterado pelo próprio usuário via RLS.
- `search_path` fixo em `''`.

## Scripts

```bash
yarn dev
yarn lint
yarn typecheck
yarn build
```
