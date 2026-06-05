-- =============================================================
-- IAMESRESSOURCES : Journalisation et traçabilité (pilier Preuve)
-- =============================================================
-- Table d'audit + triggers sur les tables sensibles.
-- La trace est posée au niveau base : un client modifié ne peut
-- pas la contourner. La table est en écriture seule pour les
-- utilisateurs, lisible uniquement par un admin.
-- =============================================================

create table if not exists public.audit_logs (
  id            bigint generated always as identity primary key,
  user_id       uuid,
  user_email    text,
  action        text not null,            -- INSERT | UPDATE | DELETE
  table_cible   text not null,
  record_id     text,
  old_values    jsonb,
  new_values    jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists idx_audit_logs_created_at on public.audit_logs (created_at desc);
create index if not exists idx_audit_logs_user on public.audit_logs (user_id);
create index if not exists idx_audit_logs_table on public.audit_logs (table_cible);

-- --- Sécurité : lecture admin uniquement, aucune écriture directe ---
alter table public.audit_logs enable row level security;

drop policy if exists "audit_select_admin" on public.audit_logs;
create policy "audit_select_admin" on public.audit_logs
  for select using ( public.is_admin() );

-- Pas de policy INSERT/UPDATE/DELETE : seul le trigger (SECURITY DEFINER)
-- écrit dans la table. Les clients ne peuvent ni insérer ni modifier.

-- --- Fonction de trigger générique ---
create or replace function public.log_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_record_id text;
  v_email text;
begin
  v_record_id := coalesce(
    (case when tg_op = 'DELETE' then old.id else new.id end)::text,
    null
  );

  select email into v_email from auth.users where id = auth.uid();

  insert into public.audit_logs (user_id, user_email, action, table_cible, record_id, old_values, new_values)
  values (
    auth.uid(),
    v_email,
    tg_op,
    tg_table_name,
    v_record_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('UPDATE', 'INSERT') then to_jsonb(new) else null end
  );

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

-- --- Branchement des triggers sur les tables sensibles ---
-- Profiles (changements de rôle et de structure)
drop trigger if exists trg_audit_profiles on public.profiles;
create trigger trg_audit_profiles
  after insert or update or delete on public.profiles
  for each row execute function public.log_audit_event();

-- Structures
drop trigger if exists trg_audit_structures on public.structures;
create trigger trg_audit_structures
  after insert or update or delete on public.structures
  for each row execute function public.log_audit_event();

-- Domaines autorisés (contrôle des accès)
drop trigger if exists trg_audit_domains on public.allowed_domains;
create trigger trg_audit_domains
  after insert or update or delete on public.allowed_domains
  for each row execute function public.log_audit_event();

-- =============================================================
-- Consultation (admin) :
--   select created_at, user_email, action, table_cible, record_id
--   from public.audit_logs
--   order by created_at desc
--   limit 100;
--
-- Les événements d'authentification (connexions, échecs, resets)
-- sont déjà tracés par Supabase : Dashboard > Logs > Auth.
-- Pense à définir une durée de rétention conforme RGPD.
-- =============================================================
