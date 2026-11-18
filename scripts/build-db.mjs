// Roda antes do `next build` na Vercel (onde as chaves do Supabase existem).
// - aplica as migrações pendentes (todas as builds com banco)
// - nas prévias, roda o teste de isolamento (RLS); se falhar, a build falha
import { spawnSync } from "node:child_process";

const run = (script) => {
  const r = spawnSync(process.execPath, [script], { stdio: "inherit", env: process.env });
  if (r.status !== 0) {
    console.error(`[build-db] ${script} falhou`);
    process.exit(r.status ?? 1);
  }
};

if (!process.env.POSTGRES_URL_NON_POOLING) {
  console.log("[build-db] sem POSTGRES_URL_NON_POOLING — pulando migrações (build local)");
  process.exit(0);
}
run("scripts/migrate.mjs");
if (process.env.VERCEL_ENV === "preview" && process.env.SUPABASE_SERVICE_ROLE_KEY) run("scripts/rls-check.mjs");
