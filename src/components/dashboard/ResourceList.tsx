// src/components/dashboard/ResourceList.tsx
import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, ChevronDown, ChevronUp, ArrowRight, Video, PlayCircle, Link as LinkIcon, Globe, Download, FileText } from 'lucide-react';
import { Resource } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { getYoutubeId } from '@/lib/utils';

interface ResourceListProps {
  resources: Resource[];
  isAdmin: boolean;
  onEdit: (r: Resource) => void;
  onDelete: (id: string | number) => void;
  onView: (r: Resource) => void;
}

const FILTERS = [
  { id: 'all', label: 'Toutes les ressources' },
  { id: 'text', label: 'Nouveautés' },
  { id: 'video', label: 'Vidéos & Tutos' },
  { id: 'file', label: 'Ressources à télécharger' },
  { id: 'link', label: 'Liens à explorer' },
] as const;

export const ResourceList = ({ resources, isAdmin, onEdit, onDelete, onView }: ResourceListProps) => {
  const [activeFilter, setActiveFilter] = useState<typeof FILTERS[number]['id']>('all');

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Ajout d'un paramètre isGrid pour adapter la largeur de la carte
  const renderCard = (r: Resource, isGrid: boolean = false) => (
    <div key={r.id} className={`${isGrid ? 'w-full' : 'min-w-[280px] w-[280px] shrink-0'} bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full hover:shadow-md transition-all`}>
      <div className="flex justify-between items-start mb-2">
        <Badge color={r.type === 'video' ? 'red' : 'green'}>{r.category}</Badge>
        {isAdmin && (
          <div className="flex gap-1">
            <button onClick={() => onEdit(r)} className="text-slate-300 hover:text-[#116862] p-1"><Pencil size={14} /></button>
            <button onClick={() => onDelete(r.id)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={14} /></button>
          </div>
        )}
      </div>
      <h4 className="font-bold text-slate-800 mb-2 truncate">{r.title}</h4>
      <div className="flex-1">
        {r.type === 'text' && <p className="text-sm text-slate-600 line-clamp-3">{stripHtml(r.description || "")}</p>}
        {r.type === 'video' && (
          <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden relative group">
            <img src={`https://img.youtube.com/vi/${getYoutubeId(r.file_url || "")}/mqdefault.jpg`} alt={r.title} className="w-full h-full object-cover" />
            <a href={r.file_url} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100"><PlayCircle size={32} className="text-white" /></a>
          </div>
        )}
        {r.type === 'link' && <a href={r.file_url} target="_blank" className="text-indigo-600 text-sm flex items-center gap-2"><Globe size={16} /> Visiter le lien</a>}
        {['file', 'pdf'].includes(r.type) && <a href={r.file_url} target="_blank" className="text-blue-600 text-sm flex items-center gap-2"><Download size={16} /> Télécharger</a>}
      </div>
      <button onClick={() => onView(r)} className="mt-4 text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-wider text-left">Voir détails</button>
    </div>
  );

  // Composant interne pour gérer le déploiement d'une ligne
  const CategoryRow = ({ filter, items }: { filter: typeof FILTERS[number], items: Resource[] }) => {
    const [expanded, setExpanded] = useState(false);
    
    if (items.length === 0) return null;

    const hasMore = items.length > 4;
    const displayedItems = expanded ? items : items.slice(0, 4);

    return (
      <section>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-slate-800">{filter.label}</h3>
          
          {/* Bouton Texte (Haut Droite) */}
          {hasMore && !expanded && (
            <button onClick={() => setExpanded(true)} className="text-sm font-medium text-[#116862] flex items-center gap-1 hover:underline">
              Voir plus <ChevronDown size={16} />
            </button>
          )}
          {expanded && (
            <button onClick={() => setExpanded(false)} className="text-sm font-medium text-slate-500 flex items-center gap-1 hover:underline">
              Réduire <ChevronUp size={16} />
            </button>
          )}
        </div>

        {/* Conteneur : Grille si déployé, Ligne si réduit */}
        <div className={expanded ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" : "flex gap-4 overflow-x-auto pb-4 scrollbar-thin"}>
          {displayedItems.map(r => renderCard(r, expanded))}
          
          {/* Carte "Voir Plus" à la fin de la ligne */}
          {!expanded && hasMore && (
            <button 
              onClick={() => setExpanded(true)}
              className="min-w-[280px] w-[280px] shrink-0 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-[#116862] hover:bg-slate-100 hover:border-[#116862] transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ArrowRight className="text-inherit" />
              </div>
              <span className="font-bold">Voir plus</span>
              <span className="text-sm mt-1">{items.length - 4} ressources masquées</span>
            </button>
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-8">
      {/* Barre de navigation */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-lg overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeFilter === f.id ? 'bg-white text-[#116862] shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* VUE "TOUTES LES RESSOURCES" (Lignes déployables) */}
      {activeFilter === 'all' ? (
        <div className="space-y-10">
          {FILTERS.slice(1).map(filter => {
            const items = resources.filter(r => filter.id === 'file' ? ['file', 'pdf'].includes(r.type) : r.type === filter.id);
            return <CategoryRow key={filter.id} filter={filter} items={items} />;
          })}
        </div>
      ) : (
        /* VUE FILTRÉE (Grille classique complète) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources
            .filter(r => activeFilter === 'file' ? ['file', 'pdf'].includes(r.type) : r.type === activeFilter)
            .map(r => renderCard(r, true))}
        </div>
      )}
    </div>
  );
};
