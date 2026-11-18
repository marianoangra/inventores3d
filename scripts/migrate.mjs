// Aplica supabase/migrations/*.sql em ordem, uma vez cada.
// uso: node --env-file=.env.local scripts/migrate.mjs
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";

const url = process.env.POSTGRES_URL_NON_POOLING;
if (!url) throw new Error("POSTGRES_URL_NON_POOLING ausente (rode vercel env pull)");

const client = new pg.Client({ connectionString: url.replace(/[?&]sslmode=[^&]*/, ""), ssl: { rejectUnauthorized: false } });
await client.connect();
await client.query("create table if not exists public._lab_migrations (name text primary key, applied_at timestamptz default now())");
await client.query("alter table public._lab_migrations enable row level security");
await client.query("revoke all on public._lab_migrations from anon, authenticated");

const dir = path.resolve("supabase/migrations");
const done = new Set((await client.query("select name from public._lab_migrations")).rows.map((r) => r.name));
for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
  const name = f.replace(/\.sql$/, "");
  if (done.has(name)) {
    console.log(`${name} já aplicada`);
    continue;
  }
  await client.query("begin");
  try {
    await client.query(readFileSync(path.join(dir, f), "utf8"));
    await client.query("insert into public._lab_migrations (name) values ($1)", [name]);
    await client.query("commit");
    console.log(`${name} aplicada`);
  } catch (e) {
    await client.query("rollback");
    console.error(`${name} FALHOU: ${e.message}`);
    process.exitCode = 1;
    break;
  }
}
await client.end();
