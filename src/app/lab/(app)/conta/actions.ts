"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeWhatsapp } from "@/lib/lab/phone";
import { PRINTER_MODELS } from "@/lib/lab/defaults";
import type { FormState } from "@/components/lab/ActionForm";

export async function updateProfile(_: FormState, f: FormData): Promise<FormState> {
  const name = String(f.get("name") ?? "").trim().slice(0, 80);
  const printer = String(f.get("printer") ?? "");
  const wa = normalizeWhatsapp(String(f.get("whatsapp") ?? ""));
  if (!name) return { error: "Informe seu nome." };
  if (!PRINTER_MODELS.some((m) => m.id === printer)) return { error: "Escolha a impressora." };
  if (wa === "invalid") return { error: "WhatsApp inválido: DDD + celular com 9 dígitos." };
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "Sessão expirou. Entre de novo." };
  const { error } = await supabase.from("profiles").update({ name, printer_model: printer, whatsapp: wa }).eq("id", data.user.id);
  if (error) return { error: "Não deu pra salvar." };
  revalidatePath("/lab", "layout");
  return { ok: "Salvo!" };
}

export async function deleteAccount(_: FormState, f: FormData): Promise<FormState> {
  if (String(f.get("confirm") ?? "").trim().toUpperCase() !== "EXCLUIR") return { error: "Digite EXCLUIR pra confirmar." };
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "Sessão expirou. Entre de novo." };
  // apaga o usuário; as tabelas do Lab têm "on delete cascade" e vão junto
  const { error } = await createAdminClient().auth.admin.deleteUser(data.user.id);
  if (error) return { error: "Não deu pra excluir agora. Tente de novo ou fale com a gente no WhatsApp." };
  await supabase.auth.signOut();
  redirect("/lab/entrar?conta=excluida");
}
