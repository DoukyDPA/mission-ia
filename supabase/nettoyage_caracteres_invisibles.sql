-- =============================================================
-- IAMESRESSOURCES : nettoyage des caractères de césure invisibles
-- À exécuter dans Supabase > SQL Editor. Facultatif mais recommandé.
-- =============================================================
-- Les contenus collés depuis certains sites contiennent des espaces de
-- largeur nulle (U+200B) semés entre les caractères, souvent écrits en
-- entités HTML (&#8203;). Le navigateur les traite comme des points de
-- césure : chaque ligne se remplit jusqu'au bord et les mots se coupent
-- en plein milieu. Aucune règle CSS ne corrige cela, il faut retirer
-- les caractères.
--
-- L'application les retire déjà à l'affichage et à l'enregistrement.
-- Ce script les retire de la base, pour que la recherche, les extraits
-- et les exports travaillent sur un texte propre.
--
-- Note : ce fichier n'utilise volontairement aucun commentaire de bloc.
-- Les expressions régulières contiennent la séquence */ , qui fermerait
-- le commentaire en plein milieu et casserait le script.
-- =============================================================

-- -------------------------------------------------------------
-- ÉTAPE 1 : diagnostic. Quelles ressources sont touchées, et de combien.
-- Lancez ce bloc seul et regardez le résultat.
-- -------------------------------------------------------------
with nettoye as (
  select
    id,
    title,
    description,
    regexp_replace(
      regexp_replace(
        regexp_replace(description, '<[[:space:]]*wbr[[:space:]]*[/]?[[:space:]]*>', '', 'gi'),
        '&(#x?0*(ad|8203|200b|200c|200d|2060|feff|173|8204|8205|8288|65279)|shy|ZeroWidthSpace|zwnj|zwj);', '', 'gi'),
      E'[\u00AD\u200B\u200C\u200D\u2060\uFEFF]', '', 'g') as propre
  from public.resources
  where description is not null
)
select
  id,
  title,
  length(description) as taille_actuelle,
  length(propre)      as taille_nettoyee,
  length(description) - length(propre) as caracteres_parasites
from nettoye
where length(description) <> length(propre)
order by caracteres_parasites desc;

-- -------------------------------------------------------------
-- ÉTAPE 2 : nettoyage. À lancer après avoir regardé le diagnostic.
-- -------------------------------------------------------------
update public.resources
set description = regexp_replace(
      regexp_replace(
        regexp_replace(description, '<[[:space:]]*wbr[[:space:]]*[/]?[[:space:]]*>', '', 'gi'),
        '&(#x?0*(ad|8203|200b|200c|200d|2060|feff|173|8204|8205|8288|65279)|shy|ZeroWidthSpace|zwnj|zwj);', '', 'gi'),
      E'[\u00AD\u200B\u200C\u200D\u2060\uFEFF]', '', 'g')
where description is not null
  and (
    description ~ E'[\u00AD\u200B\u200C\u200D\u2060\uFEFF]'
    or description ~* '&(#x?0*(ad|8203|200b|200c|200d|2060|feff|173|8204|8205|8288|65279)|shy|ZeroWidthSpace|zwnj|zwj);'
    or description ~* '<[[:space:]]*wbr[[:space:]]*[/]?[[:space:]]*>'
  );

update public.resources
set title = regexp_replace(title, E'[\u00AD\u200B\u200C\u200D\u2060\uFEFF]', '', 'g')
where title ~ E'[\u00AD\u200B\u200C\u200D\u2060\uFEFF]';

-- -------------------------------------------------------------
-- ÉTAPE 3 : vérification. Relancez le diagnostic de l'étape 1,
-- il ne doit plus renvoyer aucune ligne.
-- -------------------------------------------------------------
