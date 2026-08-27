// src/components/dashboard/ResourceList.tsx
// La veille, sur le modèle des plateformes de contenu : un bandeau d'affiches
// pour les toutes dernières publications, puis des rails horizontaux par mode
// et par thème, chacun avec son « Voir tout ». Une recherche ou un « Voir tout »
// bascule la page en mode résultats, sur une grille classique.
import React, { useMemo, useState } from 'react';
import { Search, X, Tag, Radio, ArrowLeft, Library } from 'lucide-react';
import { Resource } from '@/types';
import { ResourceHero, ResourceItem, Rail, HABILLAGE, familleDe, type Famille } from './ResourceRail';
import { getSnippet } from '@/lib/utils';

interface ResourceListProps {
  resources: Resource[];
  isAdmin: boolean;
  onEdit: (r: Resource) => void;
  onDelete: (id: string | number) => void;
  onView: (r: Resource) => void;
}

const ORDRE_FAMILLES: Famille[] = ['article', 'video', 'document', 'lien'];

// Nombre d'affiches dans le bandeau, et de thèmes qui obtiennent leur rail.
const NB_AFFICHES = 3;
const NB_RAILS_THEMES = 3;

const parDateDecroissante = (a: Resource, b: Resource) => {
  const da = a.created_at ? new Date(a.created_at).getTime() : 0;
  const db = b.created_at ? new Date(b.created_at).getTime() : 0;
  return db - da;
};

type Selection = { type: 'mode'; valeur: Famille } | { type: 'theme'; valeur: string } | { type: 'recentes' } | null;

export const ResourceList = ({ resources, isAdmin, onEdit, onDelete, onView }: ResourceListProps) => {
  const [recherche, setRecherche] = useState('');
  const [selection, setSelection] = useState<Selection>(null);

  const triees = useMemo(() => [...resources].sort(parDateDecroissante), [resources]);

  const correspondAuTheme = (r: Resource, theme: string) =>
    r.category?.trim() === theme || !!r.tags?.some(t => t.trim() === theme);

  // Les thèmes, catégories et mots-clés confondus, du plus fourni au moins fourni.
  const themes = useMemo(() => {
    const compte = new Map<string, number>();
    const ajoute = (v?: string) => {
      const cle = v?.trim();
      if (cle) compte.set(cle, (compte.get(cle) || 0) + 1);
    };
    triees.forEach(r => { ajoute(r.category); r.tags?.forEach(ajoute); });
    return Array.from(compte.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([nom, nb]) => ({ nom, nb }));
  }, [triees]);

  const resultats = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q && !selection) return [];
    return triees.filter(r => {
      if (selection?.type === 'mode' && familleDe(r) !== selection.valeur) return false;
      if (selection?.type === 'theme' && !correspondAuTheme(r, selection.valeur)) return false;
      if (!q) return true;
      return (
        r.title?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        getSnippet(r.description).toLowerCase().includes(q) ||
        r.tags?.some(t => t.toLowerCase().includes(q))
      );
    });
  }, [triees, recherche, selection]);

  const enModeResultats = recherche.trim() !== '' || selection !== null;

  const titreResultats = () => {
    if (selection?.type === 'mode') return HABILLAGE[selection.valeur].pluriel;
    if (selection?.type === 'theme') return selection.valeur;
    if (selection?.type === 'recentes') return 'Dernières publications';
    return 'Résultats';
  };

  const revenir = () => { setSelection(null); setRecherche(''); };

  const affiches = triees.slice(0, NB_AFFICHES);
  const recentes = triees.slice(0, 12);

  const proprietesTuile = { isAdmin, onView, onEdit, onDelete };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">

      {/* RECHERCHE */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Rechercher un titre, un thème, un contenu..."
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-[#116862] outline-none font-medium"
          value={recherche}
          onChange={e => setRecherche(e.target.value)}
        />
        {recherche && (
          <button onClick={() => setRecherche('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600" aria-label="Effacer">
            <X size={18} />
          </button>
        )}
      </div>

      {triees.length === 0 && (
        <div className="text-center py-20 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
          Aucune ressource publiée pour le moment.
        </div>
      )}

      {/* ---------------- MODE RÉSULTATS ---------------- */}
      {enModeResultats && (
        <section>
          <div className="flex items-center justify-between mb-5 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-3">
              <button onClick={revenir} className="p-1.5 text-slate-400 hover:text-[#116862] hover:bg-slate-100 rounded-lg transition-colors" aria-label="Retour">
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-xl font-bold text-slate-800">{titreResultats()}</h2>
            </div>
            <span className="text-sm text-slate-400 font-medium shrink-0">
              {resultats.length} publication{resultats.length > 1 ? 's' : ''}
            </span>
          </div>

          {resultats.length === 0 ? (
            <div className="text-center py-16 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
              <Search className="mx-auto text-slate-300 mb-3" size={32} />
              <p className="font-medium">Rien ne correspond à cette recherche.</p>
              <button onClick={revenir} className="mt-3 text-sm font-bold text-[#116862] hover:underline">Revenir à la veille</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
              {resultats.map(r => (
                <div key={r.id} className="w-full [&>div]:!w-full">
                  <ResourceItem resource={r} {...proprietesTuile} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ---------------- VUE PAR DÉFAUT ---------------- */}
      {!enModeResultats && triees.length > 0 && (
        <>
          {/* Le bandeau d'affiches */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {affiches.map(r => (
              <ResourceHero key={r.id} resource={r} isAdmin={isAdmin} onView={onView} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>

          {/* Le rail chronologique */}
          {recentes.length > 0 && (
            <Rail
              titre="Dernières publications"
              icone={Radio}
              couleurIcone="text-[#116862]"
              onVoirTout={triees.length > recentes.length ? () => setSelection({ type: 'recentes' }) : undefined}
            >
              {recentes.map(r => (
                <ResourceItem key={r.id} resource={r} {...proprietesTuile} />
              ))}
            </Rail>
          )}

          {/* Un rail par mode */}
          {ORDRE_FAMILLES.map(famille => {
            const liste = triees.filter(r => familleDe(r) === famille);
            if (liste.length === 0) return null;
            const h = HABILLAGE[famille];
            return (
              <Rail
                key={famille}
                titre={h.pluriel}
                icone={h.icone}
                couleurIcone={h.accent}
                nombre={liste.length}
                onVoirTout={() => setSelection({ type: 'mode', valeur: famille })}
              >
                {liste.slice(0, 12).map(r => (
                  <ResourceItem key={r.id} resource={r} {...proprietesTuile} />
                ))}
              </Rail>
            );
          })}

          {/* PARCOURIR PAR THÈME : la seconde porte d'entrée, après le mode.
              Placée avant les rails thématiques, dont elle annonce la logique. */}
          {themes.length > 0 && (
            <section className="bg-gradient-to-br from-[#116862]/8 via-slate-50 to-slate-50 border border-[#116862]/15 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-1">
                <Library size={20} className="text-[#116862]" />
                <h2 className="text-lg font-bold text-slate-800">Parcourir par thème</h2>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                {themes.length} thème{themes.length > 1 ? 's' : ''} dans la veille. Cliquez pour ne garder que celui qui vous intéresse.
              </p>
              <div className="flex flex-wrap gap-2">
                {themes.map(t => (
                  <button
                    key={t.nom}
                    onClick={() => setSelection({ type: 'theme', valeur: t.nom })}
                    className="px-3.5 py-2 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-700 shadow-sm hover:border-[#116862] hover:text-[#116862] hover:shadow transition-all flex items-center gap-2"
                  >
                    <Tag size={13} className="text-slate-400" /> {t.nom}
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{t.nb}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Un rail par thème, pour les mieux fournis */}
          {themes.filter(t => t.nb > 1).slice(0, NB_RAILS_THEMES).map(theme => {
            const liste = triees.filter(r => correspondAuTheme(r, theme.nom));
            return (
              <Rail
                key={theme.nom}
                titre={theme.nom}
                icone={Tag}
                nombre={liste.length}
                onVoirTout={() => setSelection({ type: 'theme', valeur: theme.nom })}
              >
                {liste.slice(0, 12).map(r => (
                  <ResourceItem key={r.id} resource={r} {...proprietesTuile} />
                ))}
              </Rail>
            );
          })}

        </>
      )}
    </div>
  );
};
