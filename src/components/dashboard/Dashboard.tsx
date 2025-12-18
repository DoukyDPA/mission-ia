// src/components/dashboard/Dashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Plus, X, UploadCloud } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { User, AllowedDomain, Prompt, Resource, Structure } from '@/types';
import { Modal } from '@/components/ui/Modal';

// Composants externes (ce qui allège ce fichier)
import { Sidebar } from './Sidebar';
import { PromptList } from './PromptList';
import { ResourceList } from './ResourceList';
import { AdminPanel } from './AdminPanel';

// --- CONFIGURATION ÉDITEUR RICHE (React-Quill-New) ---
import 'react-quill-new/dist/quill.snow.css'; 
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const QUILL_MODULES = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    ['link', 'image'], // Support des images activé
    ['clean']
  ],
};

const QUILL_FORMATS = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet',
  'link', 'image'
];

// Données Mock (Secours)
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // --- DONNÉES ---
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  
  // --- UI STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(''); // 'prompt', 'resource', 'structure', 'user', 'domain'
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Catégories (avec "Emploi" ajouté)
  const [availableCategories, setAvailableCategories] = useState(['Administratif', 'Relation Jeunes', 'Emploi', 'Direction', 'RH', 'Projets', 'Autre']);
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  // --- ÉTATS DES FORMULAIRES ---

  // 1. Prompts
  const [editingPromptId, setEditingPromptId] = useState<string | number | null>(null);
  const [promptFormTitle, setPromptFormTitle] = useState('');
  const [promptFormContent, setPromptFormContent] = useState('');
  const [promptFormTag, setPromptFormTag] = useState('Administratif');
  const [parentPromptId, setParentPromptId] = useState<string | number | null>(null);

  // 2. Ressources (avec support contenu HTML pour ReactQuill)
  const [editingResourceId, setEditingResourceId] = useState<string | number | null>(null);
  const [resFormType, setResFormType] = useState<'file' | 'text' | 'link' | 'video'>('file');
  const [resFormContent, setResFormContent] = useState(''); // Stockera le HTML de l'éditeur
  const [resFormTitle, setResFormTitle] = useState('');
  const [resFormCategory, setResFormCategory] = useState('Formation');

  // 3. Admin Users (avec Structure et Rôle mis à jour)
  const [editingUserId, setEditingUserId] = useState<string | number | null>(null);
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormName, setUserFormName] = useState('');
  const [userFormRole, setUserFormRole] = useState('Utilisateur'); // Défaut: Utilisateur
  const [userFormStructure, setUserFormStructure] = useState<string | number>('');

  // 4. Admin Domaines
  const [domainFormValue, setDomainFormValue] = useState('');
  const [domainFormStructure, setDomainFormStructure] = useState<string | number>('');

  // 5. Admin Structures (avec Charte IA)
  const [editingStructureId, setEditingStructureId] = useState<string | number | null>(null);
  const [structFormName, setStructFormName] = useState('');
  const [structFormCity, setStructFormCity] = useState('');
  const [structFormHasCharter, setStructFormHasCharter] = useState(false);
  const [structFormCharterUrl, setStructFormCharterUrl] = useState('');

  const isAdmin = (user.role || '').trim().toLowerCase() === 'admin';
  // Récupération sécurisée de la structure de l'utilisateur courant (pour le bouton "Ma Charte" sidebar)
  const userStructure = structures.find(s => s.id == user.structure_id) || null;

  // --- CHARGEMENT DES DONNÉES (REFRESH) ---
  const refreshData = useCallback(async () => {
    if (!supabase) return; 
    try {
        // Prompts
        const { data: pData, error: pError } = await supabase.from('prompts').select(`*, profiles(full_name, avatar_url, role), structures(name)`).order('created_at', { ascending: false });
        if (pError) throw pError;
        if (pData) {
            const usedTags = new Set(['Administratif', 'Relation Jeunes', 'Emploi', 'Direction', 'RH', 'Projets', 'Autre']);
            pData.forEach((p: any) => { if (p.tags && Array.isArray(p.tags)) p.tags.forEach((t: string) => usedTags.add(t)); });
            setAvailableCategories(Array.from(usedTags).sort());
            setPrompts(pData.map((p: any) => ({
                id: p.id, title: p.title, content: p.content, author: p.profiles?.full_name || 'Inconnu', role: p.profiles?.role || 'Membre',
                avatar: (p.profiles?.full_name || 'U').substring(0,2).toUpperCase(), missionLocale: p.structures?.name || 'National',
                date: new Date(p.created_at).toLocaleDateString(), tags: p.tags || [], likes: p.likes_count || 0, forks: 0, isFork: p.is_fork,
                parentId: p.parent_id, parentAuthor: p.parent_id ? 'Autre' : undefined, user_id: p.user_id
            })));
        }
        
        // Ressources
        const { data: rData } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
        if (rData) setResources(rData.map((r: any) => ({ ...r, type: r.file_type || 'file', date: new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) })));
        
        // Structures
        const { data: sData } = await supabase.from('structures').select('*');
        if (sData) setStructures(sData);
        
        // Domaines
        const { data: dData } = await supabase.from('allowed_domains').select('*, structures(name)');
        if (dData) onAllowedDomainsChange(dData.map((d: any) => ({ id: d.id, domain: d.domain, structure_id: d.structure_id, structure_name: d.structures?.name })));
        
        // Users (Admin seulement)
        if (isAdmin) {
            const { data: uData } = await supabase.from('profiles').select('*, structures(name)');
            if (uData) setAdminUsers(uData.map((u: any) => ({ id: u.id, email: u.email, name: u.full_name || 'Sans nom', role: u.role, missionLocale: u.structures?.name || 'Non assigné', avatar: (u.full_name || 'U').substring(0,2).toUpperCase(), structure_id: u.structure_id })));
        }
    } catch (e) { console.error("Erreur refresh:", e); }
  }, [isAdmin, onAllowedDomainsChange]);

  useEffect(() => { if (!supabase) { setPrompts(MOCK_PROMPTS); setStructures(MOCK_STRUCTURES); onAllowedDomainsChange([]); } else { refreshData(); } }, [refreshData, onAllowedDomainsChange]);

  // --- ACTIONS SIMPLES ---
  const copyPrompt = (content: string) => { navigator.clipboard.writeText(content); alert("Prompt copié !"); };
  const deleteItem = async (table: string, id: string|number) => { if(!confirm("Supprimer ?")) return; if(supabase) { await supabase.from(table).delete().eq('id', id); await refreshData(); } };
  
  // --- PRÉPARATION DES MODALES (RESET DES FORMULAIRES) ---
  const prepareCreatePrompt = () => { setModalMode('prompt'); setEditingPromptId(null); setPromptFormTitle(''); setPromptFormContent(''); setPromptFormTag(availableCategories[0]); setParentPromptId(null); setIsModalOpen(true); }
  const prepareForkPrompt = (original: Prompt) => { setModalMode('prompt'); setEditingPromptId(null); setPromptFormTitle(`Variante : ${original.title}`); setPromptFormContent(original.content); setPromptFormTag(original.tags[0] || 'Administratif'); setParentPromptId(original.id); setIsModalOpen(true); }
  const prepareEditPrompt = (original: Prompt) => { setModalMode('prompt'); setEditingPromptId(original.id); setPromptFormTitle(original.title); setPromptFormContent(original.content); setPromptFormTag(original.tags[0] || availableCategories[0]); setParentPromptId(null); setIsModalOpen(true); }
  
  const prepareCreateResource = () => { setModalMode('resource'); setEditingResourceId(null); setResFormTitle(''); setResFormCategory('Formation'); setResFormType('file'); setResFormContent(''); setSelectedFile(null); setIsModalOpen(true); }
  const prepareEditResource = (r: Resource) => { setModalMode('resource'); setEditingResourceId(r.id); setResFormTitle(r.title); setResFormCategory(r.category); setResFormType(r.type as any); setResFormContent(r.type === 'text' ? (r.description || '') : (r.file_url || '')); setSelectedFile(null); setIsModalOpen(true); }
  
  const prepareCreateStructure = () => { setModalMode('structure'); setEditingStructureId(null); setStructFormName(''); setStructFormCity(''); setStructFormHasCharter(false); setStructFormCharterUrl(''); setSelectedFile(null); setIsModalOpen(true); }
  const prepareEditStructure = (s: Structure) => { setModalMode('structure'); setEditingStructureId(s.id); setStructFormName(s.name); setStructFormCity(s.city); setStructFormHasCharter(s.has_charter || false); setStructFormCharterUrl(s.charter_url || ''); setSelectedFile(null); setIsModalOpen(true); }
  
  const prepareEditUser = (u: User) => { setModalMode('user'); setEditingUserId(u.id); setUserFormName(u.name); setUserFormEmail(u.email); setUserFormRole(u.role); setUserFormStructure(u.structure_id || (structures[0] ? structures[0].id : '')); setIsModalOpen(true); }
  const prepareInviteUser = () => { setModalMode('user'); setEditingUserId(null); setUserFormName(''); setUserFormEmail(''); setUserFormRole('Utilisateur'); setUserFormStructure(structures[0] ? structures[0].id : ''); setIsModalOpen(true); }

  // --- SOUMISSION DES FORMULAIRES (SAVE) ---
  const handleSubmitPrompt = async () => {
    if (!supabase) { setIsModalOpen(false); return; }
    try {
        const payload = { title: promptFormTitle, content: promptFormContent, tags: [promptFormTag] };
        if (editingPromptId) { const { error } = await supabase.from('prompts').update(payload).eq('id', editingPromptId); if (error) throw error; } 
        else { const { data: profile } = await supabase.from('profiles').select('structure_id').eq('id', user.id).single(); const { error } = await supabase.from('prompts').insert({ ...payload, user_id: user.id, structure_id: profile?.structure_id, is_fork: !!parentPromptId, parent_id: parentPromptId }); if (error) throw error; }
        await refreshData(); setIsModalOpen(false);
    } catch (err: any) { alert("Erreur : " + err.message); }
  };

  const handleCreateResource = async () => {
    if (!supabase) { setIsModalOpen(false); return; }
    try {
        let finalUrl = resFormContent;
        if (resFormType === 'file' && selectedFile) { const fileName = `${user.id}/${Date.now()}.${selectedFile.name.split('.').pop()}`; await supabase.storage.from('documents').upload(fileName, selectedFile); finalUrl = supabase.storage.from('documents').getPublicUrl(fileName).data.publicUrl || ''; }
        else if (resFormType === 'text') { 
            // Cas Éditeur Riche : le contenu HTML est déjà dans resFormContent
            finalUrl = ''; 
        }
        
        const payload = { title: resFormTitle, file_type: resFormType, category: resFormCategory, access_scope: 'global', target_structure_id: null, file_url: finalUrl, description: resFormType === 'text' ? resFormContent : '', uploaded_by: user.id };
        if (editingResourceId) { const { error } = await supabase.from('resources').update(payload).eq('id', editingResourceId); if (error) throw error; } else { const { error } = await supabase.from('resources').insert(payload); if (error) throw error; }
        await refreshData(); setIsModalOpen(false);
    } catch (err: any) { alert("Erreur ressource : " + err.message); }
  };

  const handleSubmitStructure = async () => {
      if (!supabase) { setIsModalOpen(false); return; }
      try {
          let charterUrl = structFormCharterUrl;
          // Upload de la charte si présente
          if (structFormHasCharter && selectedFile) {
             const fileName = `charters/${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
             const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, selectedFile);
             if (uploadError) throw uploadError;
             charterUrl = supabase.storage.from('documents').getPublicUrl(fileName).data.publicUrl;
          }
          const payload = { name: structFormName, city: structFormCity, has_charter: structFormHasCharter, charter_url: structFormHasCharter ? charterUrl : null };
          if (editingStructureId) await supabase.from('structures').update(payload).eq('id', editingStructureId);
          else await supabase.from('structures').insert(payload);
          await refreshData(); setIsModalOpen(false);
      } catch (e: any) { alert("Erreur structure: " + e.message); }
  }

  const handleSubmitUser = async () => { 
      if (!supabase) return; 
      // Sauvegarde du Rôle ET de la Structure pour l'utilisateur
      if (editingUserId) await supabase.from('profiles').update({ full_name: userFormName, role: userFormRole, structure_id: userFormStructure }).eq('id', editingUserId); 
      await refreshData(); setIsModalOpen(false); 
  };
  
  const handleCreateDomain = async () => { if (!supabase) return; const normalized = domainFormValue.trim().toLowerCase(); await supabase.from('allowed_domains').insert({ domain: normalized, structure_id: domainFormStructure || null, created_by: user.id }); await refreshData(); setIsModalOpen(false); }


  // --- RENDU DU COMPOSANT ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row">
      {/* SIDEBAR : Logo, Navigation, Bouton Charte */}
      <Sidebar user={user} userStructure={userStructure} currentTab={currentTab} setCurrentTab={setCurrentTab} isAdmin={isAdmin} onLogout={onLogout} onOpenLegal={onOpenLegal} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      
      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 p-8">
         {/* En-tête avec titre et bouton Ajouter */}
         {['prompts', 'resources', 'structures', 'domains'].includes(currentTab) && (
             <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">{currentTab === 'prompts' ? 'Promptothèque' : currentTab === 'resources' ? 'Centre de Ressources' : 'Administration'}</h1>
                <button onClick={() => { 
                   if (currentTab === 'prompts') prepareCreatePrompt();
                   else if (currentTab === 'resources') prepareCreateResource();
                   else if (currentTab === 'structures') prepareCreateStructure();
                   else if (currentTab === 'domains') { setModalMode('domain'); setDomainFormValue(''); setIsModalOpen(true); }
                }} className="bg-[#116862] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-md hover:bg-[#0e524d]"><Plus size={18} /> Ajouter</button>
             </div>
         )}

         {/* Contenu des onglets géré par des composants dédiés */}
         {currentTab === 'prompts' && <PromptList prompts={prompts} user={user} isAdmin={isAdmin} categories={availableCategories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} onCopy={copyPrompt} onEdit={prepareEditPrompt} onDelete={(id) => deleteItem('prompts', id)} onFork={prepareForkPrompt} />}
         {currentTab === 'resources' && <ResourceList resources={resources} isAdmin={isAdmin} onEdit={prepareEditResource} onDelete={(id) => deleteItem('resources', id)} onView={setViewingResource} />}
         {(currentTab === 'structures' || currentTab === 'users' || currentTab === 'domains') && <AdminPanel currentTab={currentTab} structures={structures} users={adminUsers} domains={allowedDomains} onAdd={() => { if(currentTab==='structures') prepareCreateStructure(); else if(currentTab==='domains') {setModalMode('domain'); setIsModalOpen(true);} }} onDelete={deleteItem} onEditUser={prepareEditUser} onEditStructure={prepareEditStructure} onInviteUser={prepareInviteUser} />}
      </main>

      {/* MODALE DE LECTURE (Pour les articles riches) */}
      <Modal isOpen={!!viewingResource} onClose={() => setViewingResource(null)} title={viewingResource?.title || 'Lecture'}>
          <div 
             className="prose prose-sm prose-slate max-w-none text-slate-800 ql-editor"
             dangerouslySetInnerHTML={{ __html: viewingResource?.description || '' }}
          />
      </Modal>

      {/* MODALE D'ÉDITION (Le gros formulaire polyvalent) */}
      {isModalOpen && (
         <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">Édition</h3><button onClick={() => setIsModalOpen(false)}><X /></button></div>
               <form onSubmit={(e) => { e.preventDefault(); 
                  if(modalMode === 'prompt') handleSubmitPrompt();
                  else if(modalMode === 'resource') handleCreateResource();
                  else if(modalMode === 'structure') handleSubmitStructure();
                  else if(modalMode === 'domain') handleCreateDomain();
                  else if(modalMode === 'user') handleSubmitUser();
               }} className="space-y-4">
                  
                  {/* --- CHAMPS PROMPT --- */}
                  {modalMode === 'prompt' && (
                    <>
                        <div><label className="block text-xs font-bold text-slate-500 mb-1">Titre</label><input value={promptFormTitle} onChange={e=>setPromptFormTitle(e.target.value)} className="w-full border p-2 rounded" placeholder="Titre" required/></div>
                        <div><label className="block text-xs font-bold text-slate-500 mb-1">Contenu</label><textarea value={promptFormContent} onChange={e=>setPromptFormContent(e.target.value)} rows={5} className="w-full border p-2 rounded" placeholder="Contenu..." required/></div>
                        <div><label className="block text-xs font-bold text-slate-500 mb-1">Catégorie</label><select value={promptFormTag} onChange={e=>setPromptFormTag(e.target.value)} className="w-full border p-2 rounded bg-white">{availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                    </>
                  )}

                  {/* --- CHAMPS RESSOURCE (AVEC ÉDITEUR RICHE) --- */}
                  {modalMode === 'resource' && (
                     <>
                        <div><label className="block text-xs font-bold text-slate-500 mb-1">Titre</label><input value={resFormTitle} onChange={e=>setResFormTitle(e.target.value)} required className="w-full border p-2 rounded" placeholder="Titre"/></div>
                        <div><label className="block text-xs font-bold text-slate-500 mb-2">Type</label><div className="flex bg-slate-100 p-1 rounded-lg"><button type="button" onClick={() => setResFormType('file')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${resFormType === 'file' ? 'bg-white shadow text-[#116862]' : 'text-slate-500'}`}>Fichier</button><button type="button" onClick={() => setResFormType('text')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${resFormType === 'text' ? 'bg-white shadow text-[#116862]' : 'text-slate-500'}`}>Article</button><button type="button" onClick={() => setResFormType('link')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${resFormType === 'link' ? 'bg-white shadow text-[#116862]' : 'text-slate-500'}`}>Lien</button><button type="button" onClick={() => setResFormType('video')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${resFormType === 'video' ? 'bg-white shadow text-[#116862]' : 'text-slate-500'}`}>Vidéo</button></div></div>
                        
                        {resFormType === 'file' && <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer relative hover:bg-slate-50"><input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {if(e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);}} /><div className="flex flex-col items-center pointer-events-none"><UploadCloud className="text-slate-400 mb-2" size={32} /><span className="text-sm font-medium text-slate-600">{selectedFile ? selectedFile.name : (editingResourceId && resFormContent ? "Fichier actuel conservé" : "Cliquez pour sélectionner")}</span></div></div>}
                        
                        {/* Composant ReactQuill intégré ici */}
                        {resFormType === 'text' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Contenu de l'article</label>
                                <div className="bg-white">
                                    <ReactQuill 
                                        theme="snow" 
                                        value={resFormContent || ''} 
                                        onChange={setResFormContent} 
                                        modules={QUILL_MODULES}
                                        formats={QUILL_FORMATS}
                                        className="h-64 mb-12" 
                                    />
                                </div>
                            </div>
                        )}
                        
                        {(resFormType === 'link' || resFormType === 'video') && <div><label className="block text-xs font-bold text-slate-500 mb-1">URL</label><input type="url" value={resFormContent} onChange={(e) => setResFormContent(e.target.value)} placeholder="https://..." className="w-full border p-2 rounded" /></div>}
                        <div><label className="block text-xs font-bold text-slate-500 mb-1">Catégorie</label><select value={resFormCategory} onChange={e=>setResFormCategory(e.target.value)} className="w-full border p-2 rounded bg-white"><option>Formation</option><option>Veille</option><option>Juridique</option><option>Outil</option><option>Interne</option></select></div>
                     </>
                  )}

                  {/* --- CHAMPS STRUCTURE (AVEC CHARTE) --- */}
                  {modalMode === 'structure' && (
                    <>
                        <input value={structFormName} onChange={e=>setStructFormName(e.target.value)} className="w-full border p-2 rounded" placeholder="Nom Structure" required/>
                        <input value={structFormCity} onChange={e=>setStructFormCity(e.target.value)} className="w-full border p-2 rounded" placeholder="Ville" required/>
                        <div className="border-t pt-4 mt-2"><label className="flex items-center space-x-2 cursor-pointer mb-3"><input type="checkbox" checked={structFormHasCharter} onChange={e => setStructFormHasCharter(e.target.checked)} className="rounded text-[#116862] focus:ring-[#116862]" /><span className="text-sm font-bold text-slate-700">Cette structure possède une Charte IA</span></label>{structFormHasCharter && (<div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer relative hover:bg-slate-50"><input type="file" accept=".pdf,.doc,.docx" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {if(e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);}} /><div className="flex flex-col items-center pointer-events-none"><UploadCloud className="text-slate-400 mb-1" size={24} /><span className="text-xs font-medium text-slate-600">{selectedFile ? selectedFile.name : (structFormCharterUrl ? "Charte actuelle conservée" : "Cliquez pour uploader")}</span></div></div>)}</div>
                    </>
                  )}
                  
                  {modalMode === 'domain' && <><input value={domainFormValue} onChange={e=>setDomainFormValue(e.target.value)} className="w-full border p-2 rounded" placeholder="domaine.com" required/><select value={domainFormStructure} onChange={e=>setDomainFormStructure(e.target.value)} className="w-full border p-2 rounded"><option value="">-- Structure --</option>{structures.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></>}
                  
                  {/* --- CHAMPS USER (AVEC STRUCTURE SELECT) --- */}
                  {modalMode === 'user' && (
                    <>
                        <input value={userFormName} onChange={e=>setUserFormName(e.target.value)} className="w-full border p-2 rounded" placeholder="Nom"/>
                        <input value={userFormEmail} onChange={e=>setUserFormEmail(e.target.value)} className="w-full border p-2 rounded" placeholder="Email"/>
                        <select value={userFormRole} onChange={e=>setUserFormRole(e.target.value)} className="w-full border p-2 rounded"><option>Utilisateur</option><option>Admin</option></select>
                        <select value={userFormStructure} onChange={e=>setUserFormStructure(e.target.value)} className="w-full border p-2 rounded"><option value="">-- Choisir une structure --</option>{structures.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                    </>
                  )}
                  
                  <button className="bg-[#116862] text-white px-4 py-2 rounded font-bold w-full">Valider</button>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};
