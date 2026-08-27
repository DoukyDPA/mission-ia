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
// le navigateur traite comme des points de césure. C'est ce qui coupait les
// mots en plein milieu ("des i / nformations", "de m / arché") : quand ils
// sont semés à chaque caractère, chaque ligne se remplit jusqu'au bord.
//   U+00AD trait d'union conditionnel
//   U+200B espace de largeur nulle
//   U+200C, U+200D liants de largeur nulle
//   U+2060 gluon de mots
//   U+FEFF marque d'ordre des octets
const INVISIBLE_BREAKS = /[\u00AD\u200B\u200C\u200D\u2060\uFEFF]/g;

// Les mêmes, écrits en entités HTML. Il faut les traiter à part : un simple
// nettoyage du texte ne les voit pas, ce sont des suites de caractères ASCII.
const ENTITES_INVISIBLES = /&(?:#x?0*(?:ad|8203|200b|200c|200d|2060|feff|173|8204|8205|8288|65279)|shy|ZeroWidthSpace|zwnj|zwj|NoBreak|InvisibleTimes|InvisibleComma);/gi;

// Balise <wbr> : même effet, point de coupure explicite.
const WBR_TAG = /<\s*wbr\s*\/?\s*>/gi;

export function stripInvisibleBreaks(text: string): string {
  if (!text) return '';
  return text
    .replace(WBR_TAG, '')
    .replace(ENTITES_INVISIBLES, '')
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
