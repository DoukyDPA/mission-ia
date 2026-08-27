// src/lib/utils.ts
import { stripInvisibleBreaks } from './sanitize';

export const getYoutubeId = (url?: string | null) => {
    if (!url) return null;
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

/** Miniature YouTube d'une ressource vidéo. */
export const getYoutubeThumbnail = (url?: string | null) => {
    const id = getYoutubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};

/** Première image trouvée dans le corps HTML d'un article. */
export const getFirstImageFromHtml = (html?: string | null) => {
    if (!html) return null;
    const match = html.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : null;
};

/** Texte brut extrait d'un corps HTML, pour les extraits de cartes. */
export const getSnippet = (html?: string | null) => {
    if (!html) return '';
    let text = html
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"');
    text = text.replace(/<[^>]+>/g, ' ');
    text = text.replace(/&nbsp;/g, ' ').replace(/&[a-z0-9#]+;/gi, '');
    return stripInvisibleBreaks(text).replace(/\s+/g, ' ').trim();
};

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
              'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/** Date longue en français, à partir d'un timestamp ISO. */
export const formatDateFr = (iso?: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return `${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;
};

/** « il y a 3 jours », pour signaler la fraîcheur d'une publication. */
export const timeAgoFr = (iso?: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const jours = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (jours <= 0) return "aujourd'hui";
    if (jours === 1) return 'hier';
    if (jours < 7) return `il y a ${jours} jours`;
    if (jours < 14) return 'la semaine dernière';
    if (jours < 60) return `il y a ${Math.floor(jours / 7)} semaines`;
    return `il y a ${Math.floor(jours / 30)} mois`;
};

/** Une publication de moins de 15 jours est signalée comme nouvelle. */
export const estRecent = (iso?: string | null) => {
    if (!iso) return false;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return false;
    return (Date.now() - d.getTime()) < 15 * 86400000;
};
