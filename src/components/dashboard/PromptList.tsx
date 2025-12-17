import React from 'react';
import { GitFork, Pencil, Trash2, Copy } from 'lucide-react';
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
  return (
    <div className="space-y-6 max-w-4xl">
       <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
         <button onClick={() => setSelectedCategory('Tous')} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'Tous' ? 'bg-[#116862] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>Tous</button>
         {categories.map(cat => <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-[#116862] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>{cat}</button>)}
       </div>

       {prompts.filter(p => selectedCategory === 'Tous' || p.tags.includes(selectedCategory)).map(p => (
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
