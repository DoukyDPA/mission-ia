// src/lib/sanitize.ts
// Nettoyage du HTML avant injection via dangerouslySetInnerHTML.
// L'ancienne fonction ne retirait que les attributs style et &nbsp,
// ce qui laissait passer <script>, onerror=, onclick=... donc un XSS stocké.
// DOMPurify applique une allowlist stricte de balises et d'attributs.
import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
  'p', 'br', 'b', 'strong', 'i', 'em', 'u', 's',
  'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4',
  'blockquote', 'span', 'div', 'code', 'pre',
];

const ALLOWED_ATTR = ['href', 'target', 'rel'];

// Caractères invisibles que les sites sources glissent dans leur HTML et que
// le navigateur traite comme des points de césure. C'est ce qui coupe les mots
// en plein milieu ("et cer / tains", "des i / nformations").
//   U+00AD trait d'union conditionnel      U+180E séparateur mongol
//   U+200B espace de largeur nulle         U+200C, U+200D liants
//   U+200E, U+200F marques directionnelles U+2060 gluon de mots
//   U+2061 à U+2064 opérateurs invisibles  U+FEFF marque d'ordre des octets
// L'espace insécable U+00A0 et l'espace fine insécable U+202F sont VOLONTAIREMENT
// laissés : ils portent la typographie française et ne coupent pas les mots.
const INVISIBLE_BREAKS = /[\u00AD\u180E\u200B-\u200F\u2060-\u2064\uFEFF]/g;

// Séparateurs de ligne et de paragraphe Unicode : ils forcent une coupure.
// On les ramène à une espace ordinaire plutôt que de les supprimer.
const SEPARATEURS_LIGNE = /[\u2028\u2029]/g;

// Les mêmes, écrits en entités HTML. Il faut les traiter à part : un simple
// nettoyage du texte ne les voit pas, ce sont des suites de caractères ASCII.
const ENTITES_INVISIBLES = /&(?:#x?0*(?:ad|8203|200b|200c|200d|200e|200f|2060|feff|173|8204|8205|8206|8207|8288|65279)|shy|ZeroWidthSpace|zwnj|zwj|lrm|rlm|NoBreak|InvisibleTimes|InvisibleComma);/gi;

// Balise <wbr> : point de coupure explicite, où qu'elle soit.
const WBR_TAG = /<\s*wbr\s*\/?\s*>/gi;

// PAS de réparation des <br> ni des retours à la ligne coincés entre deux
// lettres, même si c'est une cause possible de coupure. Un <br> légitime en
// fin de phrase est presque toujours précédé d'une lettre et suivi d'une
// lettre : impossible de distinguer les deux cas sans casser la mise en page.
// Le script supabase/diagnostic_coupure_mots.sql les repère, la correction se
// fait alors dans le contenu, pas dans le code.

// L'ESPACE INSÉCABLE (U+00A0, &nbsp;) : la vraie cause des mots coupés.
// Des éditeurs comme Word ou Google Docs remplacent TOUTES les espaces d'un
// texte collé par des insécables. Le paragraphe devient alors un seul mot
// géant, que le navigateur ne peut couper nulle part. Comme il doit bien
// tenir dans la colonne, il le coupe n'importe où, d'où "et cer / tains"
// avec un bord droit parfaitement aligné.
//
// On les ramène donc à des espaces ordinaires, SAUF là où la typographie
// française les exige : devant les ponctuations doubles et le signe pour
// cent, et derrière le guillemet ouvrant.
const ENTITE_NBSP = /&nbsp;/gi;
const PONCTUATION_INSECABLE = ';:!?»%€';

function normaliseInsecables(text: string): string {
  return text.replace(ENTITE_NBSP, '\u00A0').replace(/\u00A0/g, (_m, i: number, chaine: string) => {
    const suivant = chaine[i + 1];
    const precedent = chaine[i - 1];
    if (suivant && PONCTUATION_INSECABLE.includes(suivant)) return '\u00A0';
    if (precedent === '\u00AB') return '\u00A0';
    return ' ';
  });
}

export function stripInvisibleBreaks(text: string): string {
  if (!text) return '';
  return normaliseInsecables(text)
    .replace(WBR_TAG, '')
    .replace(ENTITES_INVISIBLES, '')
    .replace(SEPARATEURS_LIGNE, ' ')
    .replace(INVISIBLE_BREAKS, '');
}

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  // Le nettoyage passe DEUX fois, et c'est volontaire. Avant DOMPurify pour
  // retirer les <wbr> et les entités. Après DOMPurify, parce qu'il décode les
  // entités qu'il rencontre : une entité restée tapie dans un attribut ou une
  // forme exotique ressortirait sinon en vrai caractère invisible.
  const propre = DOMPurify.sanitize(stripInvisibleBreaks(html), {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Bloque javascript:, data: et autres schémas dangereux dans les href.
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  });
  return stripInvisibleBreaks(propre);
}
