import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const TABLES = ["profiles", "workshop_settings", "printers", "filaments", "parts", "sales", "expenses", "production_jobs", "quotes"] as const;

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Baixa tudo que a pessoa lançou no Lab. RLS garante que só vem o que é dela. */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.redirect(new URL("/lab/entrar", req.url));
  const stamp = new Date().toISOString().slice(0, 10);

  if (req.nextUrl.searchParams.get("formato") === "csv") {
    const { data } = await supabase.from("sales").select("sold_on, description, qty, unit_price, unit_fee, unit_cost, channel").order("sold_on");
    const head = ["data", "descricao", "quantidade", "preco_unitario", "taxa_unitaria", "custo_unitario", "canal"];
    // ; e BOM: o Excel em português abre certinho
    const body = [head.join(";"), ...(data ?? []).map((r) => Object.values(r).map(csvCell).join(";"))].join("\r\n");
    return new NextResponse("﻿" + body, {
      headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="lab-vendas-${stamp}.csv"`, "cache-control": "no-store" },
    });
  }

  const results = await Promise.all(TABLES.map((t) => supabase.from(t).select("*")));
  const out: Record<string, unknown> = { exportado_em: new Date().toISOString(), email: auth.user.email };
  TABLES.forEach((t, i) => (out[t] = results[i].data ?? []));
  return new NextResponse(JSON.stringify(out, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8", "content-disposition": `attachment; filename="lab-inventores3d-${stamp}.json"`, "cache-control": "no-store" },
  });
}
