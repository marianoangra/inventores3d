// Operar a conta do Mercado Livre pela linha de comando (usa o token salvo pelo /lab/mercado-livre).
// uso: node --env-file=.env.local scripts/ml.mjs <comando> [args]
//   me                     → dados da conta conectada
//   categoria "<título>"   → categoria sugerida pelo ML + atributos obrigatórios
//   itens                  → anúncios da conta
//   publicar <arquivo.json> [--de-verdade]  → valida (padrão) ou publica um anúncio
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const API = "https://api.mercadolibre.com";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function token() {
  const { data, error } = await db.from("ml_tokens").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("ML não conectado — abra /lab/mercado-livre e clique em Conectar");
  if (new Date(data.expires_at).getTime() > Date.now()) return data.access_token;
  if (!process.env.ML_CLIENT_ID || !process.env.ML_CLIENT_SECRET) throw new Error("ML_CLIENT_ID/ML_CLIENT_SECRET ausentes no .env.local");
  const r = await fetch(`${API}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.ML_CLIENT_ID,
      client_secret: process.env.ML_CLIENT_SECRET,
      refresh_token: data.refresh_token,
    }),
  });
  const t = await r.json();
  if (!r.ok) throw new Error(`refresh falhou: ${JSON.stringify(t)}`);
  await db.from("ml_tokens").update({
    access_token: t.access_token,
    refresh_token: t.refresh_token,
    expires_at: new Date(Date.now() + (t.expires_in - 300) * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("id", 1);
  return t.access_token;
}

async function ml(path, init = {}) {
  const r = await fetch(`${API}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${await token()}`, "content-type": "application/json", ...init.headers },
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${r.status} ${path}\n${JSON.stringify(body, null, 2)}`);
  return body;
}

const [cmd, ...args] = process.argv.slice(2);
const out = (x) => console.log(JSON.stringify(x, null, 2));

switch (cmd) {
  case "me": {
    const me = await ml("/users/me");
    out({ id: me.id, nickname: me.nickname, tipo: me.user_type, reputacao: me.seller_reputation?.level_id, status: me.status?.site_status, envios: me.shipping_modes });
    break;
  }
  case "categoria": {
    const q = encodeURIComponent(args.join(" "));
    const sug = await ml(`/sites/MLB/domain_discovery/search?limit=3&q=${q}`);
    for (const s of sug) {
      const attrs = await ml(`/categories/${s.category_id}/attributes`);
      const obrig = attrs.filter((a) => a.tags?.required || a.tags?.catalog_required).map((a) => `${a.id} (${a.name})`);
      out({ categoria: s.category_id, nome: s.category_name, dominio: s.domain_name, obrigatorios: obrig });
    }
    break;
  }
  case "itens": {
    const me = await ml("/users/me");
    const { results } = await ml(`/users/${me.id}/items/search?limit=50`);
    for (const id of results) {
      const it = await ml(`/items/${id}`);
      console.log(`${id}  ${it.status.padEnd(8)} R$${it.price}  estoque ${it.available_quantity}  ${it.title}`);
    }
    if (!results.length) console.log("nenhum anúncio");
    break;
  }
  case "publicar": {
    const item = JSON.parse(readFileSync(args[0], "utf8"));
    if (!args.includes("--de-verdade")) {
      await ml("/items/validate", { method: "POST", body: JSON.stringify(item) }); // 204 = válido
      console.log("✔ anúncio válido (nada publicado). Rode com --de-verdade para publicar.");
    } else {
      const res = await ml("/items", { method: "POST", body: JSON.stringify(item) });
      out({ id: res.id, status: res.status, link: res.permalink });
    }
    break;
  }
  default:
    console.log("comandos: me | categoria \"<título>\" | itens | publicar <arquivo.json> [--de-verdade]");
}
