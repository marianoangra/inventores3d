-- Integração Mercado Livre (loja Inventores 3D, conta única do dono).
-- Só o servidor (service role) lê/escreve: RLS ligado e SEM policy = anon/authenticated não veem nada.

create table if not exists public.ml_tokens (
  id int primary key default 1 check (id = 1),
  ml_user_id bigint not null,
  nickname text,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);
alter table public.ml_tokens enable row level security;
revoke all on public.ml_tokens from anon, authenticated;

-- Vínculo produto do site (slug) ↔ anúncio no ML.
create table if not exists public.ml_listings (
  slug text primary key,
  ml_item_id text unique,
  permalink text,
  status text,
  price numeric,
  synced_at timestamptz not null default now()
);
alter table public.ml_listings enable row level security;
revoke all on public.ml_listings from anon, authenticated;
