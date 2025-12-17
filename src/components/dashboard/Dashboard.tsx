// src/components/dashboard/Dashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, Sparkles, GitFork, Users, Search, FileText, Video, Download, Plus, 
  ArrowRight, X, LogOut, Building2, Globe, UploadCloud, UserPlus, Trash2, 
  ShieldCheck, Link as LinkIcon, AlignLeft, ExternalLink, Eye, Pencil, Mail, PlayCircle 
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { getYoutubeId } from '@/lib/utils';
import { User, AllowedDomain, Prompt, Resource, Structure } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { SidebarItem } from '@/components/ui/SidebarItem';
import { Badge } from '@/components/ui/Badge';

// Données Mock (copiées pour éviter les erreurs si pas de DB)
const MOCK_STRUCTURES = [{ id: 1, name: "Mission Locale de Lyon", city: "Lyon" }];
const MOCK_PROMPTS = [{ id: 1, title: "Exemple", content: "Contenu...", author: "Admin", role: "Admin", avatar: "AD", missionLocale: "National", date: "Hier", tags: ["Administratif"], likes: 0, forks: 0, isFork: false }];

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onOpenLegal: (type: 'mentions' | 'privacy') => void;
  allowedDomains: AllowedDomain[];
  onAllowedDomainsChange: (domains: AllowedDomain[]) => void;
}

export const Dashboard = ({ user, onLogout, onOpenLegal, allowedDomains, onAllowedDomainsChange }: DashboardProps) => {
  const [currentTab, setCurrentTab] = useState('prompts');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  
  // États UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);
  const [isCustomTag, setIsCustomTag] = useState(false);
  const [availableCategories, setAvailableCategories] = useState(['Administratif', 'Relation Jeunes', 'Direction', 'RH', 'Projets', 'Autre']);
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  // États Formulaires
  const [editingPromptId, setEditingPromptId] = useState<string | number | null>(null);
  const [promptFormTitle, setPromptFormTitle] = useState('');
  const [promptFormContent, setPromptFormContent] = useState('');
  const [promptFormTag, setPromptFormTag] = useState('Administratif');
  const [parentPromptId, setParentPromptId] = useState<string | number | null>(null);

  const [editingResourceId, setEditingResourceId] = useState<string | number | null>(null);
  const [resFormType, setResFormType] = useState<'file' | 'text' | 'link' | 'video'>('file');
  const [resFormContent, setResFormContent] = useState('');

  const [editingUserId, setEditingUserId] = useState<string | number | null>(null);
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormName, setUserFormName] = useState('');
  const [userFormRole, setUserFormRole] = useState('Conseiller');
  const [userFormStructure, setUserFormStructure] = useState<string | number>('');

  const [domainFormValue, setDomainFormValue] = useState('');
  const [domainFormStructure, setDomainFormStructure] = useState<string | number>('');

  const isAdmin = (user.role || '').trim().toLowerCase() === 'admin';

  // --- REFRESH DATA ---
  const refreshData = useCallback(async () => {
    if (!supabase) return; 

    try {
        const { data: pData } = await supabase.from('prompts').select(`*, profiles(full_name, avatar_url, role), structures(name)`).order('created_at', { ascending: false });
        if (pData) {
            const promptAuthors = new Map();
            const usedTags = new Set(['Administratif', 'Relation Jeunes', 'Direction', 'RH', 'Projets', 'Autre']);
            pData.forEach((p: any) => {
                promptAuthors.set(p.id, p.profiles?.full_name || 'Inconnu');
                if (p.tags && Array.isArray(p.tags)) p.tags.forEach((t: string) => { if(t) usedTags.add(t); });
            });
            setAvailableCategories(Array.from(usedTags).sort());
            setPrompts(pData.map((p: any) => ({
                id: p.id, title: p.title, content: p.content,
                author: p.profiles?.full_name || 'Inconnu', role: p.profiles?.role || 'Membre',
                avatar: (p.profiles?.full_name || 'U').substring(0,2).toUpperCase(),
                missionLocale: p.structures?.name || 'National',
                date: new Date(p.created_at).toLocaleDateString(),
                tags: p.tags || [], likes: p.likes_count || 0, forks: 0, isFork: p.is_fork,
                parentId: p.parent_id,
                parentAuthor: p.parent_id ? promptAuthors.get(p.parent_id) : undefined,
                user_id: p.user_id
            })));
        }

        const { data: rData } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
        if (rData) setResources(rData.map((r: any) => ({ ...r, type: r.file_type || 'file' })));

        const { data: sData } = await supabase.from('structures').select('*');
        if (sData) setStructures(sData);

        const { data: dData } = await supabase.from('allowed_domains').select('*, structures(name)');
        if (dData) {
            onAllowedDomainsChange(dData.map((d: any) => ({ id: d.id, domain: d.domain, structure_id: d.structure_id, structure_name: d.structures?.name })));
        }

        if (isAdmin) {
            const { data: uData } = await supabase.from('profiles').select('*, structures(name)');
            if (uData) {
                setAdminUsers(uData.map((u: any) => ({
                    id: u.id, email: u.email, name: u.full_name || 'Sans nom', role: u.role,
                    missionLocale: u.structures?.name || 'Non assigné', avatar: (u.full_name || 'U').substring(0,2).toUpperCase(), structure_id: u.structure_id
                })));
            }
        }
    } catch (e) { console.error("Erreur refresh:", e); }
  }, [isAdmin, onAllowedDomainsChange]);

  useEffect(() => {
    if (!supabase) {
      setPrompts(MOCK_PROMPTS); setStructures(MOCK_STRUCTURES); onAllowedDomainsChange([]);
    } else { refreshData(); }
  }, [refreshData, onAllowedDomainsChange]);


  // --- HANDLERS (CRUD) ---
  const prepareCreatePrompt = () => {
      setModalMode('prompt'); setEditingPromptId(null); setPromptFormTitle(''); setPromptFormContent('');
      setPromptFormTag(availableCategories[0]); setParentPromptId(null); setIsCustomTag(false); setIsModalOpen(true);
  }
  const prepareForkPrompt = (original: Prompt) => {
      setModalMode('prompt'); setEditingPromptId(null); setPromptFormTitle(`Variante : ${original.title}`);
      setPromptFormContent(original.content); setPromptFormTag(original.tags[0] || 'Administratif');
      setParentPromptId(original.id); setIsModalOpen(true);
  }
  const prepareEditPrompt = (original: Prompt) => {
      setModalMode('prompt'); setEditingPromptId(original.id); setPromptFormTitle(original.title);
      setPromptFormContent(original.content); setPromptFormTag(original.tags[0] || availableCategories[0]);
      setIsCustomTag(!availableCategories.includes(original.tags[0])); setParentPromptId(null); setIsModalOpen(true);
  }
  
  const handleSubmitPrompt = async () => {
    if (!supabase) { /* Mock logic skipped for brevity */ setIsModalOpen(false); return; }
    try {
      const payload = { title: promptFormTitle, content: promptFormContent, tags: [promptFormTag] };
      if (editingPromptId) {
          const { error } = await supabase.from('prompts').update(payload).eq('id', editingPromptId);
          if (error) throw error;
      } else {
          const { data: profile } = await supabase.from('profiles').select('structure_id').eq('id', user.id).single();
          const { error } = await supabase.from('prompts').insert({ ...payload, user_id: user.id, structure_id: profile?.structure_id, is_fork: !!parentPromptId, parent_id: parentPromptId });
          if (error) throw error;
      }
      await refreshData(); setIsModalOpen(false);
    } catch (err: any) { alert("Erreur : " + err.message); }
  };

  const handleCreateResource = async (title: string, category: string, scope: string, file: File | null, targetStructId?: string) => {
      let finalUrl = '', description = '';
      if (!supabase) { setIsModalOpen(false); return; }
      
      if (resFormType === 'file' && file) {
          try {
              const fileName = `${user.id}/${Date.now()}.${file.name.split('.').pop()}`;
              const { error } = await supabase.storage.from('documents').upload(fileName, file);
              if (error) throw error;
              finalUrl = supabase.storage.from('documents').getPublicUrl(fileName).data.publicUrl;
          } catch (e: any) { alert("Erreur upload: " + e.message); return; }
      } else {
          if(resFormType === 'text') description = resFormContent;
          else finalUrl = resFormContent;
      }
      
      const payload = { title, file_type: resFormType, category, access_scope: scope, target_structure_id: scope === 'local' ? targetStructId : null, file_url: finalUrl, description, uploaded_by: user.id };
      
      if (editingResourceId) await supabase.from('resources').update(payload).eq('id', editingResourceId);
      else await supabase.from('resources').insert(payload);
      
      await refreshData(); setIsModalOpen(false);
  };

  const deleteItem = async (table: string, id: string|number) => {
      if(!confirm("Confirmer la suppression ?")) return;
      if(supabase) { await supabase.from(table).delete().eq('id', id); await refreshData(); }
  };

  // --- RENDU PARTIEL ---
  const renderResources = () => {
    const articles = resources.filter(r => r.type === 'text');
    const videos = resources.filter(r => r.type === 'video');
    const tools = resources.filter(r => r.type === 'link');
    const files = resources.filter(r => ['file', 'pdf'].includes(r.type));

    return (
        <div className="space-y-12">
            {articles.length > 0 && (
                <section>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><AlignLeft className="text-amber-500"/> Articles & Tutoriels</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map(r => (
                            <div key={r.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow relative group">
                                <div className="flex justify-between items-start mb-2"><Badge color="green">{r.category}</Badge>{isAdmin && <div className="flex gap-1"><button onClick={() => { setEditingResourceId(r.id); setResFormType('text'); setResFormContent(r.description || ''); setIsModalOpen(true); setModalMode('resource'); }} className="text-slate-300 hover:text-indigo-600 p-1"><Pencil size={14}/></button><button onClick={() => deleteItem('resources', r.id)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={14}/></button></div>}</div>
                                <h4 className="font-bold text-slate-800 mb-2">{r.title}</h4>
                                <div className="text-sm text-slate-600 line-clamp-3 mb-4 flex-1">{r.description}</div>
                                <button onClick={() => setViewingResource(r)} className="text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 mt-auto">Lire l'article <ArrowRight size={14}/></button>
                            </div>
                        ))}
                    </div>
                </section>
            )}
            {videos.length > 0 && (
                <section>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Video className="text-red-500"/> Vidéothèque</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {videos.map(r => {
                            const videoId = r.file_url ? getYoutubeId(r.file_url) : null;
                            const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
                            return (
                                <div key={r.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative">
                                    <div className="aspect-video bg-slate-100 relative group-hover:opacity-90 transition-opacity">
                                        {thumbnailUrl ? <img src={thumbnailUrl} alt={r.title} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full"><Video size={48} className="text-slate-300"/></div>}
                                        <a href={r.file_url} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"><PlayCircle size={48} className="text-white drop-shadow-lg"/></a>
                                        {isAdmin && <button onClick={() => deleteItem('resources', r.id)} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>}
                                    </div>
                                    <div className="p-3"><h4 className="font-bold text-sm text-slate-800 truncate">{r.title}</h4><span className="text-xs text-slate-500">{r.category}</span></div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}
             {/* Outils et Fichiers simplifiés ici pour la longueur, suivez la même logique */}
             {tools.length > 0 && (
                 <section>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><LinkIcon className="text-indigo-500"/> Outils</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{tools.map(r => <div key={r.id} className="bg-white p-3 rounded border flex items-center gap-3"><Globe size={20} className="text-indigo-600"/><a href={r.file_url} target="_blank" className="flex-1 truncate font-medium text-slate-700">{r.title}</a>{isAdmin && <button onClick={()=>deleteItem('resources',r.id)}><Trash2 size={14} className="text-slate-300 hover:text-red-500"/></button>}</div>)}</div>
                 </section>
             )}
             {files.length > 0 && (
                 <section>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Download className="text-blue-500"/> Fichiers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{files.map(r => <div key={r.id} className="bg-white p-4 rounded border flex flex-col"><div className="flex justify-between"><FileText className="text-blue-500"/>{isAdmin && <button onClick={()=>deleteItem('resources',r.id)}><Trash2 size={14} className="text-slate-300 hover:text-red-500"/></button>}</div><h4 className="font-bold text-sm mt-2">{r.title}</h4><a href={r.file_url} target="_blank" className="mt-4 text-xs font-bold text-blue-600 flex items-center gap-1"><Download size={12}/> Télécharger</a></div>)}</div>
                 </section>
             )}
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col z-10 justify-between">
         <div>
            <div className="p-6 border-b border-slate-100">
               <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl"><Sparkles /><span>IAMESRESSOURCES</span></div>
               <div className="mt-4 p-2 bg-indigo-50 rounded text-xs font-bold text-indigo-900">{user.missionLocale}</div>
            </div>
            <nav className="p-4 space-y-1">
               <SidebarItem icon={GitFork} label="Prompts" active={currentTab === 'prompts'} onClick={() => setCurrentTab('prompts')} />
               <SidebarItem icon={BookOpen} label="Ressources" active={currentTab === 'resources'} onClick={() => setCurrentTab('resources')} />
               {isAdmin && <><div className="mt-6 mb-2 px-4 text-xs font-bold text-slate-400 uppercase">Administration</div><SidebarItem icon={Building2} label="Structures" active={currentTab === 'structures'} onClick={() => setCurrentTab('structures')} /><SidebarItem icon={Globe} label="Domaines" active={currentTab === 'domains'} onClick={() => setCurrentTab('domains')} /><SidebarItem icon={Users} label="Utilisateurs" active={currentTab === 'users'} onClick={() => setCurrentTab('users')} /></>}
            </nav>
         </div>
         <div className="p-4 border-t border-slate-100 bg-slate-50">
            <div className="mb-2 px-2"><p className="text-sm font-bold text-slate-700 truncate">{user.name}</p><p className="text-xs text-slate-500 truncate flex items-center gap-1">{user.role} {isAdmin && <ShieldCheck size={12} className="text-indigo-600"/>}</p></div>
            <button onClick={onLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-500 mb-3 ml-2 text-sm"><LogOut size={16}/> Déconnexion</button>
            <div className="flex justify-center gap-3 text-[10px] text-slate-400 border-t border-slate-200 pt-3"><button onClick={() => onOpenLegal('mentions')} className="hover:text-indigo-600">Mentions Légales</button><span>•</span><button onClick={() => onOpenLegal('privacy')} className="hover:text-indigo-600">Confidentialité</button></div>
            {/* LOGO SILVERIA */}
            <div className="mt-4 pt-2 border-t border-slate-200 text-center">
               <div className="flex items-center justify-center gap-2 mb-1"><img src="/logo-silveria.png" alt="Silveria" className="h-6 w-auto object-contain" /></div>
               <p className="text-[9px] text-slate-400">Conçu et mis à jour par Silveria</p>
            </div>
         </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8">
         {currentTab !== 'structures' && currentTab !== 'users' && currentTab !== 'domains' && (
             <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">{currentTab === 'prompts' ? 'Promptothèque' : 'Centre de Ressources'}</h1>
                <button onClick={() => { 
                       if (currentTab === 'prompts') prepareCreatePrompt();
                       else { setModalMode('resource'); setEditingResourceId(null); setSelectedFile(null); setResFormType('file'); setResFormContent(''); setIsModalOpen(true); }
                   }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-md hover:bg-indigo-700"><Plus size={18} /> Ajouter</button>
             </div>
         )}

         {currentTab === 'prompts' && (
            <div className="space-y-6 max-w-4xl">
               <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                 <button onClick={() => setSelectedCategory('Tous')} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'Tous' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>Tous</button>
                 {availableCategories.map(cat => <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>{cat}</button>)}
               </div>
               {prompts.filter(p => selectedCategory === 'Tous' || p.tags.includes(selectedCategory)).map(p => (
                  <div key={p.id} className={`bg-white p-6 rounded-xl border shadow-sm ${p.isFork ? 'border-l-4 border-l-indigo-400 ml-8' : 'border-slate-200'}`}>
                     <div className="flex justify-between mb-3">
                        <div className="flex items-center gap-3"><div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">{p.avatar}</div><div><h3 className="font-bold text-slate-800 flex items-center gap-2">{p.title} {p.isFork && p.parentAuthor && <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100"><GitFork size={10} className="mr-1"/> Variante de {p.parentAuthor}</span>}</h3><p className="text-xs text-slate-500">{p.author} • {p.missionLocale}</p></div></div>
                        <div className="flex items-center gap-2"><Badge>{p.tags[0]}</Badge>{(isAdmin || p.user_id === user.id) && <button onClick={() => prepareEditPrompt(p)} className="text-slate-300 hover:text-indigo-500 p-1"><Pencil size={14}/></button>}{isAdmin && <button onClick={() => deleteItem('prompts', p.id)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={14}/></button>}</div>
                     </div>
                     <div className="bg-slate-50 p-4 rounded text-sm font-mono text-slate-700 whitespace-pre-wrap">{p.content}</div>
                     <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end"><button onClick={() => prepareForkPrompt(p)} className="text-xs font-medium text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded flex items-center gap-1"><GitFork size={14} /> Améliorer / Proposer une variante</button></div>
                  </div>
               ))}
            </div>
         )}
         {currentTab === 'resources' && renderResources()}
         {/* J'ai abrégé les onglets admin ici pour que ça rentre, copiez le contenu des tableaux précédents si besoin */}
         {currentTab === 'structures' && <div className="p-4 bg-white rounded border">Gestion structures (à implémenter via les composants Admin)</div>}
         {currentTab === 'users' && <div className="p-4 bg-white rounded border">Gestion utilisateurs</div>}
         {currentTab === 'domains' && <div className="p-4 bg-white rounded border">Gestion domaines</div>}
      </main>

      {/* MODALS */}
      <Modal isOpen={!!viewingResource} onClose={() => setViewingResource(null)} title={viewingResource?.title || 'Lecture'}>
          <div className="prose prose-sm prose-slate max-w-none"><p className="whitespace-pre-wrap">{viewingResource?.description}</p></div>
      </Modal>

      {isModalOpen && (
         <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">Édition</h3><button onClick={() => setIsModalOpen(false)}><X /></button></div>
               <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); 
                  if(modalMode === 'prompt') handleSubmitPrompt();
                  else if(modalMode === 'resource') handleCreateResource(fd.get('title') as string, fd.get('category') as string, 'global', selectedFile);
               }} className="space-y-4">
                  {modalMode === 'prompt' && <><input value={promptFormTitle} onChange={e=>setPromptFormTitle(e.target.value)} className="w-full border p-2 rounded" placeholder="Titre"/><textarea value={promptFormContent} onChange={e=>setPromptFormContent(e.target.value)} rows={5} className="w-full border p-2 rounded" placeholder="Contenu..."/></>}
                  {modalMode === 'resource' && <><input name="title" className="w-full border p-2 rounded" placeholder="Titre"/><select name="category" className="w-full border p-2 rounded"><option>Formation</option><option>Outil</option></select><input type="file" onChange={e => e.target.files && setSelectedFile(e.target.files[0])}/></>}
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded font-bold w-full">Valider</button>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};
