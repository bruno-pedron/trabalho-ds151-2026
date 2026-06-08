-- Supabase RLS policies for shared expense app
-- Execute this file after supabase/schema.sql
--
-- Objetivo:
-- 1) Cada usuario acessa apenas os dados dos grupos dos quais participa.
-- 2) Usuarios so manipulam o proprio perfil.
-- 3) Insercao/gestao de membros fica restrita aos donos do grupo.
-- 4) Despesas sao visiveis para membros do grupo e editaveis apenas por quem pagou.

-- =====================================================
-- 1) Helper functions (evitam repeticao e recursion nas policies)
-- =====================================================

create or replace function public.is_group_member(_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = _group_id
      and gm.user_id = auth.uid()
  );
$$;

create or replace function public.is_group_owner(_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = _group_id
      and gm.user_id = auth.uid()
      and gm.role = 'owner'
  );
$$;

revoke all on function public.is_group_member(uuid) from public;
revoke all on function public.is_group_owner(uuid) from public;
grant execute on function public.is_group_member(uuid) to authenticated;
grant execute on function public.is_group_owner(uuid) to authenticated;

-- =====================================================
-- 2) Enable RLS
-- =====================================================

alter table public.users enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.expenses enable row level security;

-- =====================================================
-- 3) USERS policies
-- =====================================================

-- Usuario autenticado ve o proprio perfil e perfis de usuarios do mesmo grupo.
-- Insercao so pode acontecer com id = auth.uid().
drop policy if exists users_select_own on public.users;
create policy users_select_own
on public.users
for select
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1
    from public.group_members gm_me
    join public.group_members gm_other
      on gm_other.group_id = gm_me.group_id
    where gm_me.user_id = auth.uid()
      and gm_other.user_id = users.id
  )
);

drop policy if exists users_insert_own on public.users;
create policy users_insert_own
on public.users
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists users_update_own on public.users;
create policy users_update_own
on public.users
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- =====================================================
-- 4) GROUPS policies
-- =====================================================

-- Usuario ve somente grupos em que participa.
drop policy if exists groups_select_member on public.groups;
create policy groups_select_member
on public.groups
for select
to authenticated
using (public.is_group_member(id));

-- Criacao de grupo exige created_by = auth.uid().
drop policy if exists groups_insert_creator on public.groups;
create policy groups_insert_creator
on public.groups
for insert
to authenticated
with check (created_by = auth.uid());

-- Somente dono do grupo pode alterar/deletar dados do grupo.
drop policy if exists groups_update_owner on public.groups;
create policy groups_update_owner
on public.groups
for update
to authenticated
using (public.is_group_owner(id))
with check (public.is_group_owner(id));

drop policy if exists groups_delete_owner on public.groups;
create policy groups_delete_owner
on public.groups
for delete
to authenticated
using (public.is_group_owner(id));

-- =====================================================
-- 5) GROUP_MEMBERS policies
-- =====================================================

-- Membro do grupo pode listar os membros daquele grupo.
drop policy if exists group_members_select_member on public.group_members;
create policy group_members_select_member
on public.group_members
for select
to authenticated
using (public.is_group_member(group_id));

-- Somente owner pode adicionar membros no grupo.
-- Mantem o requisito: usuario so ve/adiciona dados de grupos permitidos.
drop policy if exists group_members_insert_owner on public.group_members;
create policy group_members_insert_owner
on public.group_members
for insert
to authenticated
with check (public.is_group_owner(group_id));

-- Somente owner pode atualizar papel de membros.
drop policy if exists group_members_update_owner on public.group_members;
create policy group_members_update_owner
on public.group_members
for update
to authenticated
using (public.is_group_owner(group_id))
with check (public.is_group_owner(group_id));

-- Somente owner pode remover membros.
drop policy if exists group_members_delete_owner on public.group_members;
create policy group_members_delete_owner
on public.group_members
for delete
to authenticated
using (public.is_group_owner(group_id));

-- =====================================================
-- 6) EXPENSES policies
-- =====================================================

-- Membro do grupo pode visualizar despesas do proprio grupo.
drop policy if exists expenses_select_member on public.expenses;
create policy expenses_select_member
on public.expenses
for select
to authenticated
using (public.is_group_member(group_id));

-- Insercao permitida apenas se:
-- - usuario faz parte do grupo
-- - paid_by = auth.uid()
drop policy if exists expenses_insert_member_paid_by_self on public.expenses;
create policy expenses_insert_member_paid_by_self
on public.expenses
for insert
to authenticated
with check (
  public.is_group_member(group_id)
  and paid_by = auth.uid()
);

-- Edicao/delecao: apenas quem pagou a despesa.
drop policy if exists expenses_update_paid_by_self on public.expenses;
create policy expenses_update_paid_by_self
on public.expenses
for update
to authenticated
using (paid_by = auth.uid())
with check (
  paid_by = auth.uid()
  and public.is_group_member(group_id)
);

drop policy if exists expenses_delete_paid_by_self on public.expenses;
create policy expenses_delete_paid_by_self
on public.expenses
for delete
to authenticated
using (paid_by = auth.uid());

-- =====================================================
-- 7) Recomendacao de grants (caso ainda nao tenha configurado)
-- =====================================================
-- O Supabase geralmente ja aplica grants basicos para authenticated.
-- Se necessario, descomente e ajuste conforme sua estrategia:
--
-- grant select, insert, update, delete on public.users to authenticated;
-- grant select, insert, update, delete on public.groups to authenticated;
-- grant select, insert, update, delete on public.group_members to authenticated;
-- grant select, insert, update, delete on public.expenses to authenticated;

-- =====================================================
-- 8) STORAGE policies (Receipts Bucket)
-- =====================================================

-- Habilita RLS na tabela de objetos do Storage (caso não esteja)
-- alter table storage.objects enable row level security;

-- Permite leitura de arquivos do bucket 'receipts' apenas para usuários autenticados
drop policy if exists "Authenticated users can view receipts" on storage.objects;
create policy "Authenticated users can view receipts"
on storage.objects
for select
to authenticated
using (bucket_id = 'receipts');

-- Permite upload de arquivos no bucket 'receipts' apenas para usuários autenticados
drop policy if exists "Authenticated users can upload receipts" on storage.objects;
create policy "Authenticated users can upload receipts"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'receipts');

-- Permite atualização do próprio arquivo no bucket 'receipts'
drop policy if exists "Users can update their own receipts" on storage.objects;
create policy "Users can update their own receipts"
on storage.objects
for update
to authenticated
using (bucket_id = 'receipts' and auth.uid() = owner)
with check (bucket_id = 'receipts' and auth.uid() = owner);

-- Permite exclusão do próprio arquivo no bucket 'receipts'
drop policy if exists "Users can delete their own receipts" on storage.objects;
create policy "Users can delete their own receipts"
on storage.objects
for delete
to authenticated
using (bucket_id = 'receipts' and auth.uid() = owner);

