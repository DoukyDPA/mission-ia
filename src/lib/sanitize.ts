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

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Bloque javascript:, data: et autres schémas dangereux dans les href.
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  });
}
