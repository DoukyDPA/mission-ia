-- =============================================================
-- IAMESRESSOURCES : remise à plat des espaces et des caractères invisibles
-- À exécuter dans Supabase > SQL Editor. Recommandé.
-- =============================================================
-- CAUSE PRINCIPALE DES MOTS COUPÉS : l'espace insécable.
-- Word, Google Docs et plusieurs sites remplacent TOUTES les espaces d'un
-- texte par des insécables (&nbsp;). Le paragraphe devient alors un seul
-- mot géant que le navigateur ne peut couper nulle part. Comme il doit
-- bien tenir dans la colonne, il le coupe n'importe où : "et cer / tains",
-- avec un bord droit parfaitement aligné.
--
-- CAUSE SECONDAIRE : les espaces de largeur nulle (U+200B) et compagnie,
-- qui offrent au contraire des points de coupure au milieu des mots.
--
-- L'application corrige déjà les deux à l'affichage et à l'enregistrement.
-- Ce script corrige la base, pour que la recherche, les extraits et les
-- exports travaillent sur un texte propre.
--
-- Note : pas de commentaire de bloc dans ce fichier. Les expressions
-- régulières contiennent la séquence */ , qui le fermerait en plein milieu.
-- =============================================================


-- -------------------------------------------------------------
-- ÉTAPE 1 : diagnostic. Combien d'espaces insécables par ressource,
-- et combien de caractères parasites au total.
-- -------------------------------------------------------------
select
  id,
  title,
  (length(description) - length(replace(description, chr(160), ''))) as insecables_bruts,
  (select count(*) from regexp_matches(description, '&nbsp;', 'gi')) as insecables_en_entites,
  (length(description) - length(regexp_replace(description, E'[\u00AD\u180E\u200B-\u200F\u2060-\u2064\uFEFF]', '', 'g'))) as caracteres_invisibles,
  (select count(*) from regexp_matches(description, '&(#x?0*(ad|8203|200b|200c|200d|200e|200f|2060|feff|173|8204|8205|8206|8207|8288|65279)|shy|ZeroWidthSpace|zwnj|zwj|lrm|rlm);', 'gi')) as invisibles_en_entites
from public.resources
where description is not null
  and (description like '%' || chr(160) || '%'
    or description ~* '&nbsp;'
    or description ~ E'[\u00AD\u180E\u200B-\u200F\u2060-\u2064\uFEFF]'
    or description ~* '&(#x?0*(ad|8203|200b|200c|200d|200e|200f|2060|feff|173|8204|8205|8206|8207|8288|65279)|shy|ZeroWidthSpace|zwnj|zwj|lrm|rlm);')
order by 3 desc, 4 desc, 5 desc;


-- -------------------------------------------------------------
-- ÉTAPE 2 : nettoyage.
-- Les insécables redeviennent des espaces ordinaires, SAUF devant les
-- ponctuations doubles et le signe pour cent, où la typographie française
-- les exige. Les caractères invisibles et les <wbr> partent entièrement.
-- -------------------------------------------------------------
update public.resources
set description =
  regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(description, '<[[:space:]]*wbr[[:space:]]*[/]?[[:space:]]*>', '', 'gi'),
          '&(#x?0*(ad|8203|200b|200c|200d|200e|200f|2060|feff|173|8204|8205|8206|8207|8288|65279)|shy|ZeroWidthSpace|zwnj|zwj|lrm|rlm);', '', 'gi'),
        E'[\u00AD\u180E\u200B-\u200F\u2060-\u2064\uFEFF]', '', 'g'),
      '&nbsp;(?![;:!?%])', ' ', 'gi'),
    chr(160) || '(?![;:!?%])', ' ', 'g')
where description is not null
  and (description like '%' || chr(160) || '%'
    or description ~* '&nbsp;'
    or description ~ E'[\u00AD\u180E\u200B-\u200F\u2060-\u2064\uFEFF]'
    or description ~* '&(#x?0*(ad|8203|200b|200c|200d|200e|200f|2060|feff|173|8204|8205|8206|8207|8288|65279)|shy|ZeroWidthSpace|zwnj|zwj|lrm|rlm);'
    or description ~* '<[[:space:]]*wbr');

update public.resources
set title = regexp_replace(
      regexp_replace(title, E'[\u00AD\u180E\u200B-\u200F\u2060-\u2064\uFEFF]', '', 'g'),
      chr(160), ' ', 'g')
where title ~ E'[\u00AD\u180E\u200B-\u200F\u2060-\u2064\uFEFF]'
   or title like '%' || chr(160) || '%';


-- -------------------------------------------------------------
-- ÉTAPE 3 : vérification. Relancez le diagnostic de l'étape 1.
-- Il ne doit plus rester que des insécables devant les ponctuations
-- doubles, ce qui est le comportement voulu.
-- -------------------------------------------------------------
