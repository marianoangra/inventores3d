/** Dono da loja: vê os pedidos no Lab. E-mails em STORE_OWNER_EMAIL (ou ML_ADMIN_EMAIL), separados por vírgula. */
export function isStoreOwner(email?: string | null): boolean {
  const list = (process.env.STORE_OWNER_EMAIL || process.env.ML_ADMIN_EMAIL || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(email && list.includes(email.toLowerCase()));
}
