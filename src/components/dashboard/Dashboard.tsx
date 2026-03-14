// src/components/dashboard/Dashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Plus, X, UploadCloud } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { User, AllowedDomain, Prompt, Resource, Structure } from '@/types';
import { Modal } from '@/components/ui/Modal';

import { Sidebar } from './Sidebar';
import { PromptList } from './PromptList';
import { ResourceList } from './ResourceList';
import { AdminPanel } from './AdminPanel';
import { PromptAssistant } from './PromptAssistant';
import { Home } from './Home';
import { FAQ } from './FAQ';
import { Forum } from './Forum';

import 'react-quill-new/dist/quill.snow.css'; 
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const QUILL_MODULES = { toolbar: [ [{ 'header': [1, 2, false] }], ['bold', 'italic', 'underline', 'strike', 'blockquote'], [{'list': 'ordered'}, {'list': 'bullet'}], ['link', 'image'], ['clean'] ] };
const QUILL_FORMATS = [ 'header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'list', 'bullet', 'link', 'image' ];

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onOpenLegal: (type: 'mentions' | 'privacy') => void;
  allowedDomains: AllowedDomain[];
  onAllowedDomainsChange: (domains: AllowedDomain[]) => void;
}

export const Dashboard = ({ user, onLogout, onOpenLegal, allowedDomains, onAllowedDomainsChange }: DashboardProps) => {
  const [currentTab, setCurrentTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(''); 
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const [editingPromptId, setEditingPromptId] = useState<string | number | null>(null);
  const [promptFormTitle, setPromptFormTitle] = useState('');
  const [promptFormContent, setPromptFormContent] = useState('');
  const [promptFormTag, setPromptFormTag] = useState('');
  const [parentPromptId, setParentPromptId] = useState<string | number | null>(null);
  const [isCreatingNewTag, setIsCreatingNewTag] = useState(false);

  const [editingResourceId, setEditingResourceId] = useState<string | number | null>(null);
  const [resFormType, setResFormType] = useState<'file' | 'text' | 'link' | 'video'>('file');
  const [resFormContent, setResFormContent] = useState(''); 
  const [resFormTitle, setResFormTitle] = useState('');
  const [resFormCategory, setResFormCategory] = useState('Formation');
  
  // NOUVEAUX ÉTATS POUR LA RESSOURCE
  const [resFormTags, setResFormTags] = useState('');
  const [resFormImageUrl, setResFormImageUrl] = useState('');

  const [editingUserId, setEditingUserId] = useState<string | number | null>(null);
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormName, setUserFormName] = useState('');
  const [userFormRole, setUserFormRole] = useState('Utilisateur'); 
  const [userFormStructure, setUserFormStructure] = useState<string | number>('');

  const [domainFormValue, setDomainFormValue] = useState('');
  const [domainFormStructure, setDomainFormStructure] = useState<string | number>('');

  const [editingStructureId, setEditingStructureId] = useState<string | number | null>(null);
  const [structFormName, setStructFormName] = useState('');
  const [structFormCity, setStructFormCity] = useState('');
  const [structFormHasCharter, setStructFormHasCharter] = useState(false);
  const [structFormCharterUrl, setStructFormCharterUrl] = useState('');

  const isAdmin = (user.role || '').trim().toLowerCase() === 'admin';
  const userStructure = structures.find(s => s.id == user.structure_id) || null;
  
  const cleanHtmlContent = (html: string) => { return html ? html.replace(/style="[^"]*"/g, "").replace(/&nbsp;/g, " ") : ""; };

  const refreshData = useCallback(async () => {
    if (!supabase) return; 
    try {
        const { data: pData } = await supabase.from('prompts').select(`*, profiles(full_name, avatar_url, role), structures(name)`).order('created_at', { ascending: false });
        if (pData) {
            const usedTags = new Set<string>();
            pData.forEach((p: any) => { if (p.tags && Array.isArray(p.tags)) p.tags.forEach((t: string) => usedTags.add(t)); });
            const dynamicCategories = Array.from(usedTags).sort();
            if (dynamicCategories.length === 0) dynamicCategories.push('Général');
            setAvailableCategories(dynamicCategories);
            
            setPrompts(pData.map((p: any) => ({
                id: p.id, title: p.title, content: p.content, author: p.profiles?.full_name || 'Inconnu', role: p.profiles?.role || 'Membre',
                avatar: (p.profiles?.full_name || 'U').substring(0,2).toUpperCase(), missionLocale: p.structures?.name || 'National',
                date: new Date(p.created_at).toLocaleDateString(), tags: p.tags || [], likes: p.likes_count || 0, forks: 0, isFork: p.is_fork || false,
                parentId: p.parent_id, parentAuthor: p.parent_id ? 'Autre' : undefined, user_id: p.user_id
            })));
        }
        
        const { data: rData } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
        // MAPPAGE DE L'IMAGE ET DES TAGS DE LA BDD
        if (rData) setResources(rData.map((r: any) => ({ 
            ...r, type: r.file_type || 'file', tags: r.tags || [], image_url: r.image_url || null,
            date: new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) 
        })));
        
        const { data: sData } = await supabase.from('structures').select('*');
        if (sData) setStructures(sData);
        
        const { data: dData } = await supabase.from('allowed_domains').select('*, structures(name)');
        if (dData) onAllowedDomainsChange(dData.map((d: any) => ({ id: d.id, domain: d.domain, structure_id: d.structure_id, structure_name: d.structures?.name })));
        
        if (isAdmin) {
            const { data: uData } = await supabase.from('profiles').select('*, structures(name)');
            if (uData) setAdminUsers(uData.map((u: any) => ({ id: u.id, email: u.email, name: u.full_name || 'Sans nom', role: u.role, missionLocale: u.structures?.name || 'Non assigné', avatar: (u.full_name || 'U').substring(0,2).toUpperCase(), structure_id: u.structure_id })));
        }
    } catch (e) { console.error("Erreur refresh:", e); }
  }, [isAdmin, onAllowedDomainsChange]);

  useEffect(() => { refreshData(); }, [refreshData]);

  const copyPrompt = (content: string) => { navigator.clipboard.writeText(content); alert("Prompt copié !"); };
  const deleteItem = async (table: string, id: string|number) => { if(!confirm("Supprimer ?")) return; if(supabase) { await supabase.from(table).delete().eq('id', id); await refreshData(); } };
  
  const prepareCreatePrompt = () => { setModalMode('prompt'); setEditingPromptId(null); setPromptFormTitle(''); setPromptFormContent(''); setPromptFormTag(availableCategories[0] || 'Général'); setParentPromptId(null); setIsCreatingNewTag(false); setIsModalOpen(true); }
  const prepareForkPrompt = (original: Prompt) => { setModalMode('prompt'); setEditingPromptId(null); setPromptFormTitle(`Variante : ${original.title}`); setPromptFormContent(original.content); setPromptFormTag(original.tags[0] || availableCategories[0] || 'Général'); setParentPromptId(original.id); setIsCreatingNewTag(false); setIsModalOpen(true); }
  const prepareEditPrompt = (original: Prompt) => { setModalMode('prompt'); setEditingPromptId(original.id); setPromptFormTitle(original.title); setPromptFormContent(original.content); setPromptFormTag(original.tags[0] || availableCategories[0] || 'Général'); setParentPromptId(null); setIsCreatingNewTag(false); setIsModalOpen(true); }
  
  // RESET DES NOUVEAUX CHAMPS RESSOURCES
  const prepareCreateResource = () => { setModalMode('resource'); setEditingResourceId(null); setResFormTitle(''); setResFormCategory('Veille'); setResFormTags(''); setResFormImageUrl(''); setResFormType('file'); setResFormContent(''); setSelectedFile(null); setIsModalOpen(true); }
  const prepareEditResource = (r: Resource) => { setModalMode('resource'); setEditingResourceId(r.id); setResFormTitle(r.title); setResFormCategory(r.category); setResFormTags(r.tags?.join(', ') || ''); setResFormImageUrl(r.image_url || ''); setResFormType(r.type as any); setResFormContent(r.type === 'text' ? (r.description || '') : (r.file_url || '')); setSelectedFile(null); setIsModalOpen(true); }
  
  const prepareCreateStructure = () => { setModalMode('structure'); setEditingStructureId(null); setStructFormName(''); setStructFormCity(''); setStructFormHasCharter(false); setStructFormCharterUrl(''); setSelectedFile(null); setIsModalOpen(true); }
  const prepareEditStructure = (s: Structure) => { setModalMode('structure'); setEditingStructureId(s.id); setStructFormName(s.name); setStructFormCity(s.city); setStructFormHasCharter(s.has_charter || false); setStructFormCharterUrl(s.charter_url || ''); setSelectedFile(null); setIsModalOpen(true); }
  
  const prepareEditUser = (u: User) => { setModalMode('user'); setEditingUserId(u.id); setUserFormName(u.name); setUserFormEmail(u.email); setUserFormRole(u.role); setUserFormStructure(u.structure_id || (structures[0] ? structures[0].id : '')); setIsModalOpen(true); }
  const prepareInviteUser = () => { setModalMode('user'); setEditingUserId(null); setUserFormName(''); setUserFormEmail(''); setUserFormRole('Utilisateur'); setUserFormStructure(structures[0] ? structures[0].id : ''); setIsModalOpen(true); }

  const handleSubmitPrompt = async () => {
    if (!supabase) { setIsModalOpen(false); return; }
    try {
        const finalTag = promptFormTag.trim() ? promptFormTag.trim() : 'Général';
        const payload = { title: promptFormTitle, content: promptFormContent, tags: [finalTag] };
        if (editingPromptId) { await supabase.from('prompts').update(payload).eq('id', editingPromptId); } 
        else { const { data: profile } = await supabase.from('profiles').select('structure_id').eq('id', user.id).single(); await supabase.from('prompts').insert({ ...payload, user_id: user.id, structure_id: profile?.structure_id, is_fork: !!parentPromptId, parent_id: parentPromptId }); }
        await refreshData(); setIsModalOpen(false);
    } catch (err: any) { alert("Erreur : " + err.message); }
  };

  const handleCreateResource = async () => {
    if (!supabase) { setIsModalOpen(false); return; }
    try {
        let finalUrl = resFormContent;
        if (resFormType === 'file' && selectedFile) { const fileName = `${user.id}/${Date.now()}.${selectedFile.name.split('.').pop()}`; await supabase.storage.from('documents').upload(fileName, selectedFile); finalUrl = supabase.storage.from('documents').getPublicUrl(fileName).data.publicUrl || ''; }
        else if (resFormType === 'text') { finalUrl = ''; }
        
        // CONVERSION DU CHAMP TEXTE EN TABLEAU DE MOTS-CLÉS
        const tagsArray = resFormTags.split(',').map(t => t.trim()).filter(Boolean);

        const payload = { 
            title: resFormTitle, file_type: resFormType, category: resFormCategory, 
            tags: tagsArray, image_url: resFormImageUrl || null, // NOUVEAUX CHAMPS
            access_scope: 'global', target_structure_id: null, file_url: finalUrl, 
            description: resFormType === 'text' ? resFormContent : '', uploaded_by: user.id 
        };
        
        if (editingResourceId) { await supabase.from('resources').update(payload).eq('id', editingResourceId); } 
        else { await supabase.from('resources').insert(payload); }
        await refreshData(); setIsModalOpen(false);
    } catch (err: any) { alert("Erreur ressource : " + err.message); }
  };

  const handleSubmitStructure = async () => {
      if (!supabase) return;
      try {
          let charterUrl = structFormCharterUrl;
          if (structFormHasCharter && selectedFile) {
             const fileName = `charters/${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
             await supabase.storage.from('documents').upload(fileName, selectedFile);
             charterUrl = supabase.storage.from('documents').getPublicUrl(fileName).data.publicUrl;
          }
          const payload = { name: structFormName, city: structFormCity, has_charter: structFormHasCharter, charter_url: structFormHasCharter ? charterUrl : null };
          if (editingStructureId) await supabase.from('structures').update(payload).eq('id', editingStructureId); else await supabase.from('structures').insert(payload);
          await refreshData(); setIsModalOpen(false);
      } catch (e: any) { alert("Erreur structure: " + e.message); }
  }

  const handleSubmitUser = async () => { if (!supabase) return; if (editingUserId) await supabase.from('profiles').update({ full_name: userFormName, role: userFormRole, structure_id: userFormStructure }).eq('id', editingUserId); await refreshData(); setIsModalOpen(false); };
  const handleCreateDomain = async () => { if (!supabase) return; await supabase.from('allowed_domains').insert({ domain: domainFormValue.trim().toLowerCase(), structure_id: domainFormStructure || null, created_by: user.id }); await refreshData(); setIsModalOpen(false); }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row">
      <Sidebar user={user} userStructure={userStructure} currentTab={currentTab} setCurrentTab={setCurrentTab} isAdmin={isAdmin} onLogout={onLogout} onOpenLegal={onOpenLegal} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      
      <main className="flex-1 p-4 md:p-8">
         {['prompts', 'resources', 'structures', 'domains', 'assistant', 'forum', 'faq'].includes(currentTab) && (
             <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-800">
                    {currentTab === 'prompts' ? 'Promptothèque' : currentTab === 'assistant' ? 'Laboratoire de Prompts' : currentTab === 'resources' ? 'Ressources & Veille' : currentTab === 'forum' ? 'Forum' : currentTab === 'faq' ? 'Foire aux questions' : 'Administration'}
                </h1>
                
                {!['assistant', 'forum', 'faq'].includes(currentTab) && (
                    <button onClick={() => { 
                       if (currentTab === 'prompts') prepareCreatePrompt();
                       else if (currentTab === 'resources') prepareCreateResource();
                       else if (currentTab === 'structures') prepareCreateStructure();
                       else if (currentTab === 'domains') { setModalMode('domain'); setDomainFormValue(''); setIsModalOpen(true); }
                    }} className="bg-[#116862] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-md hover:bg-[#0e524d]">
                        <Plus size={18} /> Ajouter
                    </button>
                )}
                {currentTab === 'faq' && isAdmin && (
                    <button onClick={() => { setModalMode('faq'); setIsModalOpen(true); }} className="bg-[#116862] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-md hover:bg-[#0e524d]">
                        <Plus size={18} /> Ajouter une Q/R
                    </button>
                )}
             </div>
         )}

         {currentTab === 'home' && <Home onNavigate={setCurrentTab} />}
         {currentTab === 'prompts' && <PromptList prompts={prompts} user={user} isAdmin={isAdmin} categories={availableCategories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} onCopy={copyPrompt} onEdit={prepareEditPrompt} onDelete={(id) => deleteItem('prompts', id)} onFork={prepareForkPrompt} />}
         {currentTab === 'assistant' && <PromptAssistant />}
         {currentTab === 'resources' && <ResourceList resources={resources} isAdmin={isAdmin} onEdit={prepareEditResource} onDelete={(id) => deleteItem('resources', id)} onView={setViewingResource} />}
         {currentTab === 'forum' && <Forum user={user} />}
         {currentTab === 'faq' && <FAQ isAdmin={isAdmin} />}

         {(currentTab === 'structures' || currentTab === 'users' || currentTab === 'domains') && <AdminPanel currentTab={currentTab} structures={structures} users={adminUsers} domains={allowedDomains} onAdd={() => { if(currentTab==='structures') prepareCreateStructure(); else if(currentTab==='domains') {setModalMode('domain'); setIsModalOpen(true);} }} onDelete={deleteItem} onEditUser={prepareEditUser} onEditStructure={prepareEditStructure} onInviteUser={prepareInviteUser} />}
      </main>

      <Modal isOpen={!!viewingResource} onClose={() => setViewingResource(null)} title={viewingResource?.title || 'Lecture'}>
          <div className="w-full">
              <div 
                 className="prose prose-sm prose-slate max-w-none text-slate-800 !whitespace-normal !break-words [&_*]:!whitespace-normal [&_*]:!break-words [&_*]:!max-w-full [&_img]:!max-w-full [&_img]:!h-auto [&_img]:rounded-lg [&_img]:my-4 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                 dangerouslySetInnerHTML={{ __html: cleanHtmlContent(viewingResource?.description || '') }}
              />
          </div>
      </Modal>

      {isModalOpen && (
         <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">Édition</h3><button onClick={() => setIsModalOpen(false)}><X className="text-slate-400 hover:text-slate-600" /></button></div>
               <form onSubmit={(e) => { e.preventDefault(); 
                  if(modalMode === 'prompt') handleSubmitPrompt();
                  else if(modalMode === 'resource') handleCreateResource();
                  else if(modalMode === 'structure') handleSubmitStructure();
                  else if(modalMode === 'domain') handleCreateDomain();
                  else if(modalMode === 'user') handleSubmitUser();
               }} className="space-y-5">
                  
                  {modalMode === 'prompt' && (
                    <>
                        <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Titre du prompt</label><input value={promptFormTitle} onChange={e=>setPromptFormTitle(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#116862] outline-none" placeholder="Ex: Synthèse d'entretien..." required/></div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Catégorie</label>
                           {!isCreatingNewTag ? (
                              <select value={promptFormTag} onChange={e => { if (e.target.value === '__NEW__') { setIsCreatingNewTag(true); setPromptFormTag(''); } else { setPromptFormTag(e.target.value); } }} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#116862] outline-none bg-white cursor-pointer">
                                 {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}<option disabled>──────────</option><option value="__NEW__" className="font-bold text-[#116862]">➕ Créer une nouvelle catégorie...</option>
                              </select>
                           ) : (
                              <div className="flex gap-2">
                                 <input type="text" value={promptFormTag} onChange={e => setPromptFormTag(e.target.value)} placeholder="Nom de la nouvelle catégorie..." className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#116862] outline-none" autoFocus required />
                                 <button type="button" onClick={() => { setIsCreatingNewTag(false); setPromptFormTag(availableCategories[0] || 'Général'); }} className="bg-slate-100 text-slate-600 px-4 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">Annuler</button>
                              </div>
                           )}
                        </div>
                        <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Instructions (Contenu)</label><textarea value={promptFormContent} onChange={e=>setPromptFormContent(e.target.value)} rows={7} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#116862] outline-none font-mono text-sm" placeholder="Agis comme un conseiller expert en insertion. Rédige une synthèse..." required/></div>
                    </>
                  )}

                  {/* FORMULAIRE RESSOURCE MIS À JOUR */}
                  {modalMode === 'resource' && (
                     <>
                        <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Titre</label><input value={resFormTitle} onChange={e=>setResFormTitle(e.target.value)} required className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#116862] outline-none" placeholder="Titre de la ressource"/></div>
                        
                        <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Catégorie principale</label>
                           <select value={resFormCategory} onChange={e=>setResFormCategory(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#116862] outline-none bg-white">
                              <option>Formation</option><option>Veille</option><option>Juridique</option><option>Outil</option><option>Interne</option>
                           </select>
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Mots-clés (tags)</label>
                           <input value={resFormTags} onChange={e=>setResFormTags(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#116862] outline-none" placeholder="Ex: NotebookLM, slides, IA (séparés par des virgules)"/>
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">URL de l'image (Optionnel)</label>
                           <input value={resFormImageUrl} onChange={e=>setResFormImageUrl(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#116862] outline-none" placeholder="https://exemple.com/image.jpg"/>
                           <p className="text-[10px] text-slate-400 mt-1">Si vous intégrez une image dans l'article ci-dessous, elle fera automatiquement office de couverture.</p>
                        </div>

                        <div><label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Type de ressource</label><div className="flex bg-slate-100 p-1 rounded-lg"><button type="button" onClick={() => setResFormType('file')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${resFormType === 'file' ? 'bg-white shadow text-[#116862]' : 'text-slate-500'}`}>Fichier</button><button type="button" onClick={() => setResFormType('text')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${resFormType === 'text' ? 'bg-white shadow text-[#116862]' : 'text-slate-500'}`}>Article</button><button type="button" onClick={() => setResFormType('link')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${resFormType === 'link' ? 'bg-white shadow text-[#116862]' : 'text-slate-500'}`}>Lien</button><button type="button" onClick={() => setResFormType('video')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${resFormType === 'video' ? 'bg-white shadow text-[#116862]' : 'text-slate-500'}`}>Vidéo</button></div></div>
                        
                        {resFormType === 'file' && <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer relative hover:bg-slate-50"><input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {if(e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);}} /><div className="flex flex-col items-center pointer-events-none"><UploadCloud className="text-slate-400 mb-2" size={32} /><span className="text-sm font-medium text-slate-600">{selectedFile ? selectedFile.name : (editingResourceId && resFormContent ? "Fichier actuel conservé" : "Cliquez pour sélectionner un fichier")}</span></div></div>}
                        
                        {resFormType === 'text' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Contenu de l'article</label>
                                <div className="bg-white">
                                    <ReactQuill theme="snow" value={resFormContent || ''} onChange={setResFormContent} modules={QUILL_MODULES} formats={QUILL_FORMATS} className="h-64 mb-12" />
                                </div>
                            </div>
                        )}
                        
                        {(resFormType === 'link' || resFormType === 'video') && <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">URL de destination</label><input type="url" value={resFormContent} onChange={(e) => setResFormContent(e.target.value)} placeholder="https://..." className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#116862] outline-none" required /></div>}
                     </>
                  )}

                  {/* AUTRES FORMULAIRES ... */}
                  {modalMode === 'structure' && (
                    <>
                        <input value={structFormName} onChange={e=>setStructFormName(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#116862] outline-none" placeholder="Nom Structure" required/>
                        <input value={structFormCity} onChange={e=>setStructFormCity(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#116862] outline-none" placeholder="Ville" required/>
                        <div className="border-t pt-4 mt-2"><label className="flex items-center space-x-2 cursor-pointer mb-3"><input type="checkbox" checked={structFormHasCharter} onChange={e => setStructFormHasCharter(e.target.checked)} className="rounded text-[#116862] focus:ring-[#116862]" /><span className="text-sm font-bold text-slate-700">Cette structure possède une Charte IA</span></label>{structFormHasCharter && (<div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer relative hover:bg-slate-50"><input type="file" accept=".pdf,.doc,.docx" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {if(e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);}} /><div className="flex flex-col items-center pointer-events-none"><UploadCloud className="text-slate-400 mb-1" size={24} /><span className="text-xs font-medium text-slate-600">{selectedFile ? selectedFile.name : (structFormCharterUrl ? "Charte actuelle conservée" : "Cliquez pour uploader")}</span></div></div>)}</div>
                    </>
                  )}
                  
                  {modalMode === 'domain' && <><input value={domainFormValue} onChange={e=>setDomainFormValue(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#116862] outline-none" placeholder="domaine.com" required/><select value={domainFormStructure} onChange={e=>setDomainFormStructure(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#116862] outline-none"><option value="">-- Structure --</option>{structures.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></>}
                  
                  {modalMode === 'user' && (
                    <>
                        <input value={userFormName} onChange={e=>setUserFormName(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#116862] outline-none" placeholder="Nom"/>
                        <input value={userFormEmail} onChange={e=>setUserFormEmail(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#116862] outline-none" placeholder="Email"/>
                        <select value={userFormRole} onChange={e=>setUserFormRole(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#116862] outline-none"><option>Utilisateur</option><option>Admin</option></select>
                        <select value={userFormStructure} onChange={e=>setUserFormStructure(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#116862] outline-none"><option value="">-- Choisir une structure --</option>{structures.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                    </>
                  )}

                  <button className="bg-[#116862] text-white px-4 py-3 rounded-lg font-bold w-full hover:bg-[#0e524d] transition-colors mt-2 shadow-md">Valider et enregistrer</button>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};
