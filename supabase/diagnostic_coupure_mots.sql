-- =============================================================
-- IAMESRESSOURCES : d'où vient la coupure des mots ?
-- À exécuter dans Supabase > SQL Editor, requête par requête.
-- =============================================================
-- Ce script ne modifie rien. Il inspecte le contenu stocké pour
-- identifier ce qui offre au navigateur un point de coupure au
-- milieu d'un mot. Quatre pistes sont examinées.
-- =============================================================


-- -------------------------------------------------------------
-- PISTE 1 : inventaire des caractères invisibles réellement présents.
-- La colonne codepoint dit exactement lequel, ce qui permet de le
-- traiter même s'il n'était pas prévu.
-- -------------------------------------------------------------
select
  r.id,
  r.title,
  'U+' || upper(lpad(to_hex(ascii(c.ch)), 4, '0')) as codepoint,
  count(*) as occurrences
from public.resources r
cross join lateral regexp_split_to_table(r.description, '') as c(ch)
where r.description is not null
  and ascii(c.ch) in (
    160, 173, 5760, 6158,
    8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201, 8202,
    8203, 8204, 8205, 8206, 8207, 8232, 8233,
    8234, 8235, 8236, 8237, 8238, 8239,
    8287, 8288, 8289, 8290, 8291,
    12288, 65279
  )
group by 1, 2, 3
order by r.id, occurrences desc;


-- -------------------------------------------------------------
-- PISTE 2 : entités HTML invisibles restées sous forme de texte.
-- -------------------------------------------------------------
select
  id,
  title,
  (regexp_matches(
     description,
     '&(#x?0*(a0|ad|2000|2009|200b|200c|200d|200e|200f|2028|2029|202f|2060|feff|160|173|8203|8204|8205|8232|8239|8288|65279)|shy|nbsp|thinsp|ensp|emsp|ZeroWidthSpace|zwnj|zwj|lrm|rlm|NoBreak);',
     'gi'))[1] as entite
from public.resources
where description is not null;


-- -------------------------------------------------------------
-- PISTE 3 : un saut de ligne ou une balise placés au milieu d'un mot.
-- Un <br> entre deux lettres force une coupure, et un retour à la
-- ligne du texte source y ressemble beaucoup à l'affichage.
-- -------------------------------------------------------------
select
  id,
  title,
  case
    when description ~ '[[:alpha:]]<[[:space:]]*br[[:space:]]*[/]?[[:space:]]*>[[:alpha:]]' then 'balise br au milieu d''un mot'
    when description ~ '[[:alpha:]]<[[:space:]]*wbr' then 'balise wbr au milieu d''un mot'
    when description ~ E'[[:alpha:]]\n[[:alpha:]]' then 'retour a la ligne au milieu d''un mot'
    when description ~ E'[[:alpha:]]\r[[:alpha:]]' then 'retour chariot au milieu d''un mot'
  end as anomalie
from public.resources
where description is not null
  and (description ~ '[[:alpha:]]<[[:space:]]*br[[:space:]]*[/]?[[:space:]]*>[[:alpha:]]'
    or description ~ '[[:alpha:]]<[[:space:]]*wbr'
    or description ~ E'[[:alpha:]][\n\r][[:alpha:]]');


-- -------------------------------------------------------------
-- PISTE 4 : le contexte brut autour du mot qui se coupe.
-- Remplacez 'cer' et 'tains' par les deux moitiés que vous voyez
-- à l'écran. La colonne octets montre ce qui se cache entre elles.
-- -------------------------------------------------------------
select
  id,
  title,
  (regexp_matches(description, '(.{0,25}cer.{0,10}tains.{0,25})', 'i'))[1] as contexte,
  encode(convert_to((regexp_matches(description, 'cer(.{0,10})tains', 'i'))[1], 'UTF8'), 'hex') as octets_entre_les_deux
from public.resources
where description ~* 'cer.{0,10}tains';
