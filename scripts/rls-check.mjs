// Prova que um usuário não enxerga nem altera dados de outro (RLS).
// uso: node --env-file=.env.local scripts/rls-check.mjs   → imprime "RLS OK" ou sai com código 1
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });

const fails = [];
const check = (ok, msg) => (ok ? console.log("  ok  ", msg) : (fails.push(msg), console.log("  FALHA", msg)));

async function makeUser(tag) {
  const email = `rls-${tag}-${Date.now()}@teste.inventores3d.com.br`;
  const password = randomBytes(18).toString("base64url");
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  const c = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error: e2 } = await c.auth.signInWithPassword({ email, password });
  if (e2) throw e2;
  return { id: data.user.id, c };
}

const users = [];
try {
  const A = await makeUser("a");
  users.push(A.id);
  const B = await makeUser("b");
  users.push(B.id);

  const ins = await A.c.from("expenses").insert({ description: "teste", category: "outros", amount: 10 }).select("id").single();
  check(!ins.error && ins.data?.id, "A insere a própria despesa");
  const id = ins.data?.id;

  const own = await A.c.from("expenses").select("id");
  check(own.data?.length === 1, "A enxerga a própria despesa");

  const sel = await B.c.from("expenses").select("id");
  check(!sel.error && sel.data.length === 0, "B não enxerga despesas de A");

  const upd = await B.c.from("expenses").update({ amount: 999 }).eq("id", id).select("id");
  check(!upd.error && upd.data.length === 0, "B não altera despesa de A");

  const del = await B.c.from("expenses").delete().eq("id", id).select("id");
  check(!del.error && del.data.length === 0, "B não apaga despesa de A");

  const forge = await B.c.from("expenses").insert({ user_id: A.id, description: "x", category: "outros", amount: 1 });
  check(!!forge.error, "B não cria linha em nome de A");

  const pB = await B.c.from("profiles").insert({ id: A.id, name: "intruso" });
  check(!!pB.error, "B não cria perfil de A");

  const pr = await A.c.from("printers").insert({ name: "A1", price: 1000, watts: 80 }).select("id").single();
  const partForge = await B.c.from("parts").insert({ name: "x", grams: 1, print_minutes: 1, margin_pct: 1, unit_cost: 1, prices: {}, printer_id: pr.data?.id });
  check(!!partForge.error, "B não usa impressora de A numa peça");

  const sale = await A.c.from("sales").insert({ description: "venda A", qty: 1, unit_price: 10, channel: "direto" }).select("id").single();
  const jobA = await A.c.from("production_jobs").insert({ sale_id: sale.data?.id, description: "ordem A", qty: 1 }).select("id").single();
  check(!jobA.error && jobA.data?.id, "A cria ordem de produção da própria venda");
  const jobsB = await B.c.from("production_jobs").select("id");
  check(!jobsB.error && jobsB.data.length === 0, "B não enxerga ordens de A");
  const jobForge = await B.c.from("production_jobs").insert({ sale_id: sale.data?.id, description: "x", qty: 1 });
  check(!!jobForge.error, "B não cria ordem ligada à venda de A");

  const qA = await A.c.from("quotes").insert({ number: 1, kind: "orcamento", customer_name: "Cliente", items: [] }).select("id").single();
  check(!qA.error && qA.data?.id, "A cria orçamento");
  const qB = await B.c.from("quotes").select("id");
  check(!qB.error && qB.data.length === 0, "B não enxerga orçamentos de A");
  const qUpd = await B.c.from("quotes").update({ discount: 99 }).eq("id", qA.data?.id).select("id");
  check(!qUpd.error && qUpd.data.length === 0, "B não altera orçamento de A");

  const anon = createClient(URL, ANON, { auth: { persistSession: false } });
  const an = await anon.from("expenses").select("id");
  check(!!an.error || an.data.length === 0, "anônimo não lê nada");
} catch (e) {
  fails.push(String(e.message || e));
  console.log("  ERRO", e.message || e);
} finally {
  for (const id of users) await admin.auth.admin.deleteUser(id);
}

if (fails.length) {
  console.log(`RLS FALHOU (${fails.length})`);
  process.exit(1);
}
console.log("RLS OK");
