-- Vendas do Mercado Livre entram sozinhas em Vendas + fila de Produção do dono da loja.

-- quem conectou a conta do ML (as vendas caem na conta dele no Lab)
alter table public.ml_tokens add column if not exists owner_user_id uuid references auth.users on delete set null;

-- controle de pedidos já lançados (o ML manda a mesma notificação várias vezes)
create table if not exists public.ml_orders (
  ml_order_id bigint primary key,
  status text not null,
  buyer text,
  total numeric,
  sale_ids jsonb not null default '[]'::jsonb,
  job_ids jsonb not null default '[]'::jsonb,
  processed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.ml_orders enable row level security;
revoke all on public.ml_orders from anon, authenticated;
