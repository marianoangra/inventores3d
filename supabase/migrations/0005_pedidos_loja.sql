-- Pedidos pagos no site (Asaas). Tem CPF e endereço: só o servidor (service role) lê/escreve.
-- RLS ligado e SEM policy = anon/authenticated não veem nada.

create table if not exists public.store_orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  env text not null check (env in ('sandbox', 'producao')),
  status text not null default 'pendente' check (status in ('pendente', 'pago', 'enviado', 'cancelado', 'expirado', 'estornado', 'erro')),
  items jsonb not null,
  subtotal numeric not null check (subtotal >= 0),
  discount numeric not null default 0 check (discount >= 0),
  shipping numeric not null default 0 check (shipping >= 0),
  total numeric not null check (total >= 0),
  pay_method text not null check (pay_method in ('pix', 'cartao')),
  installments int not null default 1 check (installments between 1 and 12),
  customer_name text not null,
  cpf text not null,
  email text not null,
  whatsapp text not null,
  cep text not null,
  street text not null,
  number text not null,
  complement text,
  district text,
  city text not null,
  uf text not null,
  notes text,
  ip text,
  asaas_customer text,
  asaas_payment text,
  invoice_url text,
  error text,
  tracking_code text,
  paid_at timestamptz,
  shipped_at timestamptz,
  lab_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists store_orders_status_idx on public.store_orders (status, created_at desc);
create index if not exists store_orders_ip_idx on public.store_orders (ip, created_at);
create index if not exists store_orders_cpf_idx on public.store_orders (cpf, status);

alter table public.store_orders enable row level security;
revoke all on public.store_orders from anon, authenticated;
