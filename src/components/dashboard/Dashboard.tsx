import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Plus, X, UploadCloud } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { User, AllowedDomain, Prompt, Resource, Structure } from '@/types';
import { Modal } from '@/components/ui/Modal';

// Composants externes
import { Sidebar } from './Sidebar';
import { PromptList } from './PromptList';
import { ResourceList } from './ResourceList';
import { AdminPanel } from './AdminPanel';
import { PromptAssistant } from './PromptAssistant';
import { Home } from './Home'; // IMPORT DU NOUVEAU COMPOSANT

// Configuration éditeur riche
import 'react-quill-new/dist/quill.snow.css'; 
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const QUILL_MODULES = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    ['link', 'image'],
    ['clean']
  ],
};

const QUILL_FORMATS = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet',
  'link', 'image'
];

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onOpenLegal: (type: 'mentions' | 'privacy') => void;
  allowedDomains: AllowedDomain[];
  onAllowedDomainsChange: (domains: AllowedDomain[]) => void;
}

export const Dashboard = ({ user, onLogout, onOpenLegal, allowedDomains, onAllowedDomainsChange }: DashboardProps) => {
  // CHANGEMENT DE L'ONGLET PAR DÉFAUT : 'home'
  const [currentTab, setCurrentTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // DONNÉES
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  
  // UI STATE
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(''); 
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [availableCategories, setAvailableCategories] = useState(['Administratif', 'Relation Jeunes', 'Emploi', 'Direction', 'RH', 'Projets', 'Autre']);
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  // FORMULAIRES
  const [editingPromptId, setEditingPromptId] = useState<string | number | null>(null);
  const [promptFormTitle, setPromptFormTitle] = useState('');
  const [promptFormContent, setPromptFormContent] = useState('');
  const [promptFormTag, setPromptFormTag] = useState('Administratif');
  const [parentPromptId, setParentPromptId] = useState<string | number | null>(null);

  const [editingResourceId, setEditingResourceId] = useState<string | number | null>(null);
  const [resFormType, setResFormType] = useState<'file' | 'text' | 'link' | 'video'>('file');
  const [resFormContent, setResFormContent] = useState(''); 
  const [resFormTitle, setResFormTitle] = useState('');
  const [resFormCategory, setResFormCategory] = useState('Formation');

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
  
  const cleanHtmlContent = (html: string) => {
      if (!html) return "";
      return html.replace(/style="[^"]*"/g, "").replace(/&nbsp;/g, " ");       
  };

  const refreshData = useCallback(async () => {
    if (!supabase) return; 
    try {
        const { data: pData } = await supabase.from('prompts').select(`*, profiles(full_name, avatar_url, role), structures(name)`).order('created_at', { ascending: false });
        if (pData) {
            const usedTags = new Set(['Administratif', 'Relation Jeunes', 'Emploi', 'Direction', 'RH', 'Projets', 'Autre']);
            pData.forEach((p: any) => { if (p.tags && Array.isArray(p.tags)) p.tags.forEach((t: string) => usedTags.add(t)); });
            setAvailableCategories(Array.from(usedTags).sort());
            setPrompts(pData.map((p: any) => ({
                id: p.id, title: p.title, content: p.content, author: p.profiles?.full_name || 'Inconnu', role: p.profiles?.role || 'Membre',
                avatar: (p.profiles?.full_name || 'U').substring(0,2).toUpperCase(), missionLocale: p.structures?.name || 'National',
                date: new Date(p.created_at).toLocaleDateString(), tags: p.tags || [], likes: p.likes_count || 0, forks: 0, isFork: p.is_fork,
                parentId: p.parent_id, user_id: p.user_id
            })));
        }
        const { data: rData } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
        if (rData) setResources(rData.map((r: any) => ({ ...r, type: r.file_type || 'file', date: new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) })));
        const { data: sData } = await supabase.from('structures').select('*');
        if (sData) setStructures(sData);
        if (isAdmin) {
            const { data: uData } = await supabase.from('profiles').select('*, structures(name)');
            if (uData) setAdminUsers(uData.map((u: any) => ({ ...u, name: u.full_name || 'Sans nom', missionLocale: u.structures?.name || 'Non assigné' })));
        }
    } catch (e) { console.error("Erreur refresh:", e); }
  }, [isAdmin]);

  useEffect(() => { refreshData(); }, [refreshData]);

  // Fonctions de préparation des modales
  const prepareCreatePrompt = () => { setModalMode('prompt'); setEditingPromptId(null); setPromptFormTitle(''); setPromptFormContent(''); setIsModalOpen(true); }
  const prepareEditPrompt = (p: Prompt) => { setModalMode('prompt'); setEditingPromptId(p.id); setPromptFormTitle(p.title); setPromptFormContent(p.content); setIsModalOpen(true); }
  const prepareForkPrompt = (p: Prompt) => { setModalMode('prompt'); setEditingPromptId(null); setPromptFormTitle(`Variante : ${p.title}`); setPromptFormContent(p.content); setParentPromptId(p.id); setIsModalOpen(true); }
  
  const prepareCreateResource = () => { setModalMode('resource'); setEditingResourceId(null); setResFormTitle(''); setResFormType('file'); setIsModalOpen(true); }
  const prepareEditResource = (r: Resource) => { setModalMode('resource'); setEditingResourceId(r.id); setResFormTitle(r.title); setResFormType(r.type as any); setIsModalOpen(true); }

  const deleteItem = async (table: string, id: any) => { if(confirm("Supprimer ?")) { await supabase.from(table).delete().eq('id', id); refreshData(); } };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row">
      <Sidebar 
        user={user} 
        userStructure={userStructure} 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        isAdmin={isAdmin} 
        onLogout={onLogout} 
        onOpenLegal={onOpenLegal} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />
      
      <main className="flex-1 p-8">
         {/* En-tête dynamique */}
         {['home', 'prompts', 'resources', 'structures', 'domains', 'assistant', 'users'].includes(currentTab) && (
             <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">
                    {currentTab === 'home' ? 'Guide d’utilisation' : 
                     currentTab === 'prompts' ? 'Promptothèque' : 
                     currentTab === 'assistant' ? 'Laboratoire de Prompts' : 
                     currentTab === 'resources' ? 'Centre de Ressources' : 'Administration'}
                </h1>
                
                {/* On n'affiche le bouton Ajouter que sur certaines pages */}
                {!['home', 'assistant'].includes(currentTab) && (
                    <button onClick={() => { 
                       if (currentTab === 'prompts') prepareCreatePrompt();
                       else if (currentTab === 'resources') prepareCreateResource();
                       else if (currentTab === 'structures') setModalMode('structure');
                       else if (currentTab === 'domains') setModalMode('domain');
                       setIsModalOpen(true);
                    }} className="bg-[#116862] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-md hover:bg-[#0e524d]">
                        <Plus size={18} /> Ajouter
                    </button>
                )}
             </div>
         )}

         {/* Navigation par onglets */}
         {currentTab === 'home' && <Home />}
         {currentTab === 'prompts' && <PromptList prompts={prompts} user={user} isAdmin={isAdmin} categories={availableCategories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} onCopy={(c) => {navigator.clipboard.writeText(c); alert("Copié !");}} onEdit={prepareEditPrompt} onDelete={(id) => deleteItem('prompts', id)} onFork={prepareForkPrompt} />}
         {currentTab === 'assistant' && <PromptAssistant />}
         {currentTab === 'resources' && <ResourceList resources={resources} isAdmin={isAdmin} onEdit={prepareEditResource} onDelete={(id) => deleteItem('resources', id)} onView={setViewingResource} />}
         
         {(currentTab === 'structures' || currentTab === 'users' || currentTab === 'domains') && (
            <AdminPanel 
                currentTab={currentTab} 
                structures={structures} 
                users={adminUsers} 
                domains={allowedDomains} 
                onDelete={deleteItem} 
                onEditUser={(u) => {setEditingUserId(u.id); setModalMode('user'); setIsModalOpen(true);}}
                onEditStructure={(s) => {setEditingStructureId(s.id); setModalMode('structure'); setIsModalOpen(true);}}
                onInviteUser={() => {setModalMode('user'); setIsModalOpen(true);}}
                onAdd={() => {setModalMode(currentTab === 'structures' ? 'structure' : 'domain'); setIsModalOpen(true);}}
            />
         )}
      </main>

      {/* Modales identiques à votre version précédente... */}
      <Modal isOpen={!!viewingResource} onClose={() => setViewingResource(null)} title={viewingResource?.title || 'Lecture'}>
          <div className="w-full">
              <div 
                 className="prose prose-sm max-w-none text-slate-800"
                 dangerouslySetInnerHTML={{ __html: cleanHtmlContent(viewingResource?.description || '') }}
              />
          </div>
      </Modal>

      {/* Modale d'édition globale (simplifiée pour l'exemple) */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold">Action : {modalMode}</h3>
                      <button onClick={() => setIsModalOpen(false)}><X /></button>
                  </div>
                  <p className="text-slate-500 mb-4 text-sm">Formulaire d'édition pour {modalMode}...</p>
                  <button onClick={() => setIsModalOpen(false)} className="w-full bg-[#116862] text-white py-2 rounded-lg font-bold">Fermer</button>
              </div>
          </div>
      )}
    </div>
  );
};
