-- Taxa do canal congelada no momento da venda: mudar a taxa em "Minha oficina"
-- não reescreve os meses passados. Vendas antigas (null) usam a taxa atual.
alter table public.sales add column if not exists unit_fee numeric check (unit_fee >= 0);
