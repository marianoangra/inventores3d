-- Pacote "estilo Tuba": fila de produção, orçamento/recibo, estoque de filamento, link do STL.

-- estoque: gramas que sobram no rolo (null = não controla estoque deste filamento)
alter table public.filaments add column if not exists grams_left numeric check (grams_left >= 0);

-- link do arquivo do modelo (Drive, Printables, MakerWorld…)
alter table public.parts add column if not exists stl_url text check (stl_url is null or stl_url ~* '^https?://');

-- previsão da fila e cabeçalho dos documentos
alter table public.workshop_settings add column if not exists print_hours_per_day numeric not null default 16 check (print_hours_per_day > 0 and print_hours_per_day <= 24);
alter table public.workshop_settings add column if not exists business_name text;

create table if not exists public.production_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  sale_id uuid references public.sales on delete set null,
  part_id uuid references public.parts on delete set null,
  filament_id uuid references public.filaments on delete set null,
  description text not null,
  qty int not null check (qty > 0),
  print_minutes int not null default 0 check (print_minutes >= 0), -- total da ordem
  grams numeric not null default 0 check (grams >= 0),              -- total da ordem
  plates int not null default 1 check (plates >= 1),
  status text not null default 'fila' check (status in ('fila', 'imprimindo', 'pronto', 'entregue')),
  due_on date,
  notes text,
  started_at timestamptz,
  finished_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  number int not null check (number > 0),
  kind text not null check (kind in ('orcamento', 'recibo')),
  customer_name text not null,
  customer_phone text,
  items jsonb not null default '[]'::jsonb,
  discount numeric not null default 0 check (discount >= 0),
  shipping numeric not null default 0 check (shipping >= 0),
  notes text,
  valid_days int not null default 7 check (valid_days between 1 and 90),
  converted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, number)
);

create index if not exists jobs_user_status_idx on public.production_jobs (user_id, status);
create index if not exists quotes_user_idx on public.quotes (user_id, created_at desc);

alter table public.production_jobs enable row level security;
alter table public.quotes enable row level security;

do $$
declare t text;
begin
  foreach t in array array['production_jobs', 'quotes'] loop
    execute format('drop policy if exists "dono" on public.%I', t);
    execute format('create policy "dono" on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
  end loop;
end $$;

-- referências (venda/peça/filamento) precisam ser do mesmo dono
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
  elsif tg_table_name = 'production_jobs' then
    if new.sale_id is not null and not exists (select 1 from sales where id = new.sale_id and user_id = new.user_id) then
      raise exception 'venda inválida';
    end if;
    if new.part_id is not null and not exists (select 1 from parts where id = new.part_id and user_id = new.user_id) then
      raise exception 'peça inválida';
    end if;
    if new.filament_id is not null and not exists (select 1 from filaments where id = new.filament_id and user_id = new.user_id) then
      raise exception 'filamento inválido';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists jobs_same_owner on public.production_jobs;
create trigger jobs_same_owner before insert or update on public.production_jobs for each row execute function public.lab_same_owner();

revoke all on public.production_jobs, public.quotes from anon;
