# PubliQ (ContentOS)

SaaS multi-tenant de marketing de conteúdo para criadores, negócios e marcas pessoais. O backend vive **somente no ecossistema Supabase** (Postgres + RLS, Auth, Edge Functions, Storage, `pg_cron` e `pg_net`). O frontend é Next.js App Router.

## Funcionalidades

- Chat copiloto estilo Gemini, com quick pills e cartões ricos (ética, roteiro em 3 atos, legendas IG/TikTok, ações em 1 clique).
- Teleprompter com velocidade configurável.
- Calendário editorial, estúdio de upload e fila de auto-post.
- Quota Starter de **3 prompts/dia**, reset à meia-noite no fuso do perfil (`America/Sao_Paulo` por padrão), bloqueio de geração em lote no plano gratuito.
- Planos Starter / Pro / Agency, checkout Stripe/Asaas via Edge Function e webhook.
- Tokens de Meta/TikTok no schema `private` (o cliente nunca lê `access_token`).
- Publicação agendada e sync de métricas via `pg_cron` → `pg_net` → Edge Functions.

## Tecnologias (Stack)

| Camada | Tecnologia |
| --- | --- |
| App | Next.js 16 (App Router), Tailwind CSS 4, Radix/Shadcn, Lucide, React 19, TypeScript |
| Auth | Supabase Auth (e-mail + Google) |
| Dados | Supabase Postgres, RLS em 100% das tabelas públicas |
| Jobs | `pg_cron` + `pg_net` |
| Mídia | Buckets `media-raw` (privado) e `media-public` (URLs para as APIs) |
| IA / APIs | Edge Functions Deno |

## Instalação e Setup Local

Pré-requisitos: Docker Desktop, Node 22, Yarn.

1. Clone o repositório e configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

2. Instale as dependências e inicie o Supabase localmente:
```bash
yarn
npx supabase start
```

3. Depois de `supabase start`, copie a `API URL` e a **publishable/anon key** para o seu `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon-or-publishable>
```

4. Opcional, para publicação automática a partir do cron, execute no banco:
```sql
insert into private.app_settings (key, value) values
  ('functions_url', 'http://kong:8000/functions/v1'),
  ('service_role_key', '<service-role-jwt>')
on conflict (key) do update set value = excluded.value;
```

5. Suba as Edge Functions e o servidor de desenvolvimento:
```bash
npx supabase functions serve --env-file .env.local
yarn dev
```

### Google OAuth

1. Crie credenciais no Google Cloud (redirect `http://127.0.0.1:54321/auth/v1/callback`).
2. Defina `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
3. Em `supabase/config.toml`, defina `enabled = true` em `[auth.external.google]`.

### Modelo de IA

Sem `OPENAI_API_KEY`, a função `generate-content` usa um gerador local com filtro ético. Com a chave, passa a usar o modelo definido em `OPENAI_MODEL`.

## Uso (Rotas)

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

### Edge Functions Disponíveis

- `generate-content`: Consome crédito, aplica compliance, grava roteiros e mensagens.
- `queue-publish`: Gerencia a fila de publicação de vídeos públicos.
- `publish-scheduled`: Realiza a publicação agendada.
- `create-checkout`: Cria sessões de pagamento.
- `billing-webhook`: Processa webhooks de cobrança.
- `connect-social`: Integração com contas sociais.
- `summarize-analytics` e `sync-analytics`: Sincronização e resumo de métricas.

## Licença

Licença não especificada / Uso restrito.
