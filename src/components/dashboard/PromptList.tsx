import React, { useMemo, useState } from 'react';
import { GitFork, Pencil, Trash2, Copy, Search, X } from 'lucide-react';
import { Prompt, User } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface PromptListProps {
  prompts: Prompt[];
  user: User;
  isAdmin: boolean;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onCopy: (content: string) => void;
  onEdit: (p: Prompt) => void;
  onDelete: (id: string | number) => void;
  onFork: (p: Prompt) => void;
}

export const PromptList = ({ prompts, user, isAdmin, categories, selectedCategory, setSelectedCategory, onCopy, onEdit, onDelete, onFork }: PromptListProps) => {
  const [recherche, setRecherche] = useState('');

  // La recherche porte aussi sur le corps du prompt : c'est souvent une
  // formule précise qu'on cherche à retrouver, pas un titre.
  const resultats = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return prompts.filter(p => {
      if (selectedCategory !== 'Tous' && !p.tags.includes(selectedCategory)) return false;
      if (!q) return true;
      return (
        p.title?.toLowerCase().includes(q) ||
        p.content?.toLowerCase().includes(q) ||
        p.author?.toLowerCase().includes(q) ||
        p.missionLocale?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    });
  }, [prompts, selectedCategory, recherche]);

  const enFiltrage = recherche.trim() !== '' || selectedCategory !== 'Tous';

  const reinitialiser = () => { setRecherche(''); setSelectedCategory('Tous'); };

  return (
    <div className="space-y-6 max-w-4xl">
       <div className="relative">
         <Search className="absolute left-3 top-3 text-slate-400" size={18} />
         <input
           type="text"
           placeholder="Rechercher un titre, une formulation, un auteur..."
           className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm focus:ring-2 focus:ring-[#116862] outline-none font-medium"
           value={recherche}
           onChange={e => setRecherche(e.target.value)}
         />
         {recherche && (
           <button onClick={() => setRecherche('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600" aria-label="Effacer la recherche">
             <X size={18} />
           </button>
         )}
       </div>

       <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
         <button onClick={() => setSelectedCategory('Tous')} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'Tous' ? 'bg-[#116862] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>Tous</button>
         {categories.map(cat => <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-[#116862] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>{cat}</button>)}
       </div>

       {enFiltrage && (
         <p className="text-sm text-slate-400 font-medium -mt-2">
           {resultats.length} prompt{resultats.length > 1 ? 's' : ''}
         </p>
       )}

       {resultats.length === 0 && (
         <div className="text-center py-16 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
           {enFiltrage ? (
             <>
               <Search className="mx-auto text-slate-300 mb-3" size={32} />
               <p className="font-medium">Rien ne correspond à cette recherche.</p>
               <button onClick={reinitialiser} className="mt-3 text-sm font-bold text-[#116862] hover:underline">
                 Revenir à tous les prompts
               </button>
             </>
           ) : (
             <p className="font-medium">Aucun prompt publié pour le moment.</p>
           )}
         </div>
       )}

       {resultats.map(p => (
          <div key={p.id} className={`bg-white p-6 rounded-xl border shadow-sm ${p.isFork ? 'border-l-4 border-l-[#116862] ml-8' : 'border-slate-200'}`}>
             <div className="flex justify-between mb-3">
                <div className="flex items-center gap-3"><div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">{p.avatar}</div><div><h3 className="font-bold text-slate-800 flex items-center gap-2">{p.title} {p.isFork && p.parentAuthor && <span className="text-[10px] bg-[#116862]/10 text-[#116862] px-2 py-0.5 rounded-full border border-[#116862]/20"><GitFork size={10} className="mr-1"/> Variante de {p.parentAuthor}</span>}</h3><p className="text-xs text-slate-500">{p.author} • {p.missionLocale}</p></div></div>
                <div className="flex items-center gap-2">
                    <Badge>{p.tags[0]}</Badge>
                    <button onClick={() => onCopy(p.content)} className="text-slate-300 hover:text-[#116862] p-1" title="Copier"><Copy size={14} /></button>
                    {(isAdmin || p.user_id === user.id) && <button onClick={() => onEdit(p)} className="text-slate-300 hover:text-[#116862] p-1"><Pencil size={14}/></button>}
                    {isAdmin && <button onClick={() => onDelete(p.id)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={14}/></button>}
                </div>
             </div>
             <div className="bg-slate-50 p-4 rounded text-sm font-mono text-slate-700 whitespace-pre-wrap">{p.content}</div>
             <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end"><button onClick={() => onFork(p)} className="text-xs font-medium text-[#116862] hover:bg-[#116862]/10 px-3 py-1.5 rounded flex items-center gap-1"><GitFork size={14} /> Améliorer / Proposer une variante</button></div>
          </div>
       ))}
    </div>
  );
};
