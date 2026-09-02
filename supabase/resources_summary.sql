-- =============================================================
-- IAMESRESSOURCES : résumé texte des ressources
-- À exécuter dans Supabase > SQL Editor.
-- =============================================================
-- Ajoute une colonne `summary` sur public.resources : un court texte
-- de présentation, saisi à la main dans le formulaire d'ajout, affiché
-- sur la page Veille dans un bloc dépliable sous la carte.
--
-- La colonne est nullable et sans valeur par défaut : les ressources
-- déjà publiées restent telles quelles, et rien ne s'affiche tant que
-- le champ est vide.
--
-- Le champ `description` n'est PAS réutilisé : il porte le corps HTML
-- des articles, il est rendu via dangerouslySetInnerHTML et vaut ''
-- pour les vidéos, les liens et les fichiers.
-- =============================================================

alter table public.resources
  add column if not exists summary text;

comment on column public.resources.summary is
  'Résumé court saisi à la main, affiché dans le bloc dépliable de la page Veille. Texte brut, pas de HTML.';

-- --- Vérification -------------------------------------------------
-- select column_name, data_type, is_nullable
-- from information_schema.columns
-- where table_schema = 'public' and table_name = 'resources'
--   and column_name = 'summary';
-- =============================================================
