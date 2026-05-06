-- Supabase schema for shared expense app
-- Execute this file in Supabase SQL Editor.

-- pgcrypto: extensão do PostgreSQL que fornece funções criptográficas e geração de UUIDs
-- Necessária para gen_random_uuid() que usamos nos IDs das tabelas
create extension if not exists pgcrypto;

-- 1) Users profile table (linked to auth.users)
-- Armazena dados de perfil do usuário criado no cadastro
-- id: vinculado ao auth.users do Supabase (gerencia autenticação)
-- on delete cascade: se usuário for deletado do auth, deleta também o perfil
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  created_at timestamptz not null default now()
);

-- 2) Groups table
-- Armazena os grupos de despesas (República, Churrasco, Viagem, etc)
-- id: gerado aleatoriamente com gen_random_uuid() (precisa de pgcrypto)
-- created_by: referência ao usuário que criou o grupo
-- on delete restrict: não permite deletar usuário se ele criou grupos (segurança)
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references public.users (id) on delete restrict,
  created_at timestamptz not null default now()
);

-- 3) Group members (many-to-many users <-> groups)
-- Tabela associativa: vincula quais usuários pertencem a quais grupos
-- primary key (group_id, user_id): garante que um usuário appears só uma vez por grupo
-- role: identifica se é 'owner' (criou o grupo) ou 'member' (convidado)
-- on delete cascade: se deletar grupo/usuário, remove a associação automaticamente
create table if not exists public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- 4) Expenses table
-- Registra todas as despesas lançadas nos grupos
-- paid_by: usuário que pagou
-- amount: valor da despesa (numeric para precisão em moeda, check garante > 0)
-- description: o que foi comprado ("Supermercado", "Gasolina", etc)
-- receipt_url: link da foto do recibo armazenado no Supabase Storage
-- on delete restrict em paid_by: não permite deletar usuário com despesas (rastreabilidade)
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  paid_by uuid not null references public.users (id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  description text not null,
  receipt_url text,
  created_at timestamptz not null default now()
);

-- Índices: criam "atalhos" no banco para acelerar consultas frequentes
-- Sem índice: banco varre todas as linhas (lento com muitos dados)
-- Com índice: banco vai direto nas linhas relevantes (rápido)

-- idx_group_members_user_id: acelera consulta "quais grupos esse usuário pertence"
-- Exemplo: select group_id from group_members where user_id = '...';
create index if not exists idx_group_members_user_id on public.group_members (user_id);

-- idx_expenses_group_id: acelera consulta "listar despesas de um grupo"
-- Exemplo: select * from expenses where group_id = '...' order by created_at desc;
create index if not exists idx_expenses_group_id on public.expenses (group_id);

-- idx_expenses_paid_by: acelera relatórios "quanto cada usuário pagou"
-- Exemplo: select sum(amount) from expenses where paid_by = '...';
create index if not exists idx_expenses_paid_by on public.expenses (paid_by);

-- Trigger automático: quando um grupo é criado, adiciona automaticamente o criador como owner
-- Lógica: insere uma linha em group_members com role='owner'
-- Vantagem: evita inconsistência (sempre há pelo menos um owner em cada grupo)
-- on conflict ... do nothing: ignora se já existe (idempotente)

create or replace function public.add_group_creator_as_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.group_members (group_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict (group_id, user_id) do nothing;

  return new;
end;
$$;

-- Executa a função automaticamente após inserção em groups
drop trigger if exists trg_add_group_creator_as_owner on public.groups;
create trigger trg_add_group_creator_as_owner
after insert on public.groups
for each row
execute function public.add_group_creator_as_owner();

-- RLS (Row Level Security) e policies serão implementados em uma etapa futura.
-- Quando implementado, garantirá que:
-- - Usuário vê só dados de grupos aos quais pertence
-- - Usuário só edita/deleta suas próprias despesas
-- - Dono do grupo controla membros