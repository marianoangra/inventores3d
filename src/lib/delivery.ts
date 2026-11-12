// Estimativa de data "pronto pra envio" somando dias úteis (seg–sex).
export function readyDate(businessDays: number, from = new Date()) {
  const d = new Date(from);
  let left = businessDays;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) left--;
  }
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" }).replace(".", "");
}
