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
// mots en plein milieu ("int / erne", "conditio / ns") dans les articles.
//   U+00AD trait d'union conditionnel
//   U+200B espace de largeur nulle
//   U+200C, U+200D liants de largeur nulle
//   U+2060 gluon de mots
//   U+FEFF marque d'ordre des octets
const INVISIBLE_BREAKS = /[\u00AD\u200B\u200C\u200D\u2060\uFEFF]/g;

// Balise <wbr> : même effet, point de coupure explicite.
const WBR_TAG = /<\s*wbr\s*\/?\s*>/gi;

export function stripInvisibleBreaks(text: string): string {
  if (!text) return '';
  return text.replace(WBR_TAG, '').replace(INVISIBLE_BREAKS, '');
}

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(stripInvisibleBreaks(html), {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Bloque javascript:, data: et autres schémas dangereux dans les href.
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  });
}
