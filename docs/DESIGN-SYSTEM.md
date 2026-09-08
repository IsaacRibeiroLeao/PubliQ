# PubliQ — Design System

**Versão:** 1.0 · **Status:** Fundação visual para o produto (web app)

---

## 1. Identidade

**Símbolo:** um quadro de mídia (a peça que a agência solta na esteira) com uma seta escapando do canto superior direito — a peça "sai" do quadro e vai ao ar. Representa literalmente o "Drop & Publish".

**Uso:**
- Ícone isolado: favicon, avatar, estados vazios.
- Lockup (ícone + wordmark "PubliQ" em Fraunces 700): cabeçalhos de produto, e-mails, portal de aprovação do cliente.
- Área de proteção mínima: altura do próprio ícone ao redor de toda a marca.
- Nunca: recolorir o ícone fora dos tokens `--signal`/`--ember`, girar, ou esticar fora da proporção 1:1.

---

## 2. Cor

| Token | Papel | Light | Dark |
|---|---|---|---|
| `--paper` | fundo da página | `#fafafa` | `#0a0a0d` |
| `--surface` | cartões, inputs | `#ffffff` | `#131316` |
| `--surface-inset` | fundos secundários (código, hover) | `#f4f4f5` | `#1c1c20` |
| `--border` | divisores, contornos | `#e4e4e7` | `#2a2a30` |
| `--ink` | texto primário | `#18181b` | `#fafafa` |
| `--ink-muted` | texto secundário | `#71717a` | `#a1a1aa` |
| `--signal` | ação primária, links, foco (automação/pipeline) | `#4338ca` | `#9b8cff` |
| `--on-signal` | texto e ícones sobre `--signal` | `#ffffff` | `#18181b` |
| `--ember` | destaque criativo, alertas de atenção (mídia/criação) | `#ea4f2d` | `#ff8a63` |
| `--success` | publicado, aprovado | `#15803d` | `#4ade80` |
| `--warning` | aguardando, expira em breve | `#b45309` | `#fbbf24` |
| `--critical` | falhou, bloqueado | `#b91c1c` | `#f87171` |

`--signal` (índigo) carrega a automação/pipeline; `--ember` (laranja-vermelho) carrega o lado criativo/mídia. Os dois nunca competem no mesmo elemento — `--signal` domina a interface, `--ember` aparece pontualmente (ícone, um estado de atenção, um destaque).

---

## 3. Tipografia

| Papel | Fonte | Peso | Uso |
|---|---|---|---|
| Display | Fraunces | 600–700 | Wordmark, títulos de hero, telas vazias |
| UI / corpo | Inter | 400–700 | Toda a interface do produto |
| Dados / código | JetBrains Mono | 400–600 | Tokens, IDs, valores tabulares, blocos de código |

Escala (base 16px, razão ~1.25): `13 / 14 / 16 / 20 / 25 / 31 / 39px`.

---

## 4. Espaçamento & raio

Escala de espaçamento: `4 · 8 · 12 · 16 · 24 · 32 · 48px`.

Raio: `6px` (controles pequenos: badge, input) · `10px` (cartões) · `999px` (pílulas de status).

---

## 5. Componentes-base

**Botões:** `primary` (fundo `--signal`, texto branco), `secondary` (borda `--border`, fundo `--surface`), `ghost` (sem borda, texto `--ink-muted`). Todos com foco visível (anel de 2px em `--signal`).

**Pílulas de status** (refletem os estados reais de `Generation`/`Schedule` no schema):
`Rascunho` (neutro) · `Em análise` (info) · `Aguardando aprovação` (warning) · `Aprovado` (success) · `Publicado` (success) · `Falhou` (critical).

**Cartão de criativo:** thumbnail 1:1, nome da marca, canal (feed/reels/stories), pílula de status — a unidade repetida na esteira Drop & Publish.

---

## 6. Voz

- Nomeie pelo que a pessoa reconhece: "Marca", não "Brand entity". "Publicar", não "Disparar workflow".
- Botão e confirmação usam o mesmo verbo: "Publicar" → toast "Publicado".
- O portal de aprovação fala com o cliente final da agência, não com quem opera o PubliQ — tom direto, sem jargão de marketing digital.
- Erros dizem o que falhou e o que fazer: "Não foi possível publicar no Instagram — reconecte a conta da marca."

---

## 7. Tokens (CSS)

```css
:root {
  --paper: #fafafa;
  --surface: #ffffff;
  --surface-inset: #f4f4f5;
  --border: #e4e4e7;
  --ink: #18181b;
  --ink-muted: #71717a;
  --signal: #4338ca;
  --on-signal: #ffffff;
  --signal-soft: #eef2ff;
  --ember: #ea4f2d;
  --ember-soft: #fff1ec;
  --success: #15803d; --success-soft: #dcfce7;
  --warning: #b45309; --warning-soft: #fef3c7;
  --critical: #b91c1c; --critical-soft: #fee2e2;
  --radius-sm: 6px; --radius-md: 10px; --radius-full: 999px;
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 48px;
}
```
