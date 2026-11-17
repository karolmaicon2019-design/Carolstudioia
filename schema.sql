-- Execute no SQL Editor do projeto Supabase dedicado ao Carol Digital Studio.
create table if not exists public.carol_leads (
 id uuid primary key default gen_random_uuid(),
 protocol text not null unique,
 nome text not null,
 email text,
 empresa text,
 servico text not null,
 ideia text not null,
 conversation jsonb not null default '[]'::jsonb,
 status text not null default 'aguardando_orcamento' check (status in ('aguardando_orcamento','em_analise','proposta_pronta','concluido')),
 preco_final numeric(12,2) check (preco_final is null or preco_final >= 0),
 resposta text not null default '',
 created_at timestamptz not null default now()
);
alter table public.carol_leads enable row level security;
-- Nenhuma policy pública: acesso exclusivamente pelo servidor com service_role.
revoke all on public.carol_leads from anon, authenticated;
create index if not exists carol_leads_created_at_idx on public.carol_leads(created_at desc);
