-- =============================================================
-- IAMESRESSOURCES : Durcissement RLS (APPLIQUÉ en production)
-- Migration Supabase : security_rls_hardening + security_definer_hardening
-- =============================================================
-- Constat avant correctif (vérifié sur la base en ligne) :
--   - profiles : un non-admin pouvait modifier sa ligne, donc son rôle
--     => escalade de privilèges. Corrigé par trigger.
--   - structures : DELETE ouvert à tout connecté.
--   - allowed_domains : INSERT/DELETE ouverts à tout connecté.
--   - prompts / resources : SELECT lisible par anon (Internet public).
-- La lecture publique de structures et allowed_domains est conservée :
-- l'écran de login en a besoin avant authentification.
-- =============================================================

-- Helper admin (SECURITY DEFINER pour éviter la récursion RLS sur profiles)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and lower(trim(role)) = 'admin'
  );
$$;

-- --- PROFILES : empêcher un non-admin de changer son propre rôle ---
create or replace function public.prevent_self_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.role is distinct from old.role) and not public.is_admin() then
    raise exception 'Modification du rôle interdite';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_role_change on public.profiles;
create trigger trg_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_self_role_change();

-- --- STRUCTURES : retirer insert/delete ouverts (admin ALL déjà en place) ---
drop policy if exists "Ajout structures pour connectés" on public.structures;
drop policy if exists "Suppression structures pour connectés" on public.structures;

-- --- ALLOWED_DOMAINS : insert/delete réservés à l'admin ---
drop policy if exists "Les utilisateurs connectés peuvent ajouter des domaines" on public.allowed_domains;
drop policy if exists "Les utilisateurs peuvent supprimer des domaines" on public.allowed_domains;

create policy "domains_insert_admin" on public.allowed_domains
  for insert with check ( public.is_admin() );
create policy "domains_delete_admin" on public.allowed_domains
  for delete using ( public.is_admin() );

-- --- PROMPTS : couper la lecture anonyme, override admin ---
drop policy if exists "Lecture publique des prompts" on public.prompts;
drop policy if exists "Voir les prompts" on public.prompts;

create policy "prompts_select_authenticated" on public.prompts
  for select to authenticated
  using (
    public.is_admin()
    or structure_id = (select structure_id from public.profiles where id = auth.uid())
    or structure_id is null
  );

create policy "prompts_admin_all" on public.prompts
  for all using ( public.is_admin() ) with check ( public.is_admin() );

-- --- RESOURCES : couper la lecture anonyme et l'insert ouvert ---
drop policy if exists "Lecture publique des ressources" on public.resources;
drop policy if exists "Ajout de ressources autorisé" on public.resources;

create policy "resources_admin_all" on public.resources
  for all using ( public.is_admin() ) with check ( public.is_admin() );

-- --- Durcissement des fonctions SECURITY DEFINER ---
-- Les fonctions trigger ne doivent jamais être appelées via l'API REST.
revoke execute on function public.log_audit_event() from public, anon, authenticated;
revoke execute on function public.prevent_self_role_change() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
alter function public.handle_new_user() set search_path = public;

-- =============================================================
-- Vérification : aucune lecture anon hors allowed_domains
--   select tablename, policyname, cmd, roles from pg_policies
--   where schemaname='public' and 'anon' = any(roles);
-- =============================================================
