"use client";
import React, { useState, useEffect, useCallback } from 'react';

// ==================================================================================
// ⚠️ INSTRUCTIONS POUR LE DÉPLOIEMENT (PRODUCTION) ⚠️
// ==================================================================================
// 1. Installez Supabase localement : npm install @supabase/supabase-js
// 2. DÉCOMMENTEZ la ligne d'import ci-dessous :
import { createClient } from '@supabase/supabase-js';
// ==================================================================================

import { 
  BookOpen, Sparkles, GitFork, Users, Search, FileText, Video, Download, 
  ThumbsUp, MessageSquare, Copy, Plus, ArrowRight, Menu, X, Send, LogOut, 
  Lock, Building2, Globe, UploadCloud, UserPlus, Trash2, Filter, Info, ShieldCheck, 
  Link as LinkIcon, AlignLeft, ExternalLink, Eye
} from 'lucide-react';

// --- CONFIGURATION SUPABASE ---
const supabaseUrl = (typeof process !== 'undefined' && process.env) ? process.env.NEXT_PUBLIC_SUPABASE_URL : '';
const supabaseAnonKey = (typeof process !== 'undefined' && process.env) ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : '';

// ==================================================================================
// 3. INITIALISATION DU CLIENT (CHOISISSEZ UNE SEULE OPTION)
// ==================================================================================

// OPTION A : MODE APERÇU (Actif par défaut pour la démo)
/* const supabase: any = null; */

// OPTION B : MODE PRODUCTION (Vraie connexion)

const supabase = (supabaseUrl && supabaseAnonKey) 
  // @ts-ignore
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// ==================================================================================


// --- TYPES ---
interface Structure { id: string | number; name: string; city: string; }
interface User { id: string | number; email: string; name: string; role: string; missionLocale: string; avatar: string; }
// Ajout de 'description' pour le contenu texte
interface Resource { id: string | number; title: string; type: 'file' | 'text' | 'link' | 'pdf' | 'video'; date: string; size?: string; category: string; access: string; file_url?: string; description?: string; }
interface Prompt { 
  id: string | number; title: string; content: string; author: string; role: string; 
  avatar: string; missionLocale: string; date: string; tags: string[]; 
  likes: number; forks: number; isFork: boolean; parentId?: string | number | null; parentAuthor?: string;
}

// --- DONNÉES FICTIVES (FALLBACK) ---
const MOCK_STRUCTURES: Structure[] = [
  { id: 1, name: "Mission Locale de Lyon", city: "Lyon" },
  { id: 2, name: "Mission Locale de Paris", city: "Paris" }
];
const MOCK_USERS_LIST: User[] = [
  { id: 1, email: "jean@ml.fr", name: "Jean Dupont", role: "Conseiller", missionLocale: "Mission Locale de Lyon", avatar: "JD" },
  { id: 2, email: "admin@ia.fr", name: "Admin Système", role: "Admin", missionLocale: "National", avatar: "AD" }
];
const MOCK_RESOURCES: Resource[] = [
  { id: 1, title: "Guide de démarrage (PDF)", type: "file", date: "12/12/2023", category: "Formation", access: "global", file_url: "#" },
  { id: 2, title: "Outil IA recommandé", type: "link", date: "14/12/2023", category: "Veille", access: "global", file_url: "https://openai.com" },
  { id: 3, title: "Note de synthèse interne", type: "text", date: "15/12/2023", category: "Interne", access: "global", description: "Voici les points clés de la réunion du 15 décembre concernant l'adoption de l'IA..." }
];
const MOCK_PROMPTS: Prompt[] = [
  { id: 1, title: "Prompt Démo", content: "Ceci est un exemple car Supabase n'est pas connecté.", author: "Système", role: "Bot", avatar: "AI", missionLocale: "National", date: "Maintenant", tags: ["Administratif"], likes: 0, forks: 0, isFork: false }
];

// --- COMPOSANTS UI ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-1 ${active ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
    <Icon size={20} /><span>{label}</span>
  </button>
);

const Badge = ({ children, color = "blue" }: any) => {
  const colors: any = { blue: "bg-blue-50 text-blue-700 border-blue-200", purple: "bg-purple-50 text-purple-700 border-purple-200", green: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  return <span className={`text-xs px-2.5 py-0.5 rounded-full border ${colors[color] || colors.blue}`}>{children}</span>;
};

// --- MODAL COMPONENT ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- LOGIN PAGE ---
interface LoginPageProps {
  onLogin: (u: User) => void;
  onOpenLegal: (type: 'mentions' | 'privacy') => void;
}

const LoginPage = ({ onLogin, onOpenLegal }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!supabase) {
      const mockUser = MOCK_USERS_LIST.find(u => u.email === email);
      if (mockUser) onLogin(mockUser);
      else setError("Utilisateur démo introuvable (essayez admin@ia.fr)");
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('*, structures(name)').eq('id', data.user.id).single();
        const userObj: User = {
             id: data.user.id,
             email: data.user.email || '',
             name: profile?.full_name || email.split('@')[0],
             role: profile?.role || 'Conseiller',
             missionLocale: profile?.structures?.name || 'National',
             avatar: (profile?.full_name || 'U').substring(0, 2).toUpperCase()
        };
        onLogin(userObj);
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">MissionIA</h1>
        <p className="text-center text-slate-500 mb-6 text-sm">Connectez-vous pour accéder aux ressources</p>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="nom@missionlocale.fr" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" />
            </div>
          </div>
          <button disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        
        {!supabase && (
           <div className="mt-6 pt-4 border-t border-slate-100 text-center">
             <p className="text-xs text-slate-400 mb-2">Comptes Démo (Aperçu)</p>
             <div className="flex gap-2 justify-center">
                <button onClick={() => {setEmail('jean@ml.fr'); setPassword('demo');}} className="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200">Jean (Conseiller)</button>
                <button onClick={() => {setEmail('admin@ia.fr'); setPassword('demo');}} className="text-xs bg-slate-800 text-white px-2 py-1 rounded hover:bg-slate-700">Admin</button>
             </div>
           </div>
        )}
      </div>
      <footer className="mt-8 text-center text-xs text-slate-400 space-y-2">
         <p>© 2024 Réseau des Missions Locales</p>
         <div className="flex justify-center gap-4">
             <button onClick={() => onOpenLegal('mentions')} className="hover:text-indigo-600 hover:underline">Mentions Légales</button>
             <button onClick={() => onOpenLegal('privacy')} className="hover:text-indigo-600 hover:underline">Politique de Confidentialité</button>
         </div>
      </footer>
    </div>
  );
};

// --- DASHBOARD ---
interface DashboardProps {
  user: User;
  onLogout: () => void;
  onOpenLegal: (type: 'mentions' | 'privacy') => void;
}

const Dashboard = ({ user, onLogout, onOpenLegal }: DashboardProps) => {
  const [currentTab, setCurrentTab] = useState('prompts');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [structures, setStructures] = useState<Structure[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // États spécifiques pour les modales
  const [promptFormTitle, setPromptFormTitle] = useState('');
  const [promptFormContent, setPromptFormContent] = useState('');
  const [promptFormTag, setPromptFormTag] = useState('Administratif');
  const [parentPromptId, setParentPromptId] = useState<string | number | null>(null);

  // Etats pour les ressources (Fichier, Texte, Lien)
  const [resFormType, setResFormType] = useState<'file' | 'text' | 'link'>('file');
  const [resFormContent, setResFormContent] = useState(''); // Pour le texte ou l'URL
  
  // Etat pour la lecture d'une ressource texte
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);

  // Fonction centralisée pour recharger les données SANS recharger la page
  const refreshData = useCallback(async () => {
    if (!supabase) return; 

    try {
        const { data: pData } = await supabase.from('prompts').select(`*, profiles(full_name, avatar_url, role), structures(name)`).order('created_at', { ascending: false });
        if (pData) {
            setPrompts(pData.map((p: any) => ({
                id: p.id, title: p.title, content: p.content,
                author: p.profiles?.full_name || 'Inconnu', role: p.profiles?.role || 'Membre',
                avatar: (p.profiles?.full_name || 'U').substring(0,2).toUpperCase(),
                missionLocale: p.structures?.name || 'National',
                date: new Date(p.created_at).toLocaleDateString(),
                tags: p.tags || [], likes: p.likes_count || 0, forks: 0, isFork: p.is_fork
            })));
        }
        const { data: rData } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
        if (rData) setResources(rData.map((r: any) => ({ 
            ...r, 
            type: r.file_type || 'file' // Mapping DB
        })));
        const { data: sData } = await supabase.from('structures').select('*');
        if (sData) setStructures(sData);
    } catch (e) {
        console.error("Erreur refresh:", e);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    if (!supabase) {
      setPrompts(MOCK_PROMPTS);
      setResources(MOCK_RESOURCES);
      setStructures(MOCK_STRUCTURES);
    } else {
      refreshData();
    }
  }, [refreshData]);

  // --- ACTIONS ---

  const prepareCreatePrompt = () => {
      setModalMode('prompt');
      setPromptFormTitle('');
      setPromptFormContent('');
      setPromptFormTag('Administratif');
      setParentPromptId(null);
      setIsModalOpen(true);
  }

  const prepareForkPrompt = (original: Prompt) => {
      setModalMode('prompt');
      setPromptFormTitle(`Variante : ${original.title}`);
      setPromptFormContent(original.content);
      setPromptFormTag(original.tags[0] || 'Administratif');
      setParentPromptId(original.id);
      setIsModalOpen(true);
  }
  
  const handleCreatePrompt = async () => {
    if (!supabase) {
        const newPrompt: Prompt = { 
            id: Date.now(), title: promptFormTitle, content: promptFormContent, 
            author: user.name, role: user.role, avatar: user.avatar, missionLocale: user.missionLocale, date: "À l'instant", tags: [promptFormTag], likes: 0, forks: 0, isFork: !!parentPromptId, parentId: parentPromptId 
        };
        setPrompts([newPrompt, ...prompts]);
        setIsModalOpen(false);
        return;
    }

    try {
      const { data: profile } = await supabase.from('profiles').select('structure_id').eq('id', user.id).single();
      const { error } = await supabase.from('prompts').insert({
          title: promptFormTitle, content: promptFormContent, tags: [promptFormTag], 
          user_id: user.id, structure_id: profile?.structure_id, is_fork: !!parentPromptId, parent_id: parentPromptId
      });
      if (error) throw error;
      await refreshData();
      setIsModalOpen(false);
    } catch (err: any) {
      alert("Erreur création : " + err.message);
    }
  };

  const handleCreateResource = async (title: string, category: string, scope: string, targetStructId?: string) => {
      // Préparation des données selon le type
      let finalUrl = '';
      let description = '';
      let type = resFormType;

      if (!supabase) { 
          // Mode Démo
          if (resFormType === 'text') description = resFormContent;
          if (resFormType === 'link') finalUrl = resFormContent;
          
          setResources([{ id: Date.now(), title, type, category, access: scope, date: "À l'instant", file_url: finalUrl, description }, ...resources]);
          setIsModalOpen(false); 
          return; 
      }
      
      // Logique Prod
      if (resFormType === 'file' && selectedFile) {
          try {
              const fileExt = selectedFile.name.split('.').pop();
              const fileName = `${user.id}/${Date.now()}.${fileExt}`;
              const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, selectedFile);
              if (uploadError) throw uploadError;
              const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName);
              finalUrl = urlData.publicUrl;
          } catch (uploadError: any) {
              alert("Erreur upload : " + uploadError.message);
              return;
          }
      } else if (resFormType === 'link') {
          finalUrl = resFormContent; // L'URL est stockée dans file_url
      } else if (resFormType === 'text') {
          description = resFormContent; // Le texte est stocké dans description
      }
      
      const { error } = await supabase.from('resources').insert({
          title, file_type: type, category, access_scope: scope, 
          target_structure_id: scope === 'local' ? targetStructId : null,
          file_url: finalUrl, description: description, uploaded_by: user.id
      });
      
      if (error) alert("Erreur base de données : " + error.message);
      else {
          await refreshData();
          setIsModalOpen(false);
      }
  };

  const handleDeleteResource = async (id: string | number) => {
      if(!confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) return;
      if (!supabase) { setResources(resources.filter(r => r.id !== id)); return; }
      try {
          const { error } = await supabase.from('resources').delete().eq('id', id);
          if (error) throw error;
          await refreshData();
      } catch (err: any) { alert("Erreur suppression : " + err.message); }
  }

  const handleCreateStructure = async (name: string, city: string) => {
      if (!supabase) { setIsModalOpen(false); return; }
      const { error } = await supabase.from('structures').insert({ name, city });
      if (error) alert("Erreur : " + error.message);
      else { await refreshData(); setIsModalOpen(false); }
  }

  // --- RENDU UI ---

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row">
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col z-10 justify-between">
         <div>
            <div className="p-6 border-b border-slate-100">
               <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl"><Sparkles /><span>MissionIA</span></div>
               <div className="mt-4 p-2 bg-indigo-50 rounded text-xs font-bold text-indigo-900">{user.missionLocale}</div>
            </div>
            <nav className="p-4 space-y-1">
               <SidebarItem icon={GitFork} label="Prompts" active={currentTab === 'prompts'} onClick={() => setCurrentTab('prompts')} />
               <SidebarItem icon={BookOpen} label="Ressources" active={currentTab === 'resources'} onClick={() => setCurrentTab('resources')} />
               {user.role === 'Admin' && <SidebarItem icon={Building2} label="Admin Structures" active={currentTab === 'structures'} onClick={() => setCurrentTab('structures')} />}
            </nav>
         </div>
         <div className="p-4 border-t border-slate-100 bg-slate-50">
            <button onClick={onLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-500 mb-3 ml-2 text-sm"><LogOut size={16}/> Déconnexion</button>
            <div className="flex justify-center gap-3 text-[10px] text-slate-400 border-t border-slate-200 pt-3">
               <button onClick={() => onOpenLegal('mentions')} className="hover:text-indigo-600">Mentions Légales</button>
               <span>•</span>
               <button onClick={() => onOpenLegal('privacy')} className="hover:text-indigo-600">Confidentialité</button>
            </div>
         </div>
      </aside>

      <main className="flex-1 p-8">
         <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">
               {currentTab === 'prompts' && 'Promptothèque'}
               {currentTab === 'resources' && 'Centre de Ressources'}
               {currentTab === 'structures' && 'Gestion Structures'}
            </h1>
            <button 
               onClick={() => { 
                   if (currentTab === 'prompts') prepareCreatePrompt();
                   else {
                       setModalMode(currentTab === 'structures' ? 'structure' : 'resource');
                       setSelectedFile(null);
                       setResFormType('file');
                       setResFormContent('');
                       setIsModalOpen(true);
                   }
               }}
               className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-md hover:bg-indigo-700"
            >
               <Plus size={18} /> Ajouter
            </button>
         </div>

         {/* LISTE PROMPTS */}
         {currentTab === 'prompts' && (
            <div className="space-y-4 max-w-4xl">
               {prompts.map(p => (
                  <div key={p.id} className={`bg-white p-6 rounded-xl border shadow-sm ${p.isFork ? 'border-l-4 border-l-indigo-400 ml-8' : 'border-slate-200'}`}>
                     <div className="flex justify-between mb-3">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">{p.avatar}</div>
                           <div>
                              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                  {p.title}
                                  {p.isFork && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full flex items-center"><GitFork size={10} className="mr-1"/> Variante</span>}
                              </h3>
                              <p className="text-xs text-slate-500">{p.author} • {p.missionLocale}</p>
                           </div>
                        </div>
                        <Badge>{p.tags[0]}</Badge>
                     </div>
                     <div className="bg-slate-50 p-4 rounded text-sm font-mono text-slate-700 whitespace-pre-wrap">{p.content}</div>
                     <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                        <button 
                            onClick={() => prepareForkPrompt(p)}
                            className="text-xs font-medium text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded flex items-center gap-1"
                        >
                            <GitFork size={14} /> Améliorer / Proposer une variante
                        </button>
                     </div>
                  </div>
               ))}
               {prompts.length === 0 && <p className="text-center text-slate-400">Aucun prompt pour le moment.</p>}
            </div>
         )}

         {/* LISTE RESSOURCES */}
         {currentTab === 'resources' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {resources.map(r => (
                  <div key={r.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative group flex flex-col justify-between">
                     {/* BADGE LOCAL/GLOBAL */}
                     {r.access !== 'global' && <span className="absolute top-2 right-2 bg-indigo-100 text-indigo-700 text-[10px] px-2 py-1 rounded font-bold">Local</span>}
                     
                     <div className="flex gap-4 mb-4">
                        <div className={`p-3 rounded-lg ${r.type === 'link' ? 'bg-emerald-50 text-emerald-600' : r.type === 'text' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                            {r.type === 'link' ? <LinkIcon size={24} /> : r.type === 'text' ? <AlignLeft size={24} /> : <FileText size={24} />}
                        </div>
                        <div className="flex-1 overflow-hidden">
                           <h4 className="font-bold text-sm text-slate-800 truncate" title={r.title}>{r.title}</h4>
                           <span className="text-xs text-slate-500 block mt-1">{r.category}</span>
                        </div>
                     </div>

                     <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                        {/* ACTION PRINCIPALE SELON TYPE */}
                        {r.type === 'link' && r.file_url && (
                            <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-emerald-600 hover:underline flex items-center gap-1">
                                <ExternalLink size={12} /> Visiter
                            </a>
                        )}
                        {r.type === 'text' && (
                            <button onClick={() => setViewingResource(r)} className="text-xs font-medium text-amber-600 hover:underline flex items-center gap-1">
                                <Eye size={12} /> Lire
                            </button>
                        )}
                        {(r.type === 'file' || r.type === 'pdf' || !r.type) && r.file_url && (
                            <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">
                                <Download size={12} /> Télécharger
                            </a>
                        )}

                        {/* BOUTON SUPPRIMER POUR ADMIN */}
                        {user.role === 'Admin' && (
                            <button onClick={() => handleDeleteResource(r.id)} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                                <Trash2 size={12} />
                            </button>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         )}

         {/* LISTE STRUCTURES (ADMIN) */}
         {currentTab === 'structures' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
               <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b"><tr><th className="p-4">Nom</th><th className="p-4">Ville</th></tr></thead>
                  <tbody>
                     {structures.map(s => (
                        <tr key={s.id} className="border-b last:border-0"><td className="p-4 font-medium">{s.name}</td><td className="p-4 text-slate-500">{s.city}</td></tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </main>

      {/* MODAL LECTURE DE RESSOURCE TEXTE */}
      <Modal isOpen={!!viewingResource} onClose={() => setViewingResource(null)} title={viewingResource?.title || 'Lecture'}>
          <div className="prose prose-sm prose-slate max-w-none">
              <p className="whitespace-pre-wrap">{viewingResource?.description}</p>
          </div>
      </Modal>

      {/* MODAL SIMPLIFIÉE POUR AJOUT */}
      {isModalOpen && (
         <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">
                      {modalMode === 'prompt' ? (parentPromptId ? "Améliorer ce prompt" : "Nouveau Prompt") : "Nouvelle Ressource"}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)}><X /></button>
               </div>
               
               <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const formData = new FormData(form);
                  
                  if (modalMode === 'prompt') {
                     handleCreatePrompt();
                  } else if (modalMode === 'structure') {
                     handleCreateStructure(formData.get('name') as string, formData.get('city') as string);
                  } else if (modalMode === 'resource') {
                     handleCreateResource(formData.get('title') as string, formData.get('category') as string, 'global', selectedFile, undefined);
                  }
               }} className="space-y-4">
                  
                  {modalMode === 'prompt' && (
                     <>
                        {parentPromptId && (
                            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded text-xs text-indigo-700 flex items-center gap-2">
                                <GitFork size={14}/>
                                Vous créez une variante. Le contenu original est pré-rempli.
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Titre</label>
                            <input 
                                value={promptFormTitle}
                                onChange={(e) => setPromptFormTitle(e.target.value)}
                                required 
                                placeholder="Titre du prompt" 
                                className="w-full border p-2 rounded" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Catégorie</label>
                            <select 
                                value={promptFormTag}
                                onChange={(e) => setPromptFormTag(e.target.value)}
                                className="w-full border p-2 rounded bg-white"
                            >
                                <option value="Administratif">Administratif</option>
                                <option value="Relation Jeunes">Relation Jeunes</option>
                                <option value="Direction">Direction</option>
                                <option value="RH">RH</option>
                                <option value="Projets">Appels à Projets</option>
                                <option value="Autre">Autre</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Contenu</label>
                            <textarea 
                                value={promptFormContent}
                                onChange={(e) => setPromptFormContent(e.target.value)}
                                required 
                                placeholder="Votre prompt..." 
                                rows={8} 
                                className="w-full border p-2 rounded font-mono text-sm" 
                            />
                        </div>
                     </>
                  )}

                  {modalMode === 'structure' && (
                     <>
                        <input name="name" required placeholder="Nom de la Mission Locale" className="w-full border p-2 rounded" />
                        <input name="city" required placeholder="Ville" className="w-full border p-2 rounded" />
                     </>
                  )}

                  {modalMode === 'resource' && (
                     <>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Titre</label>
                            <input name="title" required placeholder="Titre de la ressource" className="w-full border p-2 rounded" />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">Type de contenu</label>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button type="button" onClick={() => setResFormType('file')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${resFormType === 'file' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Fichier</button>
                                <button type="button" onClick={() => setResFormType('text')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${resFormType === 'text' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Texte</button>
                                <button type="button" onClick={() => setResFormType('link')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${resFormType === 'link' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Lien</button>
                            </div>
                        </div>

                        {resFormType === 'file' && (
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                <input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                    onChange={(e) => {
                                        if(e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
                                    }}
                                />
                                <div className="flex flex-col items-center pointer-events-none">
                                    <UploadCloud className="text-slate-400 mb-2" size={32} />
                                    <span className="text-sm font-medium text-slate-600">
                                        {selectedFile ? selectedFile.name : "Cliquez pour sélectionner un fichier"}
                                    </span>
                                </div>
                            </div>
                        )}

                        {resFormType === 'text' && (
                            <div>
                                <textarea 
                                    value={resFormContent}
                                    onChange={(e) => setResFormContent(e.target.value)}
                                    placeholder="Écrivez votre contenu ici..."
                                    rows={6}
                                    className="w-full border p-2 rounded font-mono text-sm"
                                />
                            </div>
                        )}

                        {resFormType === 'link' && (
                            <div>
                                <input 
                                    type="url"
                                    value={resFormContent}
                                    onChange={(e) => setResFormContent(e.target.value)}
                                    placeholder="https://exemple.com"
                                    className="w-full border p-2 rounded"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Catégorie</label>
                            <select name="category" className="w-full border p-2 rounded bg-white">
                                <option>Formation</option>
                                <option>Veille</option>
                                <option>Juridique</option>
                                <option>Outil</option>
                                <option>Interne</option>
                            </select>
                        </div>
                     </>
                  )}

                  <div className="flex justify-end pt-4">
                     <button className="bg-indigo-600 text-white px-4 py-2 rounded font-bold">Valider</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalType, setLegalType] = useState<'mentions' | 'privacy'>('mentions');

  const openLegal = (type: 'mentions' | 'privacy') => {
      setLegalType(type);
      setIsLegalOpen(true);
  }

  // --- CONTENU LEGAL ---
  const LegalContent = () => (
      <div className="prose prose-sm prose-slate max-w-none text-slate-600">
          {legalType === 'mentions' ? (
              <div className="space-y-3">
                  <p><strong>Éditeur du site :</strong> MissionIA</p>
                  <p><strong>Contact :</strong> contact@missionia.fr</p>
                  <p><strong>Hébergeur :</strong> Vercel Inc.</p>
                  <p>Ce site est une plateforme de démonstration pédagogique.</p>
              </div>
          ) : (
              <div className="space-y-3">
                  <p><strong>Données personnelles :</strong></p>
                  <p>Les données sont utilisées uniquement pour le fonctionnement du service.</p>
                  <p>Vous disposez d'un droit d'accès et de rectification.</p>
              </div>
          )}
      </div>
  );

  return (
    <>
        {!currentUser ? (
            <LoginPage onLogin={setCurrentUser} onOpenLegal={openLegal} />
        ) : (
            <Dashboard user={currentUser} onLogout={() => setCurrentUser(null)} onOpenLegal={openLegal} />
        )}

        <Modal 
            isOpen={isLegalOpen} 
            onClose={() => setIsLegalOpen(false)} 
            title={legalType === 'mentions' ? "Mentions Légales" : "Politique de Confidentialité"}
        >
            <LegalContent />
        </Modal>
    </>
  );
}
