import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Mercado Livre — OAuth 2.0 (authorization code + PKCE) e chamadas autenticadas.
// Docs: https://developers.mercadolivre.com.br/pt_br/autenticacao-e-autorizacao

export const ML_API = "https://api.mercadolibre.com";
const ML_AUTH = "https://auth.mercadolivre.com.br/authorization";

export const mlConfigured = () => Boolean(process.env.ML_CLIENT_ID && process.env.ML_CLIENT_SECRET);

/** Só o dono da loja mexe na integração (e-mail em STORE_OWNER_EMAIL ou ML_ADMIN_EMAIL, separados por vírgula). */
export function isMlAdmin(email?: string | null) {
  const list = (process.env.STORE_OWNER_EMAIL || process.env.ML_ADMIN_EMAIL || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(email && list.includes(email.toLowerCase()));
}

export const redirectUri = (origin: string) => `${origin}/lab/ml/callback`;

export function authorizeUrl(origin: string, state: string, codeChallenge: string) {
  const u = new URL(ML_AUTH);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("client_id", process.env.ML_CLIENT_ID!);
  u.searchParams.set("redirect_uri", redirectUri(origin));
  u.searchParams.set("state", state);
  u.searchParams.set("code_challenge", codeChallenge);
  u.searchParams.set("code_challenge_method", "S256");
  return u.toString();
}

type TokenResponse = { access_token: string; refresh_token: string; expires_in: number; user_id: number };

async function tokenRequest(params: Record<string, string>): Promise<TokenResponse> {
  const r = await fetch(`${ML_API}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
    body: new URLSearchParams({
      client_id: process.env.ML_CLIENT_ID!,
      client_secret: process.env.ML_CLIENT_SECRET!,
      ...params,
    }),
    cache: "no-store",
  });
  const body = await r.json();
  if (!r.ok) throw new Error(`ML oauth ${r.status}: ${body.message ?? body.error ?? "erro"}`);
  return body;
}

async function saveTokens(t: TokenResponse, nickname?: string, ownerUserId?: string) {
  const db = createAdminClient();
  const row: Record<string, unknown> = {
    id: 1,
    ml_user_id: t.user_id,
    access_token: t.access_token,
    refresh_token: t.refresh_token, // o ML gira o refresh token a cada uso: sempre salvar o novo
    expires_at: new Date(Date.now() + (t.expires_in - 300) * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (nickname !== undefined) row.nickname = nickname;
  if (ownerUserId) row.owner_user_id = ownerUserId; // vendas do ML caem na conta de quem conectou
  const { error } = await db.from("ml_tokens").upsert(row);
  if (error) throw new Error(`salvar token ML: ${error.message}`);
}

/** Troca o code do callback por tokens e guarda. Devolve o apelido da conta conectada. */
export async function exchangeCode(code: string, origin: string, codeVerifier: string, ownerUserId?: string) {
  const t = await tokenRequest({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri(origin),
    code_verifier: codeVerifier,
  });
  const me = await fetch(`${ML_API}/users/me`, { headers: { authorization: `Bearer ${t.access_token}` } }).then((r) => r.json());
  await saveTokens(t, me.nickname ?? null, ownerUserId);
  return me.nickname as string | undefined;
}

/** Access token válido (renova sozinho quando faltam <5 min). */
export async function getAccessToken() {
  const db = createAdminClient();
  const { data, error } = await db.from("ml_tokens").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error(`ler token ML: ${error.message}`);
  if (!data) throw new Error("Mercado Livre não conectado");
  if (new Date(data.expires_at).getTime() > Date.now()) return data.access_token as string;
  const t = await tokenRequest({ grant_type: "refresh_token", refresh_token: data.refresh_token });
  await saveTokens(t);
  return t.access_token;
}

export async function mlFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const r = await fetch(`${ML_API}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...init.headers },
    cache: "no-store",
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`ML ${r.status} ${path}: ${JSON.stringify(body)}`);
  return body as T;
}

export async function connectionStatus() {
  const db = createAdminClient();
  const { data } = await db.from("ml_tokens").select("ml_user_id,nickname,updated_at").eq("id", 1).maybeSingle();
  return data as { ml_user_id: number; nickname: string | null; updated_at: string } | null;
}
