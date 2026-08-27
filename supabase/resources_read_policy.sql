-- =============================================================
-- IAMESRESSOURCES : rétablissement de la lecture des ressources
-- À exécuter dans Supabase > SQL Editor.
-- =============================================================
-- Constat (27/08/2026) : depuis la migration sécurité de juin, la
-- seule politique restante sur public.resources est resources_admin_all.
-- Conséquence : un conseiller non-admin ne voit AUCUNE ressource.
--
-- Cette politique rétablit la lecture pour les comptes connectés et
-- active enfin les colonnes access_scope / target_structure_id, qui
-- existaient déjà en base mais n'étaient jamais exploitées :
--   access_scope = 'global'    -> socle commun, visible de tous
--   access_scope = 'structure' -> réservé à target_structure_id
-- Les lignes existantes sont toutes en 'global', elles redeviennent
-- donc visibles immédiatement.
-- La lecture anonyme reste fermée.
-- =============================================================

drop policy if exists "resources_select_authenticated" on public.resources;

create policy "resources_select_authenticated" on public.resources
  for select to authenticated
  using (
    public.is_admin()
    or coalesce(access_scope, 'global') = 'global'
    or target_structure_id = (
         select structure_id from public.profiles where id = auth.uid()
       )
  );

-- --- Vérification -------------------------------------------------
-- 1. Lister les politiques actives sur resources :
--    select policyname, cmd, roles from pg_policies
--    where schemaname = 'public' and tablename = 'resources';
--
-- 2. Confirmer qu'aucune lecture anonyme n'a été rouverte :
--    select tablename, policyname, cmd, roles from pg_policies
--    where schemaname = 'public' and 'anon' = any(roles);
-- =============================================================
