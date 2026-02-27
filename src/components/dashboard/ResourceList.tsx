// src/components/dashboard/ResourceList.tsx
import React, { useState, useMemo } from 'react';
import { AlignLeft, Pencil, Trash2, Calendar, ChevronDown, Video, PlayCircle, Link as LinkIcon, Globe, Download, FileText } from 'lucide-react';
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

export const ResourceList = ({ resources, isAdmin, onEdit, onDelete, onView }: ResourceListProps) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'text' | 'video' | 'link' | 'file'>('all');
  const [visibleCount, setVisibleCount] = useState(8);

  // Filtrage des ressources
  const filteredResources = useMemo(() => {
    if (activeFilter === 'all') return resources;
    if (activeFilter === 'file') return resources.filter(r => ['file', 'pdf'].includes(r.type));
    return resources.filter(r => r.type === activeFilter);
  }, [resources, activeFilter]);

  const displayedResources = filteredResources.slice(0, visibleCount);

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div className="space-y-8">
      {/* Barre de navigation par type */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-lg overflow-x-auto">
        {(['all', 'text', 'video', 'link', 'file'] as const).map((type) => (
          <button
            key={type}
            onClick={() => { setActiveFilter(type); setVisibleCount(8); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeFilter === type ? 'bg-white text-[#116862] shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Grille de ressources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayedResources.map(r => (
          <div key={r.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full hover:shadow-md transition-all">
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
            
            {/* Rendu spécifique par type */}
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
        ))}
      </div>

      {/* Pagination */}
      {filteredResources.length > visibleCount && (
        <div className="flex justify-center pt-4">
          <button onClick={() => setVisibleCount(prev => prev + 8)} className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium hover:bg-slate-50 shadow-sm">
            <ChevronDown size={16} /> Voir plus
          </button>
        </div>
      )}
    </div>
  );
};
