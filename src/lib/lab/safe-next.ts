/** Só aceita voltar para rotas internas do Lab (evita redirecionar para outro site). */
export function safeNext(next: string | null | undefined): string {
  if (!next || !/^\/lab(\/|\?|$)/.test(next) || next.includes("\\")) return "/lab";
  return next;
}
