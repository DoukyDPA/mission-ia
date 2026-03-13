import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { User, AllowedDomain, Prompt, Resource, Structure } from '@/types';
import { Modal } from '@/components/ui/Modal';

// Composants internes
import { Sidebar } from './Sidebar';
import { PromptList } from './PromptList';
import { ResourceList } from './ResourceList';
import { AdminPanel } from './AdminPanel';
import { PromptAssistant } from './PromptAssistant';
import { Home } from './Home'; 

// Éditeur riche
import 'react-quill-new/dist/quill.snow.css'; 
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onOpenLegal: (type: 'mentions' | 'privacy') => void;
  allowedDomains: AllowedDomain[];
  onAllowedDomainsChange: (domains: AllowedDomain[]) => void;
}

export const Dashboard = ({ user, onLogout, onOpenLegal, allowedDomains, onAllowedDomainsChange }: DashboardProps) => {
  // L'application s'ouvre sur 'home' par défaut
  const [currentTab, setCurrentTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // États de données
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  
  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(''); 
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);
  
  const [availableCategories, setAvailableCategories] = useState(['Administratif', 'Accompagnement', 'Veille', 'Direction', 'RH', 'Autre']);
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const isAdmin = (user.role || '').trim().toLowerCase() === 'admin';
  const userStructure = structures.find(s => s.id == user.structure_id) || null;

  const refreshData = useCallback(async () => {
    if (!supabase) return; 
    try {
        const { data: pData } = await supabase.from('prompts').select(`*, profiles(full_name, avatar_url, role), structures(name)`).order('created_at', { ascending: false });
        if (pData) setPrompts(pData.map((p: any) => ({
            id: p.id, title: p.title, content: p.content, author: p.profiles?.full_name || 'Anonyme',
            avatar: (p.profiles?.full_name || 'U').substring(0,2).toUpperCase(), missionLocale: p.structures?.name || 'National',
            date: new Date(p.created_at).toLocaleDateString(), tags: p.tags || [], likes: p.likes_count || 0, is_fork: p.is_fork, user_id: p.user_id
        })));
        
        const { data: rData } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
        if (rData) setResources(rData.map((r: any) => ({ ...r, type: r.file_type || 'file', date: new Date(r.created_at).toLocaleDateString() })));
        
        const { data: sData } = await supabase.from('structures').select('*');
        if (sData) setStructures(sData);

        if (isAdmin) {
            const { data: uData } = await supabase.from('profiles').select('*, structures(name)');
            if (uData) setAdminUsers(uData.map((u: any) => ({ ...u, name: u.full_name || 'Sans nom', missionLocale: u.structures?.name || 'Non assigné' })));
        }
    } catch (e) { console.error(e); }
  }, [isAdmin]);

  useEffect(() => { refreshData(); }, [refreshData]);

  // CORRECTION DU TYPE ERROR : Vérification stricte de l'existence de supabase
  const deleteItem = async (table: string, id: string | number) => { 
    if(!confirm("Supprimer cet élément ?")) return;
    try {
        if (supabase) {
            await supabase.from(table).delete().eq('id', id); 
            refreshData(); 
        }
    } catch (e) { alert("Erreur lors de la suppression"); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <Sidebar user={user} userStructure={userStructure} currentTab={currentTab} setCurrentTab={setCurrentTab} isAdmin={isAdmin} onLogout={onLogout} onOpenLegal={onOpenLegal} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      
      <main className="flex-1 p-8">
         <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">
                {currentTab === 'home' ? 'Tableau de bord' : 
                 currentTab === 'prompts' ? 'Promptothèque' : 
                 currentTab === 'assistant' ? 'Labo Prompts' : 
                 currentTab === 'resources' ? 'Ressources & Veille' : 'Administration'}
            </h1>
            
            {!['home', 'assistant'].includes(currentTab) && (
                <button onClick={() => { setModalMode(currentTab === 'prompts' ? 'prompt' : 'resource'); setIsModalOpen(true); }} className="bg-[#116862] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-md hover:bg-[#0e524d] transition-all">
                    <Plus size={18} /> Ajouter
                </button>
            )}
         </div>

         {currentTab === 'home' && <Home />}
         {currentTab === 'prompts' && <PromptList prompts={prompts} user={user} isAdmin={isAdmin} categories={availableCategories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} onCopy={(c) => {navigator.clipboard.writeText(c); alert("Copié !");}} onEdit={() => {}} onDelete={(id) => deleteItem('prompts', id)} onFork={() => {}} />}
         {currentTab === 'assistant' && <PromptAssistant />}
         {currentTab === 'resources' && <ResourceList resources={resources} isAdmin={isAdmin} onEdit={() => {}} onDelete={(id) => deleteItem('resources', id)} onView={setViewingResource} />}
         
         {(currentTab === 'structures' || currentTab === 'users' || currentTab === 'domains') && <AdminPanel currentTab={currentTab} structures={structures} users={adminUsers} domains={allowedDomains} onDelete={deleteItem} onEditUser={() => {}} onEditStructure={() => {}} onInviteUser={() => {}} onAdd={() => {}} />}
      </main>

      <Modal isOpen={!!viewingResource} onClose={() => setViewingResource(null)} title={viewingResource?.title || 'Lecture'}>
          <div className="prose prose-sm max-w-none text-slate-800 p-2" dangerouslySetInnerHTML={{ __html: viewingResource?.description || '' }} />
      </Modal>

      {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold">Nouvel élément ({modalMode})</h3>
                      <button onClick={() => setIsModalOpen(false)}><X /></button>
                  </div>
                  <p className="text-sm text-slate-500 mb-6">Le formulaire d'ajout sera disponible prochainement.</p>
                  <button onClick={() => setIsModalOpen(false)} className="w-full bg-[#116862] text-white py-2 rounded-lg font-bold">Fermer</button>
              </div>
          </div>
      )}
    </div>
  );
};
