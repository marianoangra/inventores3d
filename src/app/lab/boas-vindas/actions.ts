"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_FILAMENT, DEFAULT_WORKSHOP, PRINTER_MODELS } from "@/lib/lab/defaults";
import { normalizeWhatsapp } from "@/lib/lab/phone";
import { setupPlan } from "@/lib/lab/setup";

export type OnboardState = { errors?: Partial<Record<"name" | "printer" | "whatsapp" | "privacy" | "form", string>> };

export async function completeOnboarding(_: OnboardState, form: FormData): Promise<OnboardState> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/lab/entrar");

  const name = String(form.get("name") ?? "").trim().slice(0, 80);
  const printerId = String(form.get("printer") ?? "");
  const wa = normalizeWhatsapp(String(form.get("whatsapp") ?? ""));
  const privacy = form.get("privacy") === "on";

  const errors: OnboardState["errors"] = {};
  if (!name) errors.name = "Como podemos te chamar?";
  const model = PRINTER_MODELS.find((m) => m.id === printerId);
  if (!model) errors.printer = "Escolha sua impressora (ou Outra).";
  if (wa === "invalid") errors.whatsapp = "Confira o número: DDD + celular com 9 dígitos.";
  if (!privacy) errors.privacy = "Precisa aceitar a política de privacidade pra continuar.";
  if (Object.keys(errors).length) return { errors };

  const uid = auth.user.id;
  const now = new Date().toISOString();
  const { error: e1 } = await supabase.from("profiles").upsert({
    id: uid,
    name,
    printer_model: model!.id,
    whatsapp: wa,
    privacy_accepted_at: now,
  });
  if (e1) return { errors: { form: "Não deu pra salvar agora. Tente de novo." } };

  // monta a oficina inicial; cada parte é conferida separadamente (retentativa completa o que faltou)
  const cnt = async (t: string) => (await supabase.from(t).select("id", { count: "exact", head: true })).count ?? 0;
  const plan = setupPlan({ printers: await cnt("printers"), filaments: await cnt("filaments"), settings: await cnt("workshop_settings") });
  const r = await Promise.all([
    plan.printer ? supabase.from("printers").insert({ name: model!.label, price: model!.price, watts: model!.watts, life_hours: DEFAULT_WORKSHOP.printerLifeHours }) : null,
    plan.filament ? supabase.from("filaments").insert({ type: DEFAULT_FILAMENT.type, color: DEFAULT_FILAMENT.color, spool_price: DEFAULT_FILAMENT.spoolPrice, spool_grams: DEFAULT_FILAMENT.spoolGrams }) : null,
    plan.settings
      ? supabase.from("workshop_settings").upsert(
          { user_id: uid, kwh_price: DEFAULT_WORKSHOP.kwhPrice, labor_hourly: DEFAULT_WORKSHOP.laborHourly, loss_pct: DEFAULT_WORKSHOP.lossPct, packaging: DEFAULT_WORKSHOP.packaging, margin_pct: DEFAULT_WORKSHOP.marginPct },
          { onConflict: "user_id" },
        )
      : null,
  ]);
  if (r.some((x) => x?.error)) return { errors: { form: "Não deu pra montar sua oficina. Tente de novo." } };

  const done = await supabase.from("profiles").update({ onboarded_at: now }).eq("id", uid);
  if (done.error) return { errors: { form: "Não deu pra concluir agora. Tente de novo." } };
  redirect("/lab/boas-vindas?pronto=1");
}

export async function markJoinedGroup() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("profiles").update({ joined_group: true }).eq("id", data.user.id);
}
