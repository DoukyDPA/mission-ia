import React, { useState } from 'react';
import { AlignLeft, Pencil, Trash2, Calendar, ArrowRight, ChevronDown, Video, PlayCircle, Link as LinkIcon, Globe, Download, FileText } from 'lucide-react';
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
  const [visibleArticles, setVisibleArticles] = useState(6);
  
  const articles = resources.filter(r => r.type === 'text');
  const videos = resources.filter(r => r.type === 'video');
  const tools = resources.filter(r => r.type === 'link');
  const files = resources.filter(r => ['file', 'pdf'].includes(r.type));

  return (
    <div className="space-y-12">
        {/* ARTICLES */}
        {articles.length > 0 && (
            <section>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><AlignLeft className="text-amber-500"/> Articles & Tutoriels</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.slice(0, visibleArticles).map(r => (
                        <div key={r.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow relative group">
                            <div className="flex justify-between items-start mb-2">
                                <Badge color="green">{r.category}</Badge>
                                {isAdmin && <div className="flex gap-1"><button onClick={() => onEdit(r)} className="text-slate-300 hover:text-[#116862] p-1"><Pencil size={14}/></button><button onClick={() => onDelete(r.id)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={14}/></button></div>}
                            </div>
                            <h4 className="font-bold text-slate-800 mb-2">{r.title}</h4>
                            <div className="text-sm text-slate-600 line-clamp-3 mb-4 flex-1">{r.description}</div>
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                <div className="text-xs text-slate-400 flex items-center gap-1"><Calendar size={12}/> {r.date || "Date inconnue"}</div>
                                <button onClick={() => onView(r)} className="text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">Lire <ArrowRight size={14}/></button>
                            </div>
                        </div>
                    ))}
                </div>
                {articles.length > visibleArticles && <div className="flex justify-center mt-6"><button onClick={() => setVisibleArticles(prev => prev + 6)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"><ChevronDown size={16}/> Voir plus d'articles</button></div>}
            </section>
        )}

        {/* VIDEOS */}
        {videos.length > 0 && (<section><h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Video className="text-red-500"/> Vidéothèque</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{videos.map(r => { const videoId = r.file_url ? getYoutubeId(r.file_url) : null; const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null; return (<div key={r.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative"><div className="aspect-video bg-slate-100 relative group-hover:opacity-90 transition-opacity">{thumbnailUrl ? <img src={thumbnailUrl} alt={r.title} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full"><Video size={48} className="text-slate-300"/></div>}<a href={r.file_url} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"><PlayCircle size={48} className="text-white drop-shadow-lg"/></a>{isAdmin && <button onClick={() => onDelete(r.id)} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>}</div><div className="p-3"><h4 className="font-bold text-sm text-slate-800 truncate">{r.title}</h4><span className="text-xs text-slate-500">{r.category}</span></div></div>); })}</div></section>)}

        {/* OUTILS */}
        {tools.length > 0 && (<section><h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><LinkIcon className="text-[#116862]"/> Outils</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{tools.map(r => <div key={r.id} className="bg-white p-3 rounded border flex items-center gap-3"><Globe size={20} className="text-[#116862]"/><a href={r.file_url} target="_blank" className="flex-1 truncate font-medium text-slate-700">{r.title}</a>{isAdmin && <button onClick={()=>onDelete(r.id)}><Trash2 size={14} className="text-slate-300 hover:text-red-500"/></button>}</div>)}</div></section>)}

        {/* FICHIERS */}
        {files.length > 0 && (<section><h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Download className="text-blue-500"/> Fichiers</h3><div className="grid grid-cols-1 md:grid-cols-4 gap-4">{files.map(r => <div key={r.id} className="bg-white p-4 rounded border flex flex-col"><div className="flex justify-between"><FileText className="text-blue-500"/>{isAdmin && <button onClick={()=>onDelete(r.id)}><Trash2 size={14} className="text-slate-300 hover:text-red-500"/></button>}</div><h4 className="font-bold text-sm mt-2">{r.title}</h4><a href={r.file_url} target="_blank" className="mt-4 text-xs font-bold text-blue-600 flex items-center gap-1"><Download size={12}/> Télécharger</a></div>)}</div></section>)}
    </div>
  );
};
