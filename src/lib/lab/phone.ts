/** WhatsApp opcional: vazio → null; celular BR válido → "55DDD9XXXXXXXX"; resto → "invalid". */
export function normalizeWhatsapp(s: string | null | undefined): string | null | "invalid" {
  const d = (s ?? "").replace(/\D/g, "");
  if (!d) return null;
  const local = d.length === 13 && d.startsWith("55") ? d.slice(2) : d;
  if (local.length !== 11 || local[2] !== "9") return "invalid";
  return "55" + local;
}

export function formatWhatsapp(n: string): string {
  const l = n.startsWith("55") ? n.slice(2) : n;
  return `(${l.slice(0, 2)}) ${l.slice(2, 7)}-${l.slice(7)}`;
}
