// src/components/dashboard/ResourceList.tsx
import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, ChevronDown, Video, PlayCircle, Link as LinkIcon, Globe, Download, FileText, AlignLeft } from 'lucide-react';
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

  // Helper pour rendre une carte individuelle
  const renderCard = (r: Resource) => (
    <div key={r.id} className="min-w-[280px] w-[280px] bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full hover:shadow-md transition-all">
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
      <button onClick={() => onView(r)} className="mt-4 text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-wider">Voir détails</button>
    </div>
  );

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

      {/* VUE "TOUTES LES RESSOURCES" (Scroll Horizontal par section) */}
      {activeFilter === 'all' ? (
        <div className="space-y-8">
            {FILTERS.slice(1).map(filter => {
                const items = resources.filter(r => filter.id === 'file' ? ['file', 'pdf'].includes(r.type) : r.type === filter.id);
                if (items.length === 0) return null;
                return (
                    <section key={filter.id}>
                        <h3 className="text-lg font-bold text-slate-800 mb-4">{filter.label}</h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                            {items.map(renderCard)}
                        </div>
                    </section>
                )
            })}
        </div>
      ) : (
        /* VUE FILTRÉE (Grille classique) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources
            .filter(r => activeFilter === 'file' ? ['file', 'pdf'].includes(r.type) : r.type === activeFilter)
            .map(renderCard)}
        </div>
      )}
    </div>
  );
};
