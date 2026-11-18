/** Lê o # que o Supabase põe na volta do link do e-mail (fluxo sem PKCE, funciona em qualquer navegador). */
export function parseAuthHash(hash: string): { accessToken: string; refreshToken: string } | { error: string } {
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  if (p.get("error") || p.get("error_code")) return { error: p.get("error_code") || p.get("error") || "erro" };
  const accessToken = p.get("access_token");
  const refreshToken = p.get("refresh_token");
  if (!accessToken || !refreshToken) return { error: "sem_token" };
  return { accessToken, refreshToken };
}
