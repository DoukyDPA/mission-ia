import React, { useState } from 'react';
import { Search, FileText, ExternalLink, Video, Download, Edit, Trash2, Tag } from 'lucide-react';
import { Resource } from '@/types';

interface ResourceListProps {
  resources: Resource[];
  isAdmin: boolean;
  onEdit: (r: Resource) => void;
  onDelete: (id: string | number) => void;
  onView: (r: Resource) => void;
}

// Fonction astucieuse : elle va chercher la première image insérée dans le texte (ReactQuill)
const getFirstImageFromHtml = (html?: string) => {
  if (!html) return null;
  const match = html.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
};

export const ResourceList = ({ resources, isAdmin, onEdit, onDelete, onView }: ResourceListProps) => {
   const [searchTerm, setSearchTerm] = useState('');
   
   // Le moteur de recherche scrute maintenant le titre, la description ET les mots-clés
   const filtered = resources.filter(r => {
       const searchLower = searchTerm.toLowerCase();
       const matchTitle = r.title.toLowerCase().includes(searchLower);
       const matchDesc = r.description?.toLowerCase().includes(searchLower);
       const matchTags = r.tags?.some(t => t.toLowerCase().includes(searchLower));
       return matchTitle || matchDesc || matchTags;
   });

   return (
     <div className="space-y-6 animate-in fade-in duration-500">
        
        {/* BARRE DE RECHERCHE */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher par titre, contenu ou mots-clés (ex: NotebookLM, RH, slides)..." 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#116862] outline-none font-medium"
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
            </div>
        </div>
        
        {/* GRILLE AÉRÉE (3 colonnes maximum au lieu de 4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filtered.map(resource => {
               // On cherche une image de couverture ou on extrait la première image de l'article
               const extractedImage = resource.image_url || getFirstImageFromHtml(resource.description);
               
               return (
                 <div key={resource.id} className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col hover:border-[#116862]/40 hover:shadow-md transition-all group">
                    
                    {/* IMAGE COVER (Haut de la carte) */}
                    {extractedImage ? (
                        <div className="h-48 w-full bg-slate-100 relative overflow-hidden rounded-t-xl border-b border-slate-100">
                            <img src={extractedImage} alt={resource.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                        </div>
                    ) : (
                        <div className="h-20 w-full bg-gradient-to-r from-slate-100 to-slate-50 flex items-center justify-center border-b border-slate-100 rounded-t-xl">
                            <FileText size={24} className="text-slate-300" />
                        </div>
                    )}
                    
                    {/* CONTENU (Flex-col pour pousser le bouton vers le bas) */}
                    <div className="p-6 flex flex-col flex-1">
                        
                        {/* MOTS CLÉS (TAGS) */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className="px-2 py-1 bg-[#116862]/10 text-[#116862] text-[10px] font-bold uppercase tracking-wider rounded">
                                {resource.category}
                            </span>
                            {resource.tags?.map((tag, idx) => (
                                <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-medium rounded flex items-center gap-1">
                                    <Tag size={10} /> {tag}
                                </span>
                            ))}
                        </div>
                        
                        {/* TITRE COMPLET (Plus de limitation de lignes) */}
                        <h3 className="font-bold text-lg text-slate-800 mb-3 leading-tight group-hover:text-[#116862] transition-colors">
                            {resource.title}
                        </h3>
                        
                        {/* EXTRAIT TEXTE SI ARTICLE */}
                        {resource.type === 'text' && resource.description && !extractedImage && (
                            <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                                {resource.description.replace(/<[^>]*>?/gm, '')}
                            </p>
                        )}
                        
                        {/* FOOTER ANCRÉ EN BAS (mt-auto) */}
                        <div className="mt-auto pt-5 flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                {resource.date}
                            </span>
                            
                            <div className="flex gap-2">
                                {isAdmin && (
                                    <>
                                       <button onClick={() => onEdit(resource)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16}/></button>
                                       <button onClick={() => onDelete(resource.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                    </>
                                )}
                                {resource.type === 'text' ? (
                                    <button onClick={() => onView(resource)} className="bg-[#116862] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-[#0e524d] transition-colors">
                                        Lire la suite
                                    </button>
                                ) : (
                                    <a href={resource.file_url} target="_blank" rel="noopener noreferrer" className="bg-[#116862] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-[#0e524d] transition-colors flex items-center gap-2">
                                        {resource.type === 'video' ? <Video size={16}/> : resource.type === 'link' ? <ExternalLink size={16}/> : <Download size={16}/>}
                                        Ouvrir
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                 </div>
               );
           })}
           {filtered.length === 0 && (
               <div className="col-span-full py-12 text-center text-slate-500">
                   Aucune ressource ne correspond à votre recherche.
               </div>
           )}
        </div>
     </div>
   );
}
