"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/lab/data";
import { isMlAdmin } from "@/lib/ml/client";
import { importRecentMlOrders } from "@/lib/ml/order-sync";
import type { FormState } from "@/components/lab/ActionForm";

/** Puxa as vendas pagas dos últimos 14 dias e põe na fila o que ainda não estava. */
export async function importMlOrders(): Promise<FormState> {
  const user = await getUser();
  if (!isMlAdmin(user?.email)) return { error: "Sem permissão." };
  try {
    const r = await importRecentMlOrders(14);
    const novos = r.filter((x) => x.result === "lancado").length;
    revalidatePath("/lab", "layout");
    return { ok: !r.length ? "Nenhuma venda paga nos últimos 14 dias." : novos ? `${novos} venda(s) nova(s) na fila de produção!` : "Tudo já estava na fila." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Não deu pra buscar as vendas." };
  }
}
