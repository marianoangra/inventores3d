# Lab Inventores 3D — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Área logada grátis `/lab` em inventores3d.com.br com calculadora de preço, oficina, peças, vendas, despesas e resultados para iniciantes em impressão 3D, sem alterar a loja.

**Architecture:** Mesmo app Next.js. A loja vai para o route group `src/app/(loja)/` (URLs inalteradas) com o layout atual (Header/Footer/Cart); o Lab vive em `src/app/lab/` com layout próprio. Supabase dá Auth (Google + código por e-mail) e Postgres com RLS por `user_id`. Toda a matemática fica em funções puras testadas (`src/lib/lab/pricing.ts`, `results.ts`).

**Tech Stack:** Next.js 15.5 (App Router, Server Actions), React 19, Tailwind 4, `@supabase/supabase-js` + `@supabase/ssr`, Vitest, `pg` (só no script de migração).

**Spec:** `docs/superpowers/specs/2026-11-18-lab-area-logada-design.md`

## Global Constraints

- A loja (`/`, `/produtos`, `/produto/*`, `/checkout`, `/sobre`) fica idêntica: mesmo HTML/visual. Única adição: link "Lab" no Header e Footer, renderizado só se `process.env.NEXT_PUBLIC_LAB_PUBLICO === "1"`.
- Card/botão do grupo só aparece se `NEXT_PUBLIC_LAB_WHATSAPP_GROUP` estiver definido.
- Identidade da loja: tokens de `globals.css` (ink, brand #6d4aff, lime, coral, paper), fontes Bricolage (display) + Inter. Nada de tubarão/amarelo.
- Modo claro/escuro no Lab (toggle + `prefers-color-scheme`), só dentro de `/lab`.
- Toda tabela com RLS "dono lê/escreve" (`auth.uid() = user_id`). `SUPABASE_SERVICE_ROLE_KEY` só no servidor e só para excluir conta.
- Sem senha: login só Google ou código de 6 dígitos no e-mail.
- `/lab/*` com `robots: { index: false }`, exceto `/lab/entrar` e `/lab/privacidade`.
- Repo público: nenhum segredo no código; `.env.local` no `.gitignore` (já está via `.env*`).
- Textos em português do Brasil, linguagem de iniciante; valores em `brl()` de `src/lib/config.ts`.
- Mascote **Edy** (mini inventor: jaleco, lâmpada, bigode) — nunca escrever "Thomas Edison" na UI.
- Trabalho no branch `lab`; push em `main` publica produção (só na Task 12).

## Review Focus

1. Campos numéricos com vírgula ("1,5"), vazios ou zero (tempo de impressão 0, peso do rolo 0) — calculadora não pode mostrar NaN/Infinity; mostra "—" e pede o campo. → testes na Task 1.
2. Taxa percentual ≥ 100% ou taxa fixa maior que o preço — preço sugerido inválido deve virar aviso, não número negativo. → teste na Task 1.
3. Usuário A tentando ler/editar linha do usuário B (id na URL ou no form) — RLS bloqueia e a UI mostra 404. → script `scripts/rls-check.mjs` na Task 4.
4. Usuário logado que nunca terminou a boas-vindas acessando `/lab/vendas` direto — redireciona para boas-vindas. → teste manual + checagem no middleware na Task 5.
5. Mês sem vendas / venda de peça que foi excluída depois — resultados mostram zeros e a venda continua contando (descrição guardada na venda). → testes na Task 9.

---

### Task 1: Motor de preço (função pura) + Vitest

**Files:**
- Modify: `package.json` (devDependency `vitest`, script `"test": "vitest run"`)
- Create: `src/lib/lab/num.ts`, `src/lib/lab/fees.ts`, `src/lib/lab/pricing.ts`, `src/lib/lab/defaults.ts`
- Test: `src/lib/lab/pricing.test.ts`, `src/lib/lab/num.test.ts`

**Interfaces — Produces:**
- `parseNum(s: string | number | null | undefined): number | null` — aceita "1,5", "1.5", "R$ 2,00"; vazio/inválido → `null`.
- `type Channel = "direto" | "shopee" | "ml"`; `CHANNEL_LABEL: Record<Channel,string>` (`"Venda direta / Instagram"`, `"Shopee"`, `"Mercado Livre"`).
- `type FeeRule = { pct: number; fixed: (price: number) => number }`; `DEFAULT_FEES: Record<Channel, FeeRule>`; `FEES_CHECKED_AT: string` (data ISO da conferência).
- `type FeeOverride = Partial<Record<Channel, { pct?: number; fixed?: number }>>`; `resolveFees(o?: FeeOverride): Record<Channel, FeeRule>` (override fixo vira função constante).
- `type CostInput = { grams: number; printMinutes: number; laborMinutes: number; spoolPrice: number; spoolGrams: number; printerPrice: number; printerLifeHours: number; printerWatts: number; kwhPrice: number; laborHourly: number; lossPct: number; packaging: number }`
- `type CostBreakdown = { filament: number; energy: number; wear: number; loss: number; labor: number; packaging: number; total: number }`
- `computeCost(i: CostInput): CostBreakdown | { error: string }`
- `type ChannelQuote = { channel: Channel; price: number; fees: number; profit: number; profitPerMachineHour: number | null } | { channel: Channel; error: string }`
- `quote(cost: number, marginPct: number, printMinutes: number, fees: Record<Channel, FeeRule>): ChannelQuote[]`
- `quoteAtPrice(cost: number, price: number, printMinutes: number, rule: FeeRule, channel: Channel): ChannelQuote` (para venda com preço escolhido pelo usuário)
- `defaults.ts`: `PRINTER_MODELS: { id: string; label: string; price: number; watts: number }[]` com: a1mini "Bambu A1 mini" 1899/80, a1 "Bambu A1" 2999/95, p1s "Bambu P1S" 4999/130, x1c "Bambu X1C" 8999/150, x2d "Bambu X2D" 13999/200, k1 "Creality K1" 2799/150, ender3 "Creality Ender 3" 1199/120, elegoo "Elegoo (Neptune/Centauri)" 1499/120, outra "Outra" 2000/120; `DEFAULT_WORKSHOP = { kwhPrice: 0.95, laborHourly: 20, lossPct: 5, packaging: 2, printerLifeHours: 5000, marginPct: 80 }`; `DEFAULT_FILAMENT = { type: "PLA", color: "Branco", spoolPrice: 99.9, spoolGrams: 1000 }`.

Fórmulas (fixadas aqui):
```
filament = grams / spoolGrams * spoolPrice
energy   = printerWatts / 1000 * (printMinutes/60) * kwhPrice
wear     = printerPrice / printerLifeHours * (printMinutes/60)
loss     = (filament + energy + wear) * lossPct/100
labor    = laborMinutes/60 * laborHourly
total    = filament + energy + wear + loss + labor + packaging
alvo     = cost * (1 + marginPct/100)          // lucro desejado = alvo - cost
price P: menor P com P - pct*P - fixed(P) >= alvo; calcular P0 = (alvo + fixed(alvo)) / (1 - pct),
         recalcular com fixed(P0) até estabilizar (máx 5 iterações; faixas de taxa fixa mudam com o preço)
P final  = arredondar PARA CIMA para o próximo ",90" (ex.: 23,12 → 23,90; 23,95 → 24,90; 22,90 fica 22,90)
fees     = pct*P + fixed(P); profit = P - fees - cost
profitPerMachineHour = printMinutes > 0 ? profit / (printMinutes/60) : null
```
`computeCost` retorna `{ error }` se `spoolGrams <= 0`, `printerLifeHours <= 0` ou qualquer campo negativo/NaN. `quote` retorna `{ error: "Taxa do canal impossível" }` se `pct >= 1`.

Taxas padrão: conferir na implementação (busca web: "comissão Shopee 2026 vendedor", "tarifa Mercado Livre anúncio clássico 2026 custo fixo") e gravar `FEES_CHECKED_AT`. `direto` = `{ pct: 0, fixed: () => 0 }`.

- [ ] **Step 1: Instalar vitest e escrever testes**

`num.test.ts`: `parseNum("1,5") === 1.5`, `parseNum("R$ 2,00") === 2`, `parseNum("") === null`, `parseNum("abc") === null`, `parseNum(3) === 3`.

`pricing.test.ts`:
```ts
const base = { grams: 50, printMinutes: 120, laborMinutes: 6, spoolPrice: 100, spoolGrams: 1000,
  printerPrice: 3000, printerLifeHours: 5000, printerWatts: 100, kwhPrice: 1, laborHourly: 20, lossPct: 10, packaging: 2 };
test("custo detalhado", () => {
  const c = computeCost(base) as CostBreakdown;
  expect(c.filament).toBeCloseTo(5);      expect(c.energy).toBeCloseTo(0.2);
  expect(c.wear).toBeCloseTo(1.2);        expect(c.loss).toBeCloseTo(0.64);
  expect(c.labor).toBeCloseTo(2);         expect(c.total).toBeCloseTo(11.04);
});
test("peso do rolo zero vira erro", () => expect(computeCost({ ...base, spoolGrams: 0 })).toHaveProperty("error"));
test("venda direta: margem 100% → 22,08 arredonda 22,90", () => {
  const q = quote(11.04, 100, 120, resolveFees())[0];
  expect(q).toMatchObject({ channel: "direto", price: 22.9 });
  expect((q as any).profit).toBeCloseTo(11.86);
  expect((q as any).profitPerMachineHour).toBeCloseTo(5.93);
});
test("canal com taxa cobre a taxa", () => {
  const fees = resolveFees({ shopee: { pct: 0.2, fixed: 4 } });
  const q = quote(10, 50, 60, fees).find(x => x.channel === "shopee") as any;
  expect(q.price - q.fees - 10).toBeGreaterThanOrEqual(5);   // lucro ≥ alvo
  expect(q.price % 1).toBeCloseTo(0.9);
});
test("taxa ≥100% vira erro", () => {
  expect(quote(10, 50, 60, resolveFees({ ml: { pct: 1 } })).find(x => x.channel === "ml")).toHaveProperty("error");
});
test("tempo zero: lucro/hora null", () => expect((quote(10, 50, 0, resolveFees())[0] as any).profitPerMachineHour).toBeNull());
```

- [ ] **Step 2:** `npm test` → FAIL (módulos não existem).
- [ ] **Step 3:** Implementar `num.ts`, `fees.ts` (com taxas conferidas), `pricing.ts`, `defaults.ts`.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** `git checkout -b lab` (se ainda não) e commit `feat(lab): motor de preço com testes`.

---

### Task 2: Separar a loja num route group (URLs e visual inalterados)

**Files:**
- Move (git mv): `src/app/page.tsx`, `src/app/checkout/`, `src/app/produto/`, `src/app/produtos/`, `src/app/sobre/` → `src/app/(loja)/…`
- Create: `src/app/(loja)/layout.tsx` — contém `<CartProvider><Header/><main>{children}</main><Footer/><CartDrawer/><CartToast/><WhatsFloat/></CartProvider>` (cortado de `src/app/layout.tsx`)
- Modify: `src/app/layout.tsx` — fica só html/body/fontes/metadata/JSON-LD + `{children}`
- Ficam na raiz: `opengraph-image.tsx`, `robots.ts`, `sitemap.ts`, `favicon.ico`, `globals.css`

- [ ] **Step 1:** Antes de mexer, tirar screenshots (puppeteer-core do scratchpad, como no redesign) de `/`, `/produtos`, `/produto/<um slug de products.ts>`, `/checkout`, `/sobre` em 1280px e 390px com `npm run build && npm start`.
- [ ] **Step 2:** Mover arquivos e criar os dois layouts.
- [ ] **Step 3:** `npm run build` sem erro; mesmas rotas listadas na saída do build.
- [ ] **Step 4:** Screenshots de novo e comparar pixel a pixel (diferença 0 fora do marquee animado). Conferir `/opengraph-image` e `/sitemap.xml` respondendo 200.
- [ ] **Step 5:** Commit `refactor: loja em route group (loja) para o Lab ter layout próprio`.

---

### Task 3: Casca do Lab + calculadora funcionando sem login

Objetivo: `/lab/calculadora` já usável (estado local) antes do Supabase existir.

**Files:**
- Create: `src/app/lab/layout.tsx` (metadata `robots: { index: false }`, título template `"%s | Lab Inventores 3D"`), `src/components/lab/LabShell.tsx` (barra lateral desktop / barra inferior celular, toggle claro/escuro salvo em `localStorage` com try/catch, classe `dark` no wrapper do Lab), `src/components/lab/Edy.tsx` (SVG do mascote; props `size`, `mood: "oi" | "pensando" | "festa"`), `src/components/lab/Field.tsx` (input numérico com vírgula, prefixo/sufixo, usa `parseNum`), `src/app/lab/calculadora/page.tsx`, `src/components/lab/Calculator.tsx` (client)
- Modify: `src/app/globals.css` — `@custom-variant dark (&:where(.dark, .dark *));` e tokens escuros do Lab (`--lab-bg`, `--lab-card`, `--lab-text`) em `.lab` / `.lab.dark`

**Interfaces — Consumes:** Task 1 inteira. **Produces:** `LabShell({ children, user?: { name: string } | null })`; `Calculator({ workshop?: WorkshopSettings, printers?: Printer[], filaments?: Filament[], onSave?: (p: PartDraft) => Promise<void> })` — sem props usa `DEFAULT_WORKSHOP`/`PRINTER_MODELS[0]`/`DEFAULT_FILAMENT`; `onSave` ausente esconde o botão "Salvar como peça". (`WorkshopSettings`, `Printer`, `Filament`, `PartDraft` definidos em `src/lib/lab/types.ts` nesta task, espelhando as colunas da Task 4.)

Calculadora: campos gramas, tempo de impressão (h e min separados), trabalho manual (min), filamento, impressora, embalagem, margem (%); mostra custo detalhado (6 linhas + total), cartões por canal (preço sugerido, taxas, lucro, **lucro por hora de máquina** em destaque) e "Taxas conferidas em {FEES_CHECKED_AT}". Campo inválido → "—" e dica sob o campo.

- [ ] **Step 1:** Implementar shell, Edy, Field, Calculator.
- [ ] **Step 2:** `npm run dev`; abrir `/lab/calculadora` em 1280 e 390px; preencher o caso do teste da Task 1 e conferir 22,90 na venda direta; digitar "1,5" e vazio nos campos (sem NaN); alternar modo escuro.
- [ ] **Step 3:** Conferir que `/` continua com Header/Footer da loja e `/lab/calculadora` não tem o Header da loja.
- [ ] **Step 4:** `npm run build && npm test` verdes. Commit `feat(lab): casca do Lab, Edy e calculadora`.

---

### Task 4: Supabase — banco, RLS, clientes e login

**Pré-requisito do Rafael:** Supabase instalado pelo Vercel Marketplace no projeto investores3d. Depois: `vercel env pull .env.local` (traz `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `POSTGRES_URL_NON_POOLING`).

**Files:**
- Create: `supabase/migrations/0001_lab.sql`, `scripts/migrate.mjs` (aplica os .sql em ordem via `pg` + `POSTGRES_URL_NON_POOLING`, registra em tabela `_lab_migrations`), `scripts/rls-check.mjs`
- Create: `src/lib/supabase/server.ts` (`createClient(): Promise<SupabaseClient>` via `@supabase/ssr` + `cookies()`), `src/lib/supabase/browser.ts`, `src/lib/supabase/admin.ts` (service role, `import "server-only"`)
- Create: `src/middleware.ts` — matcher `["/lab/:path*"]`; renova sessão; sem sessão e rota ≠ `/lab/entrar|/lab/auth/*|/lab/privacidade` → redirect `/lab/entrar?next=<rota>`
- Create: `src/app/lab/entrar/page.tsx` (+ client form): botão "Entrar com Google" (`signInWithOAuth({ provider: "google", options: { redirectTo: origin + "/lab/auth/callback?next=..." } })`) e e-mail → `signInWithOtp({ email, options: { shouldCreateUser: true } })` → campo de 6 dígitos → `verifyOtp({ email, token, type: "email" })`
- Create: `src/app/lab/auth/callback/route.ts` (`exchangeCodeForSession`, redirect para `next` só se começar com `/lab`)
- Create: `src/app/lab/sair/route.ts` (POST → signOut → `/lab/entrar`)

SQL (`0001_lab.sql`) — todas com `id uuid default gen_random_uuid() primary key`, `user_id uuid not null references auth.users on delete cascade default auth.uid()`, `created_at timestamptz default now()`, RLS enable + policy `for all using (auth.uid() = user_id) with check (auth.uid() = user_id)`:
- `profiles` (aqui `id` = `auth.users.id` em vez de `user_id`; policy por `id`): `name text`, `printer_model text`, `whatsapp text`, `privacy_accepted_at timestamptz`, `joined_group boolean default false`, `onboarded_at timestamptz`
- `printers`: `name text not null`, `price numeric not null`, `life_hours numeric not null default 5000`, `watts numeric not null`
- `filaments`: `type text not null`, `color text`, `spool_price numeric not null`, `spool_grams numeric not null default 1000`
- `workshop_settings` (`user_id` unique): `kwh_price numeric`, `labor_hourly numeric`, `loss_pct numeric`, `packaging numeric`, `margin_pct numeric`, `fee_overrides jsonb default '{}'`
- `parts`: `name text not null`, `photo_url text`, `grams numeric`, `print_minutes int`, `labor_minutes int`, `printer_id uuid references printers on delete set null`, `filament_id uuid references filaments on delete set null`, `margin_pct numeric`, `unit_cost numeric not null`, `prices jsonb not null`
- `sales`: `part_id uuid references parts on delete set null`, `description text not null`, `qty int not null check (qty > 0)`, `unit_price numeric not null`, `unit_cost numeric not null default 0`, `print_minutes int not null default 0`, `channel text not null check (channel in ('direto','shopee','ml'))`, `sold_on date not null default current_date`
- `expenses`: `description text not null`, `category text not null check (category in ('filamento','manutencao','embalagem','energia','ferramentas','outros'))`, `amount numeric not null check (amount >= 0)`, `spent_on date not null default current_date`

`rls-check.mjs`: cria 2 usuários de teste via admin API, loga como A (anon key + `signInWithPassword` com senha temporária definida pelo admin), insere uma despesa; loga como B; `select` de expenses retorna 0 linhas; `update`/`delete` no id de A afeta 0 linhas; apaga os 2 usuários no fim. Imprime `RLS OK` ou sai com código 1.

Passos de configuração no painel Supabase (Rafael, guiado): Authentication → URL Configuration: Site URL `https://inventores3d.com.br/lab`, Redirect URLs `https://inventores3d.com.br/lab/auth/callback`, `http://localhost:3000/lab/auth/callback`, `https://*-gasomax.vercel.app/lab/auth/callback`; Email template "Magic Link" com `{{ .Token }}` (texto em PT-BR, assinado pelo Edy); Google provider com client OAuth; SMTP custom Resend (`lab@inventores3d.com.br`) após verificar o domínio no Resend (DNS no Registro.br).

- [ ] **Step 1:** Escrever SQL + `migrate.mjs`; `node --env-file=.env.local scripts/migrate.mjs` → "0001_lab aplicada".
- [ ] **Step 2:** `node --env-file=.env.local scripts/rls-check.mjs` → `RLS OK`.
- [ ] **Step 3:** Clientes Supabase, middleware, entrar, callback, sair.
- [ ] **Step 4:** Manual: `/lab/calculadora` sem sessão → vai pra `/lab/entrar?next=/lab/calculadora`; login por código (e-mail do Rafael) → volta pra calculadora; `?next=https://evil.com` cai em `/lab`.
- [ ] **Step 5:** `npm run build`; commit `feat(lab): Supabase, RLS e login sem senha`.

---

### Task 5: Boas-vindas, perfil e início

**Files:**
- Create: `src/lib/lab/data.ts` — `getProfile()`, `requireOnboarded(): Promise<Profile>` (redirect `/lab/boas-vindas` se `onboarded_at` nulo), `getWorkshop(): Promise<{ settings: WorkshopSettings; printers: Printer[]; filaments: Filament[] }>`
- Create: `src/app/lab/boas-vindas/page.tsx` + `actions.ts` (`completeOnboarding(form)`: nome obrigatório, `printer_model` de `PRINTER_MODELS`, whatsapp opcional (máscara `(11) 91234-5678`, guarda só dígitos com 55; inválido = erro no campo), aceite obrigatório → grava profile, cria `printers` a partir do modelo, `filaments` com `DEFAULT_FILAMENT`, `workshop_settings` com `DEFAULT_WORKSHOP`, seta `onboarded_at`)
- Create: `src/app/lab/page.tsx` (Início), `src/components/lab/GroupCard.tsx` (só se `NEXT_PUBLIC_LAB_WHATSAPP_GROUP`; botão "Entrar no grupo" abre link e marca `joined_group`; "Já entrei" esconde), `src/components/lab/FirstSteps.tsx` (3 itens: oficina revisada → existe parte salva → existe venda), resumo do mês (usa `monthSummary` da Task 9 — até lá, mostra contagens simples)
- Modify: todas as páginas do Lab (exceto entrar/boas-vindas/privacidade) chamam `requireOnboarded()`

Tela final da boas-vindas: Edy `mood="festa"`, "Pronto, {nome}! Sua oficina está montada." + botão do grupo (se env) + "Fazer meu primeiro cálculo".

- [ ] **Step 1:** Implementar. **Step 2:** Manual com conta nova: login → boas-vindas → início; WhatsApp "123" mostra erro; sem aceite não avança; acessar `/lab/vendas` antes de terminar → volta pra boas-vindas. **Step 3:** build + commit `feat(lab): boas-vindas, perfil e início`.

---

### Task 6: Minha oficina (com taxas editáveis)

**Files:** Create `src/app/lab/oficina/page.tsx`, `actions.ts` (`saveSettings`, `upsertPrinter`, `deletePrinter`, `upsertFilament`, `deleteFilament`, `saveFeeOverrides`); Modify `Calculator` uso em `/lab/calculadora` para receber oficina real.

Regras: não deixar excluir a última impressora nem o último filamento (mensagem); cada campo mostra o padrão sugerido como dica; taxas por canal com "voltar ao padrão".

- [ ] **Step 1:** Teste unitário de `resolveFees` com override vindo do jsonb (`{ shopee: { pct: 0.18 } }` mantém `fixed` padrão). **Step 2:** FAIL→implementar→PASS. **Step 3:** Telas + manual (editar kWh muda o custo na calculadora). **Step 4:** commit `feat(lab): minha oficina`.

---

### Task 7: Calculadora salvando peças + Minhas peças

**Files:** Create `src/app/lab/pecas/page.tsx`, `src/app/lab/pecas/[id]/page.tsx` (editar = calculadora preenchida), `actions.ts` (`savePart(draft: PartDraft)`, `duplicatePart(id)`, `deletePart(id)`); Modify `/lab/calculadora/page.tsx` para passar `onSave`.

`savePart` recalcula no servidor com `computeCost`/`quote` (não confia no cliente) e grava `unit_cost` + `prices` (`{ direto, shopee, ml }` em número). Id inexistente/de outro usuário → `notFound()`.

- [ ] **Step 1:** Implementar. **Step 2:** Manual: salvar, editar, duplicar ("(cópia)"), excluir; abrir `/lab/pecas/<id-aleatório>` → 404. **Step 3:** commit `feat(lab): peças salvas`.

---

### Task 8: Vendas e despesas

**Files:** Create `src/app/lab/vendas/page.tsx`, `src/app/lab/despesas/page.tsx`, `actions.ts` de cada (`addSale`, `deleteSale`, `addExpense`, `deleteExpense`), `src/components/lab/MonthPicker.tsx` (`?m=2026-11`).

`addSale`: se `part_id`, copia `description = part.name`, `unit_cost`, `print_minutes` da peça (snapshot); preço sugerido do canal pré-preenchido mas editável; avulsa exige descrição e aceita custo opcional. Lista do mês com total.

- [ ] **Step 1:** Implementar. **Step 2:** Manual: venda de peça, venda avulsa, despesa; trocar mês. **Step 3:** commit `feat(lab): vendas e despesas`.

---

### Task 9: Resultados (agregação pura + tela)

**Files:** Create `src/lib/lab/results.ts`, `src/lib/lab/results.test.ts`, `src/app/lab/resultados/page.tsx`; Modify `src/app/lab/page.tsx` (resumo usa `monthSummary`).

**Produces:** `monthSummary(sales: SaleRow[], expenses: ExpenseRow[], fees: Record<Channel, FeeRule>): { revenue: number; fees: number; costOfGoods: number; expenses: number; profit: number; machineHours: number; profitPerMachineHour: number | null; byChannel: Record<Channel, number>; topParts: { description: string; qty: number; revenue: number }[] }` — `fees` calculado por venda com `quoteAtPrice`; `profit = revenue - fees - costOfGoods - expenses`; `topParts` por `description`, top 5 por qty.

- [ ] **Step 1:** Testes: mês vazio → todos 0 e `profitPerMachineHour` null; 2 vendas da mesma descrição somam em `topParts`; venda com `part_id` null (peça excluída) conta normalmente; despesa entra só no `profit`. **Step 2:** FAIL→implementar→PASS. **Step 3:** Tela com cartões + barras simples por canal (CSS, sem lib). **Step 4:** commit `feat(lab): resultados do mês`.

---

### Task 10: Aprenda, Conta, Privacidade e excluir conta

**Files:** Create `src/lib/lab/lessons.ts` (`LESSONS: { slug: string; title: string; screen: string; youtubeId: string | null }[]` para: oficina, calculadora, pecas, vendas, despesas, resultados — todos `youtubeId: null` por enquanto), `src/components/lab/HowTo.tsx` (link "Como usar esta tela" → aula ou "em breve"), `src/app/lab/aprenda/page.tsx`, `src/app/lab/conta/page.tsx` + `actions.ts` (`updateProfile`, `deleteAccount`), `src/app/lab/privacidade/page.tsx` (indexável).

`deleteAccount`: exige digitar "EXCLUIR"; `admin.auth.admin.deleteUser(uid)` (cascade apaga tudo) → signOut → `/lab/entrar?conta=excluida`. Privacidade: o que coleta (e-mail, nome, impressora, WhatsApp opcional, dados que a pessoa digita), pra quê (Lab + convite do grupo), não vende/compartilha, como excluir, contato = WhatsApp da loja.

- [ ] **Step 1:** Implementar. **Step 2:** Manual: criar conta teste, lançar dados, excluir → login de novo cai em boas-vindas e não há dados antigos. **Step 3:** commit `feat(lab): aprenda, conta e privacidade`.

---

### Task 11: Link do Lab na loja (atrás de flag) + robots/sitemap

**Files:** Modify `src/components/Header.tsx` (link "Lab" antes do botão Buscar, só se `NEXT_PUBLIC_LAB_PUBLICO === "1"`), `src/components/Footer.tsx` (coluna Ajuda: "Lab grátis para makers", mesma condição), `src/app/robots.ts` (disallow `/lab/` exceto `/lab/entrar` e `/lab/privacidade`), `src/app/sitemap.ts` (inclui `/lab/entrar` só com a flag).

- [ ] **Step 1:** Build sem a flag → screenshots da Task 2 idênticos. **Step 2:** `NEXT_PUBLIC_LAB_PUBLICO=1 npm run build` → link aparece. **Step 3:** commit `feat(lab): link na loja atrás de NEXT_PUBLIC_LAB_PUBLICO`.

---

### Task 12: Publicar (escondido) e verificar em produção

- [ ] **Step 1:** `npm test && npm run build` verdes; push do branch `lab` → preview da Vercel; testar login por código no preview.
- [ ] **Step 2:** Merge em `main` + push (deploy automático). **Não** definir `NEXT_PUBLIC_LAB_PUBLICO` nem `NEXT_PUBLIC_LAB_WHATSAPP_GROUP`.
- [ ] **Step 3:** Produção: `https://inventores3d.com.br/lab` → `/lab/entrar` (não 404); loja sem link "Lab"; `node --env-file=.env.local scripts/rls-check.mjs` → `RLS OK`.
- [ ] **Step 4:** Atualizar memória do projeto e `ESTRATEGIA.md` (seção "Lab": onde editar taxas, aulas, flags de lançamento).
