-- Lab Inventores 3D — tabelas da área logada.
-- Regra de ouro: toda tabela tem RLS e cada pessoa só lê/escreve as próprias linhas.

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text,
  printer_model text,
  whatsapp text,
  privacy_accepted_at timestamptz,
  joined_group boolean not null default false,
  onboarded_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.printers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  price numeric not null check (price >= 0),
  life_hours numeric not null default 5000 check (life_hours > 0),
  watts numeric not null check (watts >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.filaments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  type text not null,
  color text,
  spool_price numeric not null check (spool_price >= 0),
  spool_grams numeric not null default 1000 check (spool_grams > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.workshop_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique default auth.uid() references auth.users on delete cascade,
  kwh_price numeric not null default 0.95,
  labor_hourly numeric not null default 20,
  loss_pct numeric not null default 5,
  packaging numeric not null default 2,
  margin_pct numeric not null default 80,
  fee_overrides jsonb not null default '{}'::jsonb,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.parts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  photo_url text,
  grams numeric not null check (grams >= 0),
  print_minutes int not null check (print_minutes >= 0),
  labor_minutes int not null default 0 check (labor_minutes >= 0),
  packaging numeric not null default 0 check (packaging >= 0),
  printer_id uuid references public.printers on delete set null,
  filament_id uuid references public.filaments on delete set null,
  margin_pct numeric not null,
  unit_cost numeric not null,
  prices jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  part_id uuid references public.parts on delete set null,
  description text not null,
  qty int not null check (qty > 0),
  unit_price numeric not null check (unit_price >= 0),
  unit_cost numeric not null default 0 check (unit_cost >= 0),
  print_minutes int not null default 0 check (print_minutes >= 0),
  channel text not null check (channel in ('direto', 'shopee', 'ml')),
  sold_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  description text not null,
  category text not null check (category in ('filamento', 'manutencao', 'embalagem', 'energia', 'ferramentas', 'outros')),
  amount numeric not null check (amount >= 0),
  spent_on date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists printers_user_idx on public.printers (user_id);
create index if not exists filaments_user_idx on public.filaments (user_id);
create index if not exists parts_user_idx on public.parts (user_id);
create index if not exists sales_user_date_idx on public.sales (user_id, sold_on);
create index if not exists expenses_user_date_idx on public.expenses (user_id, spent_on);

-- RLS
alter table public.profiles enable row level security;
alter table public.printers enable row level security;
alter table public.filaments enable row level security;
alter table public.workshop_settings enable row level security;
alter table public.parts enable row level security;
alter table public.sales enable row level security;
alter table public.expenses enable row level security;

drop policy if exists "dono" on public.profiles;
create policy "dono" on public.profiles for all to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

do $$
declare t text;
begin
  foreach t in array array['printers', 'filaments', 'workshop_settings', 'parts', 'sales', 'expenses'] loop
    execute format('drop policy if exists "dono" on public.%I', t);
    execute format('create policy "dono" on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
  end loop;
end $$;

-- peça/impressora/filamento referenciados precisam ser do mesmo dono
create or replace function public.lab_same_owner() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name = 'parts' then
    if new.printer_id is not null and not exists (select 1 from printers where id = new.printer_id and user_id = new.user_id) then
      raise exception 'impressora inválida';
    end if;
    if new.filament_id is not null and not exists (select 1 from filaments where id = new.filament_id and user_id = new.user_id) then
      raise exception 'filamento inválido';
    end if;
  elsif tg_table_name = 'sales' then
    if new.part_id is not null and not exists (select 1 from parts where id = new.part_id and user_id = new.user_id) then
      raise exception 'peça inválida';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists parts_same_owner on public.parts;
create trigger parts_same_owner before insert or update on public.parts for each row execute function public.lab_same_owner();
drop trigger if exists sales_same_owner on public.sales;
create trigger sales_same_owner before insert or update on public.sales for each row execute function public.lab_same_owner();

-- anônimo não toca em nada
revoke all on public.profiles, public.printers, public.filaments, public.workshop_settings, public.parts, public.sales, public.expenses from anon;
