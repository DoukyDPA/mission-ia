// src/components/dashboard/ResourceRail.tsx
// Briques d'affichage de la veille, sur le modèle des plateformes de contenu :
// un bandeau d'affiches en haut, puis des rails horizontaux par catégorie.
// L'oeil balaie une ligne au lieu de faire défiler une grille sur trois écrans.
import React, { useRef } from 'react';
import { BookOpen, PlayCircle, FileText, Link as LinkIcon, ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { Resource } from '@/types';
import { getFirstImageFromHtml, getYoutubeThumbnail, formatDateFr, timeAgoFr, estRecent } from '@/lib/utils';

export type Famille = 'article' | 'video' | 'document' | 'lien';

export const familleDe = (r: Resource): Famille => {
  if (r.type === 'text') return 'article';
  if (r.type === 'video') return 'video';
  if (r.type === 'link') return 'lien';
  return 'document';
};

export const HABILLAGE: Record<Famille, { label: string; pluriel: string; icone: typeof BookOpen; accent: string; fond: string; plein: string }> = {
  article:  { label: 'Article',  pluriel: 'Articles',  icone: BookOpen,   accent: 'text-[#116862]',  fond: 'bg-[#116862]/10', plein: 'bg-[#116862]' },
  video:    { label: 'Vidéo',    pluriel: 'Vidéos',    icone: PlayCircle, accent: 'text-amber-600',  fond: 'bg-amber-50',     plein: 'bg-amber-500' },
  document: { label: 'Document', pluriel: 'Documents', icone: FileText,   accent: 'text-indigo-600', fond: 'bg-indigo-50',    plein: 'bg-indigo-500' },
  lien:     { label: 'Lien',     pluriel: 'Liens',     icone: LinkIcon,   accent: 'text-sky-600',    fond: 'bg-sky-50',       plein: 'bg-sky-500' },
};

/** Visuel d'une ressource : miniature YouTube, image choisie, ou première image de l'article. */
export const visuelDe = (r: Resource) =>
  familleDe(r) === 'video'
    ? (getYoutubeThumbnail(r.file_url) || r.image_url || null)
    : (r.image_url || getFirstImageFromHtml(r.description) || null);

/** Ouvre la ressource : lecture interne pour un article, nouvel onglet sinon. */
export const ouvrirRessource = (r: Resource, onView: (r: Resource) => void) => {
  if (familleDe(r) === 'article') onView(r);
  else if (r.file_url) window.open(r.file_url, '_blank', 'noopener,noreferrer');
};

interface ActionsProps {
  resource: Resource;
  isAdmin?: boolean;
  onEdit?: (r: Resource) => void;
  onDelete?: (id: string | number) => void;
}

const ActionsAdmin = ({ resource, isAdmin, onEdit, onDelete }: ActionsProps) => {
  if (!isAdmin) return null;
  return (
    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
      {onEdit && (
        <button onClick={(e) => { e.stopPropagation(); onEdit(resource); }} className="p-1.5 bg-white/90 text-slate-600 hover:text-blue-600 rounded-md shadow-sm" aria-label="Modifier">
          <Edit size={13} />
        </button>
      )}
      {onDelete && (
        <button onClick={(e) => { e.stopPropagation(); onDelete(resource.id); }} className="p-1.5 bg-white/90 text-slate-600 hover:text-red-600 rounded-md shadow-sm" aria-label="Supprimer">
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------------------
   AFFICHE : le bandeau du haut, réservé aux toutes dernières publications.
   --------------------------------------------------------------------------- */
export const ResourceHero = ({ resource, onView, isAdmin, onEdit, onDelete }: ActionsProps & { onView: (r: Resource) => void }) => {
  const famille = familleDe(resource);
  const h = HABILLAGE[famille];
  const Icone = h.icone;
  const visuel = visuelDe(resource);

  return (
    <button
      onClick={() => ouvrirRessource(resource, onView)}
      className="group relative h-48 md:h-52 w-full rounded-2xl overflow-hidden text-left shadow-sm hover:shadow-lg transition-all bg-slate-800"
    >
      {visuel ? (
        <img src={visuel} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <span className="absolute inset-0 bg-gradient-to-br from-[#116862] to-[#0a4540]" />
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-slate-900/10" />

      <span className={`absolute top-3 left-3 ${h.plein} text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1`}>
        <Icone size={11} /> {h.label}
      </span>
      {estRecent(resource.created_at) && (
        <span className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
          Nouveau
        </span>
      )}

      <span className="absolute bottom-0 left-0 right-0 p-4">
        <span className="block text-white font-bold text-lg leading-snug line-clamp-2 drop-shadow">
          {resource.title}
        </span>
        <span className="block text-white/70 text-xs mt-1">
          {resource.category ? `${resource.category} · ` : ''}{timeAgoFr(resource.created_at) || formatDateFr(resource.created_at)}
        </span>
      </span>

      <ActionsAdmin resource={resource} isAdmin={isAdmin} onEdit={onEdit} onDelete={onDelete} />
    </button>
  );
};

/* ---------------------------------------------------------------------------
   VIGNETTE : l'élément des rails illustrés, en 16/9. Réservée aux articles
   et aux vidéos, qui ont une image à montrer.
   --------------------------------------------------------------------------- */
export const ResourceTile = ({ resource, onView, isAdmin, onEdit, onDelete }: ActionsProps & { onView: (r: Resource) => void }) => {
  const famille = familleDe(resource);
  const h = HABILLAGE[famille];
  const Icone = h.icone;
  const visuel = visuelDe(resource);

  return (
    <div className="group shrink-0 snap-start w-[230px]">
      <button
        onClick={() => ouvrirRessource(resource, onView)}
        className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group-hover:border-[#116862]/40 group-hover:shadow-md transition-all"
      >
        {visuel ? (
          <img src={visuel} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <span className={`w-full h-full ${h.fond} flex items-center justify-center`}>
            <Icone size={30} className={`${h.accent} opacity-60`} />
          </span>
        )}
        {famille === 'video' && visuel && (
          <span className="absolute inset-0 flex items-center justify-center bg-slate-900/25">
            <PlayCircle size={32} className="text-white drop-shadow" />
          </span>
        )}
        {estRecent(resource.created_at) && (
          <span className="absolute top-1.5 left-1.5 bg-rose-500 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
            Nouveau
          </span>
        )}
        <ActionsAdmin resource={resource} isAdmin={isAdmin} onEdit={onEdit} onDelete={onDelete} />
      </button>

      <button onClick={() => ouvrirRessource(resource, onView)} className="text-left w-full mt-2">
        <span className="block text-sm font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-[#116862] transition-colors">
          {resource.title}
        </span>
        <span className="block text-[11px] text-slate-400 mt-0.5 truncate">
          <span className={`font-bold uppercase tracking-wide ${h.accent}`}>{h.label}</span>
          {resource.category ? ` · ${resource.category}` : ''}
          {resource.created_at ? ` · ${timeAgoFr(resource.created_at)}` : ''}
        </span>
      </button>
    </div>
  );
};

/* ---------------------------------------------------------------------------
   RAIL : une ligne défilante, avec son titre et son « Voir tout ».
   --------------------------------------------------------------------------- */
interface RailProps {
  titre: string;
  icone?: typeof BookOpen;
  couleurIcone?: string;
  nombre?: number;
  onVoirTout?: () => void;
  children: React.ReactNode;
}

export const Rail = ({ titre, icone: Icone, couleurIcone = 'text-slate-400', nombre, onVoirTout, children }: RailProps) => {
  const piste = useRef<HTMLDivElement>(null);

  const glisser = (sens: -1 | 1) => {
    const el = piste.current;
    if (el) el.scrollBy({ left: sens * Math.max(el.clientWidth * 0.8, 240), behavior: 'smooth' });
  };

  return (
    <section className="group/rail min-w-0">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 shrink-0">
          {Icone && <Icone size={18} className={couleurIcone} />}
          {titre}
          {typeof nombre === 'number' && <span className="text-slate-300 font-medium">{nombre}</span>}
        </h2>
        {onVoirTout && (
          <button
            onClick={onVoirTout}
            className="text-xs font-bold text-slate-400 hover:text-[#116862] transition-colors whitespace-nowrap flex items-center gap-0.5 shrink-0"
          >
            Voir tout <ChevronRight size={13} />
          </button>
        )}
        <div className="ml-auto hidden md:flex items-center gap-1 opacity-0 group-hover/rail:opacity-100 transition-opacity">
          <button onClick={() => glisser(-1)} className="p-1 text-slate-400 hover:text-[#116862] transition-colors" aria-label="Précédent">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => glisser(1)} className="p-1 text-slate-400 hover:text-[#116862] transition-colors" aria-label="Suivant">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div ref={piste} className="flex gap-4 overflow-x-auto snap-x scroll-smooth pb-2 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </section>
  );
};

/* ---------------------------------------------------------------------------
   PASTILLE : documents et liens. Ces contenus n'ont pas d'image, et un grand
   carré occupé par une seule icône fait pauvre à côté des vignettes
   illustrées. Une pastille horizontale leur donne une présence propre :
   l'icône reste petite, le titre prend la place.
   --------------------------------------------------------------------------- */
export const ResourceChip = ({ resource, onView, isAdmin, onEdit, onDelete }: ActionsProps & { onView: (r: Resource) => void }) => {
  const famille = familleDe(resource);
  const h = HABILLAGE[famille];
  const Icone = h.icone;

  return (
    <div className="group shrink-0 snap-start w-[270px] relative">
      <button
        onClick={() => ouvrirRessource(resource, onView)}
        className="w-full h-full text-left bg-white border border-slate-200 rounded-xl p-3.5 flex items-start gap-3 hover:border-[#116862]/40 hover:shadow-md transition-all"
      >
        <span className={`shrink-0 w-10 h-10 ${h.fond} rounded-lg flex items-center justify-center`}>
          <Icone size={18} className={h.accent} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-[#116862] transition-colors">
            {resource.title}
          </span>
          <span className="block text-[11px] text-slate-400 mt-1 truncate">
            <span className={`font-bold uppercase tracking-wide ${h.accent}`}>{h.label}</span>
            {resource.category ? ` · ${resource.category}` : ''}
            {resource.created_at ? ` · ${timeAgoFr(resource.created_at)}` : ''}
          </span>
        </span>
        {estRecent(resource.created_at) && (
          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5" title="Nouveau" />
        )}
      </button>
      <ActionsAdmin resource={resource} isAdmin={isAdmin} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
};

/** Choisit la présentation selon le média : vignette illustrée ou pastille. */
export const ResourceItem = (props: ActionsProps & { onView: (r: Resource) => void }) => {
  const famille = familleDe(props.resource);
  return (famille === 'document' || famille === 'lien')
    ? <ResourceChip {...props} />
    : <ResourceTile {...props} />;
};
