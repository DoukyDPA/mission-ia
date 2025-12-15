"use client";
import React, { useState, useEffect } from 'react';

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
  Lock, Building2, Globe, UploadCloud, UserPlus, Trash2, Filter, Info, ShieldCheck
} from 'lucide-react';

// --- CONFIGURATION SUPABASE ---
const supabaseUrl = (typeof process !== 'undefined' && process.env) ? process.env.NEXT_PUBLIC_SUPABASE_URL : '';
const supabaseAnonKey = (typeof process !== 'undefined' && process.env) ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : '';

// ==================================================================================
// 3. DÉCOMMENTEZ LE BLOC DE CONNEXION CI-DESSOUS POUR LA PRODUCTION :

const supabase = (supabaseUrl && supabaseAnonKey) 
  // @ts-ignore
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// ==================================================================================

// Pour l'aperçu ici, on force le mode sans connexion pour éviter le crash
const supabase: any = null;

// --- TYPES ---
interface Structure { id: string | number; name: string; city: string; }
interface User { id: string | number; email: string; name: string; role: string; missionLocale: string; avatar: string; }
interface Resource { id: string | number; title: string; type: string; date: string; size?: string; category: string; access: string; file_url?: string; }
interface Prompt { 
  id: string | number; title: string; content: string; author: string; role: string; 
  avatar: string; missionLocale: string; date: string; tags: string[]; 
  likes: number; forks: number; isFork: boolean; parentId?: string | number | null; 
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
  { id: 1, title: "Guide de démarrage (Mode Démo)", type: "pdf", date: "12/12/2023", category: "Formation", access: "global" }
];
const MOCK_PROMPTS: Prompt[] = [
  { id: 1, title: "Prompt Démo", content: "Ceci est un exemple car Supabase n'est pas connecté.", author: "Système", role: "Bot", avatar: "AI", missionLocale: "National", date: "Maintenant", tags: ["Demo"], likes: 0, forks: 0, isFork: false }
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

// --- LOGIN PAGE ---
const LoginPage = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Si Supabase n'est pas initialisé (ex: variables manquantes), fallback sur le mock
    if (!supabase) {
      console.warn("Supabase non connecté, utilisation du mode démo.");
      const mockUser = MOCK_USERS_LIST.find(u => u.email === email);
      if (mockUser) onLogin(mockUser);
      else setError("Base de données non connectée. Vérifiez vos variables d'environnement.");
      setLoading(false);
      return;
    }

    try {
      // VRAI LOGIN SUPABASE
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (authError) {
        throw authError;
      }

      if (data.user) {
        // Récupérer le profil étendu
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*, structures(name)')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
           console.error("Erreur récupération profil:", profileError);
           // Fallback minimal si le profil n'existe pas encore
           onLogin({
             id: data.user.id,
             email: data.user.email || '',
             name: email.split('@')[0],
             role: 'Conseiller',
             missionLocale: 'Non assigné',
             avatar: 'U'
           });
        } else {
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
        
        {/* COMPTES DEMO POUR L'APERÇU */}
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
    </div>
  );
};

// --- DASHBOARD ---
const Dashboard = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
  const [currentTab, setCurrentTab] = useState('prompts');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [structures, setStructures] = useState<Structure[]>([]);
  
  // États de formulaire
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('');
  
  // Data Fetching
  useEffect(() => {
    if (!supabase) {
      // Fallback si pas de connexion
      setPrompts(MOCK_PROMPTS);
      setResources(MOCK_RESOURCES);
      setStructures(MOCK_STRUCTURES);
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Fetch Prompts (avec jointure profils)
        const { data: pData, error: pError } = await supabase
          .from('prompts')
          .select(`*, profiles(full_name, avatar_url, role), structures(name)`)
          .order('created_at', { ascending: false });
          
        if (!pError && pData) {
          const formattedPrompts = pData.map((p: any) => ({
            id: p.id,
            title: p.title,
            content: p.content,
            author: p.profiles?.full_name || 'Inconnu',
            role: p.profiles?.role || 'Membre',
            avatar: (p.profiles?.full_name || 'U').substring(0,2).toUpperCase(),
            missionLocale: p.structures?.name || 'National',
            date: new Date(p.created_at).toLocaleDateString(),
            tags: p.tags || [],
            likes: p.likes_count || 0,
            forks: 0,
            isFork: p.is_fork
          }));
          setPrompts(formattedPrompts);
        }

        // 2. Fetch Resources
        const { data: rData } = await supabase.from('resources').select('*');
        if (rData) setResources(rData);

        // 3. Fetch Structures (Admin only mostly)
        const { data: sData } = await supabase.from('structures').select('*');
        if (sData) setStructures(sData);
        
      } catch (err) {
        console.error("Erreur chargement données:", err);
      }
    };

    fetchData();
  }, [user]);

  // --- ACTIONS (INSERT) ---
  
  const handleCreatePrompt = async (title: string, content: string, tag: string) => {
    if (!supabase) {
        // Mock add
        setPrompts([{ id: Date.now(), title, content, author: user.name, role: user.role, avatar: user.avatar, missionLocale: user.missionLocale, date: "À l'instant", tags: [tag], likes: 0, forks: 0, isFork: false }, ...prompts]);
        setIsModalOpen(false);
        return;
    }

    try {
      // Récupérer l'ID structure de l'user
      const { data: profile } = await supabase.from('profiles').select('structure_id').eq('id', user.id).single();
      
      const { error } = await supabase.from('prompts').insert({
          title, 
          content, 
          tags: [tag], 
          user_id: user.id,
          structure_id: profile?.structure_id // Lie le prompt à la ML de l'user
      });
      
      if (error) throw error;
      window.location.reload(); // Refresh simple pour la démo
    } catch (err: any) {
      alert("Erreur lors de la création : " + err.message);
    }
  };

  const handleCreateResource = async (title: string, type: string, category: string, scope: string, targetStructId?: string) => {
      if (!supabase) { setIsModalOpen(false); return; }
      
      const { error } = await supabase.from('resources').insert({
          title, type, category, 
          access_scope: scope, 
          target_structure_id: scope === 'local' ? targetStructId : null,
          file_url: 'https://placeholder.com', // Ici il faudrait gérer l'upload fichier
          uploaded_by: user.id
      });
      
      if (error) alert("Erreur ajout ressource: " + error.message);
      else window.location.reload();
  };

  const handleCreateStructure = async (name: string, city: string) => {
      if (!supabase) { setIsModalOpen(false); return; }
      const { error } = await supabase.from('structures').insert({ name, city });
      if (error) alert("Erreur création structure: " + error.message);
      else window.location.reload();
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
         <div className="p-4 border-t">
            <button onClick={onLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-500"><LogOut size={16}/> Déconnexion</button>
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
               onClick={() => { setModalMode(currentTab === 'structures' ? 'structure' : currentTab === 'resources' ? 'resource' : 'prompt'); setIsModalOpen(true); }}
               className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-md hover:bg-indigo-700"
            >
               <Plus size={18} /> Ajouter
            </button>
         </div>

         {/* LISTE PROMPTS */}
         {currentTab === 'prompts' && (
            <div className="space-y-4 max-w-4xl">
               {prompts.map(p => (
                  <div key={p.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                     <div className="flex justify-between mb-3">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">{p.avatar}</div>
                           <div>
                              <h3 className="font-bold text-slate-800">{p.title}</h3>
                              <p className="text-xs text-slate-500">{p.author} • {p.missionLocale}</p>
                           </div>
                        </div>
                        <Badge>{p.tags[0]}</Badge>
                     </div>
                     <div className="bg-slate-50 p-4 rounded text-sm font-mono text-slate-700 whitespace-pre-wrap">{p.content}</div>
                  </div>
               ))}
               {prompts.length === 0 && <p className="text-center text-slate-400">Aucun prompt pour le moment.</p>}
            </div>
         )}

         {/* LISTE RESSOURCES */}
         {currentTab === 'resources' && (
            <div className="grid grid-cols-3 gap-6">
               {resources.map(r => (
                  <div key={r.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                     <div className="flex gap-4">
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg"><FileText /></div>
                        <div>
                           <h4 className="font-bold text-sm text-slate-800">{r.title}</h4>
                           <span className="text-xs text-slate-500">{r.category} • {r.access}</span>
                        </div>
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

      {/* MODAL SIMPLIFIÉE POUR AJOUT */}
      {isModalOpen && (
         <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Nouvel Ajout</h3>
                  <button onClick={() => setIsModalOpen(false)}><X /></button>
               </div>
               
               <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const formData = new FormData(form);
                  
                  if (modalMode === 'prompt') {
                     handleCreatePrompt(formData.get('title') as string, formData.get('content') as string, 'Administratif');
                  } else if (modalMode === 'structure') {
                     handleCreateStructure(formData.get('name') as string, formData.get('city') as string);
                  } else if (modalMode === 'resource') {
                     handleCreateResource(formData.get('title') as string, 'pdf', 'Formation', 'global');
                  }
               }} className="space-y-4">
                  
                  {modalMode === 'prompt' && (
                     <>
                        <input name="title" required placeholder="Titre du prompt" className="w-full border p-2 rounded" />
                        <textarea name="content" required placeholder="Votre prompt..." rows={5} className="w-full border p-2 rounded font-mono text-sm" />
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
                        <input name="title" required placeholder="Titre du document" className="w-full border p-2 rounded" />
                        <p className="text-xs text-slate-500">L'upload de fichier sera activé dans la version finale.</p>
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
  return !currentUser ? <LoginPage onLogin={setCurrentUser} /> : <Dashboard user={currentUser} onLogout={() => setCurrentUser(null)} />;
}
