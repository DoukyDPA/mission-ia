// src/components/dashboard/ResourceList.tsx
import React, { useState } from 'react';
import { Search, FileText, ExternalLink, Video, Download, Edit, Trash2, Tag, BookOpen, PlayCircle, FileDown, Link as LinkIcon } from 'lucide-react';
import { Resource } from '@/types';

interface ResourceListProps {
  resources: Resource[];
  isAdmin: boolean;
  onEdit: (r: Resource) => void;
  onDelete: (id: string | number) => void;
  onView: (r: Resource) => void;
}

// Extrait la première image d'un article
const getFirstImageFromHtml = (html?: string) => {
  if (!html) return null;
  const match = html.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
};

// Récupère la miniature YouTube
const getYoutubeThumbnail = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
    }
    return null;
};

// NOUVELLE FONCTION ULTRA-ROBUSTE POUR NETTOYER LE TEXTE
const getSnippet = (html?: string) => {
    if (!html) return "Aucun extrait disponible.";
    
    // 1. On décode les entités au cas où elles seraient échappées par l'éditeur
    let text = html.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
    
    // 2. On supprime toutes les balises HTML
    text = text.replace(/<[^>]+>/g, ' ');
    
    // 3. On nettoie les espaces insécables (&nbsp;) et les entités restantes
    text = text.replace(/&nbsp;/g, ' ').replace(/&[a-z0-9#]+;/gi, '');
    
    // 4. On supprime les espaces multiples et on coupe proprement
    return text.replace(/\s+/g, ' ').trim();
};

export const ResourceList = ({ resources, isAdmin, onEdit, onDelete, onView }: ResourceListProps) => {
   const [searchTerm, setSearchTerm] = useState('');
   
   // RECHERCHE GLOBALE
   const filtered = resources.filter(r => {
       const searchLower = searchTerm.toLowerCase();
       const matchTitle = r.title.toLowerCase().includes(searchLower);
       const matchDesc = r.description?.toLowerCase().includes(searchLower);
       const matchTags = r.tags?.some(t => t.toLowerCase().includes(searchLower));
       return matchTitle || matchDesc || matchTags;
   });

   // SÉPARATION PAR CATÉGORIES DE MÉDIAS
   const articles = filtered.filter(r => r.type === 'text');
   const videos = filtered.filter(r => r.type === 'video');
   const documents = filtered.filter(r => r.type === 'file' || r.type === 'pdf');
   const links = filtered.filter(r => r.type === 'link');

   // Composant interne pour les boutons d'administration
   const AdminActions = ({ resource }: { resource: Resource }) => {
       if (!isAdmin) return null;
       return (
           <div className="flex gap-1">
               <button onClick={() => onEdit(resource)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"><Edit size={14}/></button>
               <button onClick={() => onDelete(resource.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={14}/></button>
           </div>
       );
   };

   return (
     <div className="space-y-10 animate-in fade-in duration-500 pb-12">
        
        {/* BARRE DE RECHERCHE */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4 sticky top-4 z-10">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher par mots-clés (ex: NotebookLM, slides), titre ou contenu..." 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#116862] outline-none font-medium"
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
            </div>
        </div>

        {filtered.length === 0 && (
            <div className="text-center py-20 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                Aucune ressource ne correspond à votre recherche.
            </div>
        )}

        {/* =========================================
            SECTION 1 : ARTICLES & VEILLE PÉDAGOGIQUE
            ========================================= */}
        {articles.length > 0 && (
            <section>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-200 pb-2">
                    <BookOpen className="text-[#116862]" size={24} /> Articles & Veille
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map(article => {
                        const extractedImage = article.image_url || getFirstImageFromHtml(article.description);
                        return (
                            <div key={article.id} className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col hover:border-[#116862]/40 hover:shadow-md transition-all group">
                                {/* Image de couverture */}
                                {extractedImage ? (
                                    <div className="h-48 w-full bg-slate-100 relative overflow-hidden rounded-t-xl border-b border-slate-100">
                                        <img src={extractedImage} alt={article.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                ) : (
                                    <div className="h-20 w-full bg-gradient-to-r from-[#116862]/10 to-slate-50 flex items-center justify-center border-b border-slate-100 rounded-t-xl">
                                        <BookOpen size={24} className="text-[#116862]/40" />
                                    </div>
                                )}
                                
                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        <span className="px-2 py-0.5 bg-[#116862]/10 text-[#116862] text-[10px] font-bold uppercase tracking-wider rounded">
                                            {article.category}
                                        </span>
                                        {article.tags?.map((tag, idx) => (
                                            <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded flex items-center gap-1">
                                                <Tag size={10} /> {tag}
                                            </span>
                                        ))}
                                    </div>
                                    
                                    <h3 className="font-bold text-lg text-slate-800 mb-2 leading-snug group-hover:text-[#116862] transition-colors">
                                        {article.title}
                                    </h3>
                                    
                                    {/* UTILISATION DE LA NOUVELLE FONCTION ICI */}
                                    <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                                        {getSnippet(article.description)}
                                    </p>
                                    
                                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
                                        <span className="text-xs text-slate-400">{article.date}</span>
                                        <div className="flex items-center gap-2">
                                            <AdminActions resource={article} />
                                            <button onClick={() => onView(article)} className="bg-[#116862] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-[#0e524d] transition-colors">
                                                Lire la suite
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        )}

        {/* =========================================
            SECTION 2 : VIDÉOS & WEBINAIRES
            ========================================= */}
        {videos.length > 0 && (
            <section>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-200 pb-2">
                    <PlayCircle className="text-amber-500" size={24} /> Vidéos & Webinaires
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map(video => {
                        const videoThumb = getYoutubeThumbnail(video.file_url) || video.image_url;
                        return (
                            <div key={video.id} className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col hover:border-amber-500/40 hover:shadow-md transition-all group overflow-hidden">
                                <div className="h-40 w-full bg-slate-900 relative flex items-center justify-center">
                                    {videoThumb && <img src={videoThumb} alt={video.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />}
                                    <PlayCircle size={48} className="text-white z-10 opacity-80 group-hover:scale-110 transition-transform drop-shadow-lg" />
                                </div>
                                <div className="p-4 flex flex-col flex-1">
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {video.tags?.map((tag, idx) => (
                                            <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded flex items-center gap-1">
                                                <Tag size={10} /> {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <h3 className="font-bold text-slate-800 mb-4 leading-snug">{video.title}</h3>
                                    
                                    <div className="mt-auto flex items-center justify-between">
                                        <span className="text-xs text-slate-400">{video.date}</span>
                                        <div className="flex items-center gap-2">
                                            <AdminActions resource={video} />
                                            <a href={video.file_url} target="_blank" rel="noopener noreferrer" className="text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-amber-100 transition-colors flex items-center gap-2">
                                                Visionner
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        )}

        {/* =========================================
            SECTION 3 : DOCUMENTS DE RÉFÉRENCE
            ========================================= */}
        {documents.length > 0 && (
            <section>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-200 pb-2">
                    <FileDown className="text-indigo-500" size={24} /> Documents de référence
                </h2>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100">
                    {documents.map(doc => (
                        <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start gap-4 flex-1">
                                <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg shrink-0 mt-1">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-base mb-1">{doc.title}</h3>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs text-slate-400">{doc.date}</span>
                                        {doc.tags && doc.tags.length > 0 && <span className="text-slate-300 text-xs">•</span>}
                                        {doc.tags?.map((tag, idx) => (
                                            <span key={idx} className="text-xs text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 sm:w-auto w-full justify-end">
                                <AdminActions resource={doc} />
                                <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2">
                                    <Download size={16}/> Télécharger
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* =========================================
            SECTION 4 : LIENS UTILES
            ========================================= */}
        {links.length > 0 && (
            <section>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-200 pb-2">
                    <LinkIcon className="text-sky-500" size={24} /> Liens utiles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {links.map(link => (
                        <div key={link.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-sky-300 transition-colors flex items-center justify-between group">
                            <div>
                                <h3 className="font-bold text-slate-800 group-hover:text-sky-600 transition-colors">{link.title}</h3>
                                <div className="flex gap-2 mt-1">
                                    {link.tags?.map((tag, idx) => (
                                        <span key={idx} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <AdminActions resource={link} />
                                <a href={link.file_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors">
                                    <ExternalLink size={18} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

     </div>
   );
}
