"use client";
import React, { useState, useEffect, useCallback } from 'react';

// ==================================================================================
// ⚠️ INSTRUCTIONS POUR LE DÉPLOIEMENT (PRODUCTION) ⚠️
// ==================================================================================
// 1. Installez Supabase localement : npm install @supabase/supabase-js
// 2. DÉCOMMENTEZ la ligne d'import ci-dessous pour la production :
import { createClient } from '@supabase/supabase-js';
// ==================================================================================

import { 
  BookOpen, Sparkles, GitFork, Users, Search, FileText, Video, Download, 
  ThumbsUp, MessageSquare, Copy, Plus, ArrowRight, Menu, X, Send, LogOut, 
  Lock, Building2, Globe, UploadCloud, UserPlus, Trash2, Filter, Info, ShieldCheck, 
  Link as LinkIcon, AlignLeft, ExternalLink, Eye, Pencil, Mail, PlayCircle, File
} from 'lucide-react';

// --- CONFIGURATION SUPABASE ---
const supabaseUrl = (typeof process !== 'undefined' && process.env) ? process.env.NEXT_PUBLIC_SUPABASE_URL : '';
const supabaseAnonKey = (typeof process !== 'undefined' && process.env) ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : '';

// ==================================================================================
// 3. INITIALISATION DU CLIENT
// ==================================================================================

const supabase = (supabaseUrl && supabaseAnonKey) 
  // @ts-ignore
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// ==================================================================================


// --- TYPES ---
interface Structure { id: string | number; name: string; city: string; }
interface User { id: string | number; email: string; name: string; role: string; missionLocale: string; avatar: string; structure_id?: string | number; }
interface Resource { id: string | number; title: string; type: 'file' | 'text' | 'link' | 'pdf' | 'video'; date: string; size?: string; category: string; access: string; file_url?: string; description?: string; }
interface Prompt { 
  id: string | number; title: string; content: string; author: string; role: string; 
  avatar: string; missionLocale: string; date: string; tags: string[]; 
  likes: number; forks: number; isFork: boolean; parentId?: string | number | null; parentAuthor?: string;
  user_id?: string | number; 
}
interface AllowedDomain { id: string | number; domain: string; structure_id?: string | number | null; structure_name?: string; }

// --- DONNÉES FICTIVES (FALLBACK) ---
const MOCK_STRUCTURES: Structure[] = [
  { id: 1, name: "Mission Locale de Lyon", city: "Lyon" },
  { id: 2, name: "Mission Locale de Paris", city: "Paris" }
];
const MOCK_PROMPTS: Prompt[] = [
  { id: 1, title: "Synthèse entretien", content: "Prompt exemple...", author: "Pierre", role: "Conseiller", avatar: "PI", missionLocale: "ML Lyon", date: "Hier", tags: ["Administratif"], likes: 5, forks: 1, isFork: false, user_id: 101 },
  { id: 2, title: "Synthèse améliorée", content: "Prompt amélioré...", author: "Sarah", role: "Conseiller", avatar: "SA", missionLocale: "ML Paris", date: "Aujourd'hui", tags: ["Administratif"], likes: 2, forks: 0, isFork: true, parentId: 1, parentAuthor: "Pierre", user_id: 102 }
];
const MOCK_RESOURCES: Resource[] = []; 
const MOCK_USERS_LIST: User[] = [
  { id: 1, email: "jean@ml.fr", name: "Jean Dupont", role: "Conseiller", missionLocale: "Mission Locale de Lyon", avatar: "JD", structure_id: 1 },
  { id: 2, email: "admin@ia.fr", name: "Admin Système", role: "Admin", missionLocale: "National", avatar: "AD" }
];
const MOCK_ALLOWED_DOMAINS: AllowedDomain[] = [
  { id: 'demo-1', domain: 'missionlocale.fr', structure_id: 1, structure_name: 'Mission Locale de Lyon' },
  { id: 'demo-2', domain: 'cbe-sud94.org', structure_id: 2, structure_name: 'Mission Locale de Paris' }
];

// --- UTILS ---
const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

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
  allowedDomains: AllowedDomain[];
}

const LoginPage = ({ onLogin, onOpenLegal, allowedDomains }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const findAllowedDomain = (targetEmail: string) => {
    const normalized = targetEmail.toLowerCase();
    return allowedDomains.find(d => normalized.endsWith(d.domain.toLowerCase()));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfoMessage('');

    if (!supabase) {
      console.warn("Supabase non connecté (Mode Aperçu).");
      if (email.includes('@')) {
         onLogin({ id: 999, email, name: 'Utilisateur Démo', role: 'Admin', missionLocale: 'National', avatar: 'AD' });
      } else {
         setError("Veuillez entrer un email valide pour la démo.");
      }
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfoMessage('');

    const matchingDomain = findAllowedDomain(email);
    if (!matchingDomain) {
      setError("Votre email n'est pas autorisé. Contactez un administrateur pour ajouter votre domaine.");
      setLoading(false);
      return;
    }

    if (!supabase) {
      onLogin({
        id: Date.now(),
        email,
        name: fullName || email.split('@')[0],
        role: 'Conseiller',
        missionLocale: matchingDomain.structure_name || 'National',
        avatar: (fullName || email).substring(0, 2).toUpperCase(),
        structure_id: matchingDomain.structure_id || undefined
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;

      const newUserId = data.user?.id;
      if (newUserId) {
        const profilePayload: any = {
          id: newUserId,
          email,
          full_name: fullName || email.split('@')[0],
          role: 'Conseiller',
          structure_id: matchingDomain.structure_id || null
        };
        await supabase.from('profiles').upsert(profilePayload);
      }

      if (data.session && data.user) {
        const { data: profile } = await supabase.from('profiles').select('*, structures(name)').eq('id', data.user.id).single();
        const missionLocale = profile?.structures?.name || matchingDomain.structure_name || 'National';
        const displayName = profile?.full_name || fullName || email.split('@')[0];
        onLogin({
          id: data.user.id,
          email,
          name: displayName,
          role: profile?.role || 'Conseiller',
          missionLocale,
          avatar: displayName.substring(0, 2).toUpperCase(),
          structure_id: profile?.structure_id
        });
      } else {
        setInfoMessage("Compte créé ! Vérifiez vos emails pour confirmer votre inscription.");
      }
    } catch (err: any) {
      setError(err.message || "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">MissionIA</h1>
        <p className="text-center text-slate-500 mb-3 text-sm">Connectez-vous pour accéder aux ressources</p>
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={() => { setMode('login'); setError(''); setInfoMessage(''); }}
            className={`text-sm font-semibold px-3 py-1 rounded ${mode === 'login' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-indigo-600'}`}
          >
            Connexion
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); setInfoMessage(''); }}
            className={`text-sm font-semibold px-3 py-1 rounded ${mode === 'register' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-indigo-600'}`}
          >
            Créer un compte
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
        {infoMessage && <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm mb-4">{infoMessage}</div>}
        {!supabase && <div className="bg-amber-50 text-amber-700 p-3 rounded-lg text-xs mb-4 border border-amber-200">Mode Aperçu (Sans connexion)</div>}

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Jean Dupont"
                  required
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="nom@missionlocale.fr" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" />
            </div>
          </div>
          <button disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50">
            {loading ? (mode === 'login' ? 'Connexion...' : 'Inscription...') : (mode === 'login' ? 'Se connecter' : "S'inscrire")}
          </button>
        </form>

        <div className="mt-6 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-1">
          <p className="font-semibold text-slate-600 flex items-center gap-2"><Globe size={14}/> Domaines autorisés</p>
          {allowedDomains.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {allowedDomains.map(d => (
                <li key={d.id}>{d.domain} {d.structure_name ? `(structure: ${d.structure_name})` : ''}</li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-slate-500">Aucun domaine autorisé n'a encore été configuré par l'administrateur.</p>
          )}
          {mode === 'register' && <p className="text-[11px] text-slate-500">Si votre email n'appartient pas à l'un de ces domaines, contactez votre administrateur.</p>}
        </div>
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
  allowedDomains: AllowedDomain[];
  onAllowedDomainsChange: (domains: AllowedDomain[]) => void;
}

const Dashboard = ({ user, onLogout, onOpenLegal, allowedDomains, onAllowedDomainsChange }: DashboardProps) => {
  const [currentTab, setCurrentTab] = useState('prompts');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // -- NOUVEAU : GESTION DYNAMIQUE DES CATÉGORIES --
  const [isCustomTag, setIsCustomTag] = useState(false);
  const [availableCategories, setAvailableCategories] = useState(['Administratif', 'Relation Jeunes', 'Direction', 'RH', 'Projets', 'Autre']);

  // Filtres
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  
  // États formulaires
  const [editingPromptId, setEditingPromptId] = useState<string | number | null>(null);
  const [promptFormTitle, setPromptFormTitle] = useState('');
  const [promptFormContent, setPromptFormContent] = useState('');
  const [promptFormTag, setPromptFormTag] = useState('Administratif');
  const [parentPromptId, setParentPromptId] = useState<string | number | null>(null);

  // Etats ressources
  const [editingResourceId, setEditingResourceId] = useState<string | number | null>(null);
  const [resFormType, setResFormType] = useState<'file' | 'text' | 'link' | 'video'>('file');
  const [resFormContent, setResFormContent] = useState('');
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);

  // Etats utilisateurs (Admin)
  const [editingUserId, setEditingUserId] = useState<string | number | null>(null);
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormName, setUserFormName] = useState('');
  const [userFormRole, setUserFormRole] = useState('Conseiller');
  const [userFormStructure, setUserFormStructure] = useState<string | number>('');

  // Domaines autorisés (Admin)
  const [domainFormValue, setDomainFormValue] = useState('');
  const [domainFormStructure, setDomainFormStructure] = useState<string | number>('');

  // --- VÉRIFICATION ADMIN ROBUSTE ---
  // Ignore la casse (Admin = admin) et les espaces inutiles
  const isAdmin = (user.role || '').trim().toLowerCase() === 'admin';

  // REFRESH DATA
  const refreshData = useCallback(async () => {
    if (!supabase) return; 

    try {
        const { data: pData } = await supabase.from('prompts').select(`*, profiles(full_name, avatar_url, role), structures(name)`).order('created_at', { ascending: false });
        if (pData) {
            // Création d'une map pour retrouver facilement les noms des auteurs par ID de prompt
            // Ceci permet d'afficher "Variante de Pierre" même si on a que l'ID du parent
            const promptAuthors = new Map();
            const usedTags = new Set(['Administratif', 'Relation Jeunes', 'Direction', 'RH', 'Projets', 'Autre']);

            pData.forEach((p: any) => {
                promptAuthors.set(p.id, p.profiles?.full_name || 'Inconnu');
                // Récupération des tags pour enrichir la liste
                if (p.tags && Array.isArray(p.tags)) {
                    p.tags.forEach((t: string) => { if(t) usedTags.add(t); });
                }
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
        if (rData) setResources(rData.map((r: any) => ({ 
            ...r, 
            type: r.file_type || 'file' 
        })));
        const { data: sData } = await supabase.from('structures').select('*');
        if (sData) setStructures(sData);

        const { data: dData } = await supabase.from('allowed_domains').select('*, structures(name)');
        if (dData) {
            onAllowedDomainsChange(dData.map((d: any) => ({
                id: d.id,
                domain: d.domain,
                structure_id: d.structure_id,
                structure_name: d.structures?.name
            })));
        }

        // Fetch Users for Admin
        if (isAdmin) {
            const { data: uData } = await supabase.from('profiles').select('*, structures(name)');
            if (uData) {
                setAdminUsers(uData.map((u: any) => ({
                    id: u.id,
                    email: u.email,
                    name: u.full_name || 'Sans nom',
                    role: u.role,
                    missionLocale: u.structures?.name || 'Non assigné',
                    avatar: (u.full_name || 'U').substring(0,2).toUpperCase(),
                    structure_id: u.structure_id
                })));
            }
        }

    } catch (e) {
        console.error("Erreur refresh:", e);
    }
  }, [isAdmin, onAllowedDomainsChange]);

  useEffect(() => {
    if (!supabase) {
      setPrompts(MOCK_PROMPTS);
      setStructures(MOCK_STRUCTURES);
      setAdminUsers(MOCK_USERS_LIST);
      onAllowedDomainsChange(MOCK_ALLOWED_DOMAINS);
    } else {
      refreshData();
    }
  }, [refreshData, onAllowedDomainsChange]);

  // --- FILTERED PROMPTS ---
  const filteredPrompts = prompts.filter(p => {
      if (selectedCategory === 'Tous') return true;
      return p.tags.includes(selectedCategory);
  });

  // --- ACTIONS ---

  const prepareCreatePrompt = () => {
      setModalMode('prompt');
      setEditingPromptId(null);
      setPromptFormTitle(''); setPromptFormContent('');
      setPromptFormTag(availableCategories[0]); 
      setParentPromptId(null);
      setIsCustomTag(false);
      setIsModalOpen(true);
  }

  const prepareForkPrompt = (original: Prompt) => {
      setModalMode('prompt');
      setEditingPromptId(null);
      setPromptFormTitle(`Variante : ${original.title}`);
      setPromptFormContent(original.content);
      // Gérer si le tag original n'est pas dans la liste par défaut (pas encore refresh)
      const originalTag = original.tags[0] || 'Administratif';
      setPromptFormTag(originalTag);
      setIsCustomTag(!availableCategories.includes(originalTag));
      setParentPromptId(original.id);
      setIsModalOpen(true);
  }

  const prepareEditPrompt = (original: Prompt) => {
      setModalMode('prompt');
      setEditingPromptId(original.id); // On passe en mode édition
      setPromptFormTitle(original.title);
      setPromptFormContent(original.content);
      
      const currentTag = original.tags[0] || availableCategories[0];
      if (availableCategories.includes(currentTag)) {
          setPromptFormTag(currentTag);
          setIsCustomTag(false);
      } else {
          setPromptFormTag(currentTag);
          setIsCustomTag(true);
      }
      
      setParentPromptId(null);
      setIsModalOpen(true);
  }

  const prepareEditResource = (r: Resource) => {
      setModalMode('resource');
      setEditingResourceId(r.id);
      // @ts-ignore
      setResFormType(r.type);
      setResFormContent(r.type === 'text' ? (r.description || '') : (r.file_url || ''));
      setIsModalOpen(true);
  }

  const prepareEditUser = (u: User) => {
      setModalMode('user');
      setEditingUserId(u.id);
      setUserFormName(u.name);
      setUserFormEmail(u.email);
      setUserFormRole(u.role);
      setUserFormStructure(u.structure_id || (structures[0] ? structures[0].id : ''));
      setIsModalOpen(true);
  }

  const prepareInviteUser = () => {
      setModalMode('user');
      setEditingUserId(null); // Mode Création (Invite)
      setUserFormName('');
      setUserFormEmail('');
      setUserFormRole('Conseiller');
      setUserFormStructure(structures[0] ? structures[0].id : '');
      setIsModalOpen(true);
  }
  
  const handleSubmitPrompt = async () => {
    // MODE DÉMO (SI PAS DE BASE DE DONNÉES)
    if (!supabase) {
        if (editingPromptId) {
            // Modification locale
            setPrompts(prompts.map(p => 
                p.id === editingPromptId 
                ? { ...p, title: promptFormTitle, content: promptFormContent, tags: [promptFormTag] }
                : p
            ));
        } else {
            // Création locale
            const newPrompt: Prompt = { 
                id: Date.now(), title: promptFormTitle, content: promptFormContent, 
                author: user.name, role: user.role, avatar: user.avatar, missionLocale: user.missionLocale, date: "Maintenant", tags: [promptFormTag], likes: 0, forks: 0, isFork: !!parentPromptId, parentId: parentPromptId 
            };
            setPrompts([newPrompt, ...prompts]);
        }
        setIsModalOpen(false);
        return;
    }

    // MODE PRODUCTION (SUPABASE)
    try {
      if (editingPromptId) {
          // MODE ÉDITION (UPDATE)
          const { error } = await supabase.from('prompts').update({
              title: promptFormTitle, 
              content: promptFormContent, 
              tags: [promptFormTag]
          }).eq('id', editingPromptId);
          if (error) throw error;
      } else {
          // MODE CRÉATION (INSERT)
          const { data: profile } = await supabase.from('profiles').select('structure_id').eq('id', user.id).single();
          const { error } = await supabase.from('prompts').insert({
              title: promptFormTitle, content: promptFormContent, tags: [promptFormTag], 
              user_id: user.id, structure_id: profile?.structure_id, is_fork: !!parentPromptId, parent_id: parentPromptId
          });
          if (error) throw error;
      }
      
      await refreshData();
      setIsModalOpen(false);
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  const handleCreateResource = async (title: string, category: string, scope: string, file: File | null, targetStructId?: string) => {
      // Préparation données
      let finalUrl = '';
      let description = '';
      let type = resFormType;

      if (!supabase) { 
          // MODE DÉMO (Locale)
          if (resFormType === 'text') description = resFormContent;
          if (resFormType === 'link') finalUrl = resFormContent;
          if (resFormType === 'video') finalUrl = resFormContent;
          
          if (editingResourceId) {
              setResources(resources.map(r => r.id === editingResourceId ? {...r, title, type, category, access: scope, file_url: finalUrl, description} : r));
          } else {
              setResources([{ id: Date.now(), title, type, category, access: scope, date: "Maintenant", file_url: finalUrl, description }, ...resources]);
          }
          setIsModalOpen(false); 
          return; 
      }
      
      // MODE PROD (Supabase)
      if (resFormType === 'file' && file) {
          try {
              const fileExt = file.name.split('.').pop();
              const fileName = `${user.id}/${Date.now()}.${fileExt}`;
              const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, file);
              if (uploadError) throw uploadError;
              const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName);
              finalUrl = urlData.publicUrl;
          } catch (uploadError: any) {
              alert("Erreur upload : " + uploadError.message);
              return;
          }
      } else if (resFormType === 'link' || resFormType === 'video') {
          finalUrl = resFormContent; 
      } else if (resFormType === 'text') {
          description = resFormContent;
      }
      
      if (editingResourceId) {
          const { error } = await supabase.from('resources').update({
              title, file_type: type, category, access_scope: scope, 
              target_structure_id: scope === 'local' ? targetStructId : null,
              file_url: finalUrl, description: description
          }).eq('id', editingResourceId);
          if (error) alert("Erreur base de données : " + error.message);
      } else {
          const { error } = await supabase.from('resources').insert({
              title, file_type: type, category, access_scope: scope, 
              target_structure_id: scope === 'local' ? targetStructId : null,
              file_url: finalUrl, description: description, uploaded_by: user.id
          });
          if (error) alert("Erreur base de données : " + error.message);
      }
      
      await refreshData();
      setIsModalOpen(false);
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

  const handleDeletePrompt = async (id: string | number) => {
      if(!confirm("Supprimer ce prompt ?")) return;
      if (!supabase) { setPrompts(prompts.filter(p => p.id !== id)); return; }
      try {
          const { error } = await supabase.from('prompts').delete().eq('id', id);
          if (error) throw error;
          await refreshData();
      } catch (err: any) { alert("Erreur suppression : " + err.message); }
  }

  const handleCreateStructure = async (name: string, city: string) => {
      if (!supabase) {
          setStructures([...structures, { id: Date.now(), name, city }]);
          setIsModalOpen(false);
          return;
      }
      const { error } = await supabase.from('structures').insert({ name, city });
      if (error) alert("Erreur : " + error.message);
      else { await refreshData(); setIsModalOpen(false); }
  }

  const handleDeleteStructure = async (id: string | number) => {
      if (!confirm("Supprimer cette structure ?")) return;
      if (!supabase) {
          setStructures(structures.filter(s => s.id !== id));
          return;
      }
      const { error } = await supabase.from('structures').delete().eq('id', id);
      if (error) alert("Erreur : " + error.message);
      else { await refreshData(); }
  }

  const handleSubmitUser = async () => {
      if (!supabase) { 
          // Mode Démo locale
          if (editingUserId) {
             setAdminUsers(adminUsers.map(u => u.id === editingUserId ? {...u, email: userFormEmail, name: userFormName, role: userFormRole, structure_id: userFormStructure, missionLocale: structures.find(s=>s.id == userFormStructure)?.name || 'Inconnue' } : u));
          } else {
             setAdminUsers([...adminUsers, { id: Date.now(), email: userFormEmail, name: userFormName, role: userFormRole, structure_id: userFormStructure, missionLocale: structures.find(s=>s.id == userFormStructure)?.name || 'Inconnue', avatar: userFormName.substring(0,2).toUpperCase() }]);
             alert(`INVITATION SIMULÉE : Un email d'invitation serait envoyé à ${userFormEmail}.`);
          }
          setIsModalOpen(false); 
          return; 
      }

      try {
          if (editingUserId) {
              // MODE ÉDITION : On met à jour un profil existant
              const { error } = await supabase.from('profiles').update({
                  full_name: userFormName,
                  role: userFormRole,
                  structure_id: userFormStructure
              }).eq('id', editingUserId);
              
              if (error) throw error;
          } else {
              // MODE CRÉATION (INVITATION)
              // Note: Avec l'API client, on ne peut pas créer d'utilisateur Auth.
              // On affiche juste un message de simulation pour la démo.
              alert(`INVITATION SIMULÉE : Un email d'invitation serait envoyé à ${userFormEmail} pour rejoindre la structure.`);
          }
          await refreshData();
          setIsModalOpen(false);
      } catch (err: any) {
          alert("Erreur sauvegarde utilisateur : " + err.message);
      }
  }

  const handleCreateDomain = async (rawDomain: string, targetStructureId?: string | number) => {
      const normalized = rawDomain.trim().replace(/^@/, '').toLowerCase();
      if (!normalized.includes('.')) {
          alert("Merci de saisir un domaine valide, par exemple missionlocale.fr");
          return;
      }

      if (!supabase) {
          onAllowedDomainsChange([...allowedDomains, {
              id: Date.now(),
              domain: normalized,
              structure_id: targetStructureId || undefined,
              structure_name: structures.find(s => s.id == targetStructureId)?.name
          }]);
          setIsModalOpen(false);
          return;
      }

      const { error } = await supabase.from('allowed_domains').insert({
          domain: normalized,
          structure_id: targetStructureId || null,
          created_by: user.id
      });

      if (error) alert("Erreur : " + error.message);
      else { await refreshData(); setIsModalOpen(false); }
  }

  const handleDeleteDomain = async (id: string | number) => {
      if (!confirm("Supprimer ce domaine autorisé ?")) return;
      if (!supabase) {
          onAllowedDomainsChange(allowedDomains.filter(d => d.id !== id));
          return;
      }

      const { error } = await supabase.from('allowed_domains').delete().eq('id', id);
      if (error) alert("Erreur : " + error.message);
      else { await refreshData(); }
  }

  // --- ADMIN VUES ---
  const renderStructures = () => (
    <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Gestion des Structures</h2>
            <button onClick={() => { setModalMode('structure'); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center hover:bg-indigo-700">
                <Plus size={16} className="mr-2"/> Ajouter
            </button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b"><tr><th className="p-4">Nom</th><th className="p-4">Ville</th><th className="p-4 text-right">Actions</th></tr></thead>
                <tbody>
                    {structures.map(s => (
                    <tr key={s.id} className="border-b last:border-0"><td className="p-4 font-medium">{s.name}</td><td className="p-4 text-slate-500">{s.city}</td><td className="p-4 text-right"><button onClick={() => handleDeleteStructure(s.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button></td></tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderUsers = () => (
    <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Gestion des Utilisateurs</h2>
            <button onClick={prepareInviteUser} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center hover:bg-indigo-700">
                <UserPlus size={16} className="mr-2"/> Inviter un salarié
            </button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Utilisateur</th>
                        <th className="px-6 py-4">Rôle</th>
                        <th className="px-6 py-4">Structure</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {adminUsers.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                        {u.avatar}
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900">{u.name}</div>
                                        <div className="text-xs text-slate-500">{u.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{u.role}</span></td>
                            <td className="px-6 py-4 text-slate-600">{u.missionLocale}</td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => prepareEditUser(u)} className="text-indigo-600 hover:underline text-xs flex items-center justify-end gap-1">
                                    <Pencil size={12}/> Modifier
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderDomains = () => (
    <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Domaines autorisés</h2>
            <button
                onClick={() => {
                    setModalMode('domain');
                    setIsModalOpen(true);
                    setDomainFormValue('');
                    setDomainFormStructure(structures[0] ? structures[0].id : '');
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center hover:bg-indigo-700"
            >
                <Plus size={16} className="mr-2"/> Ajouter un domaine
            </button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Domaine</th>
                        <th className="px-6 py-4">Structure rattachée</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {allowedDomains.map(d => (
                        <tr key={d.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-800">{d.domain}</td>
                            <td className="px-6 py-4 text-slate-600">{d.structure_name || structures.find(s => s.id == d.structure_id)?.name || 'Non spécifié'}</td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => handleDeleteDomain(d.id)} className="text-red-500 hover:underline text-xs flex items-center justify-end gap-1">
                                    <Trash2 size={12}/> Supprimer
                                </button>
                            </td>
                        </tr>
                    ))}
                    {allowedDomains.length === 0 && (
                        <tr>
                            <td className="px-6 py-4 text-sm text-slate-500" colSpan={3}>
                                Aucun domaine n'a encore été ajouté. Ajoutez-en pour autoriser l'auto-inscription.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderResources = () => {
    // SÉPARATION DES RESSOURCES PAR TYPE
    const articles = resources.filter(r => r.type === 'text');
    const videos = resources.filter(r => r.type === 'video');
    const tools = resources.filter(r => r.type === 'link');
    const files = resources.filter(r => r.type === 'file' || r.type === 'pdf' || !r.type);

    return (
        <div className="space-y-12">
            {/* 1. ARTICLES & TUTOS */}
            {articles.length > 0 && (
                <section>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><AlignLeft className="text-amber-500"/> Articles & Tutoriels</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map(r => (
                            <div key={r.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow relative group">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge color="green">{r.category}</Badge>
                                    <div className="flex gap-1">
                                        {isAdmin && (
                                            <>
                                                <button onClick={() => prepareEditResource(r)} className="text-slate-300 hover:text-indigo-600 p-1 rounded-full hover:bg-indigo-50"><Pencil size={14}/></button>
                                                <button onClick={() => handleDeleteResource(r.id)} className="text-slate-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50"><Trash2 size={14}/></button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <h4 className="font-bold text-slate-800 mb-2">{r.title}</h4>
                                <div className="text-sm text-slate-600 line-clamp-3 mb-4 flex-1">
                                    {r.description}
                                </div>
                                <button onClick={() => setViewingResource(r)} className="text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 mt-auto">
                                    Lire l'article <ArrowRight size={14}/>
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 2. VIDÉOTHÈQUE */}
            {videos.length > 0 && (
                <section>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Video className="text-red-500"/> Vidéothèque</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {videos.map(r => {
                            const videoId = r.file_url ? getYoutubeId(r.file_url) : null;
                            const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;

                            return (
                                <div key={r.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                                    <div className="aspect-video bg-slate-100 relative group-hover:opacity-90 transition-opacity">
                                        {thumbnailUrl ? (
                                            <img src={thumbnailUrl} alt={r.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300"><Video size={48}/></div>
                                        )}
                                        <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <PlayCircle size={48} className="text-white drop-shadow-lg"/>
                                        </a>
                                        {isAdmin && <button onClick={() => handleDeleteResource(r.id)} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>}
                                    </div>
                                    <div className="p-3">
                                        <h4 className="font-bold text-sm text-slate-800 truncate" title={r.title}>{r.title}</h4>
                                        <span className="text-xs text-slate-500">{r.category}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* 3. OUTILS & LIENS */}
            {tools.length > 0 && (
                <section>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><LinkIcon className="text-indigo-500"/> Outils & Liens utiles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tools.map(r => (
                            <div key={r.id} className="bg-white p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all flex items-center gap-3 group">
                                <div className="bg-indigo-50 p-2 rounded text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                                    <Globe size={20}/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="font-medium text-slate-700 hover:text-indigo-600 truncate block focus:outline-none inset-0">
                                        {r.title}
                                    </a>
                                    <p className="text-xs text-slate-400 truncate">{r.category}</p>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600"><ExternalLink size={14}/></a>
                                    {isAdmin && <button onClick={() => handleDeleteResource(r.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 4. TÉLÉCHARGEMENTS (FICHIERS) */}
            {files.length > 0 && (
                <section>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Download className="text-blue-500"/> Fichiers à télécharger</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {files.map(r => (
                            <div key={r.id} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between hover:shadow-md transition-all">
                                <div>
                                    <div className="flex items-start justify-between mb-2">
                                        <FileText className="text-blue-500" size={24}/>
                                        {isAdmin && <button onClick={() => handleDeleteResource(r.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>}
                                    </div>
                                    <h4 className="font-bold text-sm text-slate-800 mb-1">{r.title}</h4>
                                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{r.category}</span>
                                </div>
                                <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="mt-4 text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                                    <Download size={12}/> Télécharger
                                </a>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
  };

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
               {isAdmin && (
                   <>
                       <div className="mt-6 mb-2 px-4 text-xs font-bold text-slate-400 uppercase">Administration</div>
                       <SidebarItem icon={Building2} label="Structures" active={currentTab === 'structures'} onClick={() => setCurrentTab('structures')} />
                       <SidebarItem icon={Globe} label="Domaines" active={currentTab === 'domains'} onClick={() => setCurrentTab('domains')} />
                       <SidebarItem icon={Users} label="Utilisateurs" active={currentTab === 'users'} onClick={() => setCurrentTab('users')} />
                   </>
               )}
            </nav>
         </div>
         <div className="p-4 border-t border-slate-100 bg-slate-50">
            <div className="mb-2 px-2">
                <p className="text-sm font-bold text-slate-700 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                    {user.role} 
                    {isAdmin && <ShieldCheck size={12} className="text-indigo-600"/>}
                </p>
            </div>
            <button onClick={onLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-500 mb-3 ml-2 text-sm"><LogOut size={16}/> Déconnexion</button>
            <div className="flex justify-center gap-3 text-[10px] text-slate-400 border-t border-slate-200 pt-3">
               <button onClick={() => onOpenLegal('mentions')} className="hover:text-indigo-600">Mentions Légales</button>
               <span>•</span>
               <button onClick={() => onOpenLegal('privacy')} className="hover:text-indigo-600">Confidentialité</button>
            </div>

            {/* --- CRÉDITS SILVERIA --- */}
            <div className="mt-4 pt-2 border-t border-slate-200 text-center">
               <div className="flex items-center justify-center gap-2 mb-1">
                   {/* ⚠️ Assurez-vous d'avoir 'logo-silveria.png' dans votre dossier /public */}
                   <img src="/logo-silveria.png" alt="Logo Silveria" className="h-6 w-auto object-contain" />
               </div>
               <p className="text-[9px] text-slate-400">Conçu et mis à jour par Silveria</p>
            </div>
         </div>
      </aside>

      <main className="flex-1 p-8">
         {/* HEADER COMMUN */}
         {currentTab !== 'structures' && currentTab !== 'users' && currentTab !== 'domains' && (
             <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">
                   {currentTab === 'prompts' && 'Promptothèque'}
                   {currentTab === 'resources' && 'Centre de Ressources'}
                </h1>
                <button 
                   onClick={() => { 
                       if (currentTab === 'prompts') prepareCreatePrompt();
                       else {
                           setModalMode(currentTab === 'structures' ? 'structure' : 'resource');
                           setEditingResourceId(null); // Mode création
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
         )}

         {/* CONTENU */}
         {currentTab === 'prompts' && (
            <div className="space-y-6 max-w-4xl">
               <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                 <button onClick={() => setSelectedCategory('Tous')} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'Tous' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Tous</button>
                 {availableCategories.map(cat => (
                     <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{cat}</button>
                 ))}
               </div>
               {filteredPrompts.map(p => (
                  <div key={p.id} className={`bg-white p-6 rounded-xl border shadow-sm ${p.isFork ? 'border-l-4 border-l-indigo-400 ml-8' : 'border-slate-200'}`}>
                     <div className="flex justify-between mb-3">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">{p.avatar}</div>
                           <div>
                              <h3 className="font-bold text-slate-800 flex items-center gap-2">{p.title} {p.isFork && p.parentAuthor && <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full flex items-center border border-indigo-100"><GitFork size={10} className="mr-1"/> Variante de {p.parentAuthor}</span>}</h3>
                              <p className="text-xs text-slate-500">{p.author} • {p.missionLocale}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge>{p.tags[0]}</Badge>
                            {(isAdmin || p.user_id === user.id) && <button onClick={() => prepareEditPrompt(p)} className="text-slate-300 hover:text-indigo-500 p-1"><Pencil size={14} /></button>}
                            {isAdmin && <button onClick={() => handleDeletePrompt(p.id)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={14} /></button>}
                        </div>
                     </div>
                     <div className="bg-slate-50 p-4 rounded text-sm font-mono text-slate-700 whitespace-pre-wrap">{p.content}</div>
                     <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                        <button onClick={() => prepareForkPrompt(p)} className="text-xs font-medium text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded flex items-center gap-1"><GitFork size={14} /> Améliorer / Proposer une variante</button>
                     </div>
                  </div>
               ))}
            </div>
         )}

         {currentTab === 'resources' && renderResources()}

         {currentTab === 'structures' && renderStructures()}
         {currentTab === 'users' && renderUsers()}
         {currentTab === 'domains' && renderDomains()}
      </main>

      {/* MODAL LECTURE DE RESSOURCE TEXTE */}
      <Modal isOpen={!!viewingResource} onClose={() => setViewingResource(null)} title={viewingResource?.title || 'Lecture'}>
          <div className="prose prose-sm prose-slate max-w-none"><p className="whitespace-pre-wrap">{viewingResource?.description}</p></div>
      </Modal>

      {/* MODAL SIMPLIFIÉE POUR AJOUT */}
      {isModalOpen && (
         <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">
                      {modalMode === 'prompt' ? (editingPromptId ? "Modifier le prompt" : parentPromptId ? "Améliorer ce prompt" : "Nouveau Prompt") 
                      : modalMode === 'user' ? (editingUserId ? "Modifier l'utilisateur" : "Inviter un salarié")
                      : modalMode === 'domain' ? "Ajouter un domaine"
                      : modalMode === 'resource' ? (editingResourceId ? "Modifier la ressource" : "Nouvelle ressource")
                      : "Nouvel Élément"}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)}><X /></button>
               </div>
               
               <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const formData = new FormData(form);
                  
                  if (modalMode === 'prompt') handleSubmitPrompt();
                  else if (modalMode === 'structure') handleCreateStructure(formData.get('name') as string, formData.get('city') as string);
                  else if (modalMode === 'resource') handleCreateResource(formData.get('title') as string, formData.get('category') as string, 'global', selectedFile);
                  else if (modalMode === 'domain') handleCreateDomain(formData.get('domain') as string, domainFormStructure);
                  else if (modalMode === 'user') handleSubmitUser();
               }} className="space-y-4">
                  
                  {modalMode === 'prompt' && (
                     <>
                        {parentPromptId && !editingPromptId && (
                            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded text-xs text-indigo-700 flex items-center gap-2">
                                <GitFork size={14}/> Vous créez une variante. Le contenu original est pré-rempli.
                            </div>
                        )}
                        <div><label className="block text-xs font-bold text-slate-500 mb-1">Titre</label><input value={promptFormTitle} onChange={(e) => setPromptFormTitle(e.target.value)} required placeholder="Titre du prompt" className="w-full border p-2 rounded" /></div>
                        
                        {/* --- SÉLECTEUR DE CATÉGORIE DYNAMIQUE --- */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Catégorie</label>
                            {isCustomTag ? (
                                <div className="flex gap-2 items-center animate-in fade-in slide-in-from-left-2 duration-200">
                                    <input 
                                        value={promptFormTag} 
                                        onChange={(e) => setPromptFormTag(e.target.value)} 
                                        required 
                                        placeholder="Nom de la nouvelle catégorie..." 
                                        className="w-full border p-2 rounded ring-2 ring-indigo-100 focus:ring-indigo-500 outline-none" 
                                        autoFocus
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => { setIsCustomTag(false); setPromptFormTag(availableCategories[0]); }}
                                        className="text-slate-400 hover:text-red-500 bg-slate-50 p-2.5 rounded border border-slate-200 hover:bg-red-50 transition-colors"
                                        title="Annuler et revenir à la liste"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ) : (
                                <select 
                                    value={promptFormTag} 
                                    onChange={(e) => {
                                        if (e.target.value === '___NEW___') {
                                            setIsCustomTag(true);
                                            setPromptFormTag('');
                                        } else {
                                            setPromptFormTag(e.target.value);
                                        }
                                    }} 
                                    className="w-full border p-2 rounded bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    <option disabled>──────────</option>
                                    <option value="___NEW___" className="font-bold text-indigo-600 bg-indigo-50">+ Ajouter une catégorie...</option>
                                </select>
                            )}
                        </div>

                        <div><label className="block text-xs font-bold text-slate-500 mb-1">Contenu</label><textarea value={promptFormContent} onChange={(e) => setPromptFormContent(e.target.value)} required placeholder="Votre prompt..." rows={8} className="w-full border p-2 rounded font-mono text-sm" /></div>
                     </>
                  )}

                  {modalMode === 'structure' && (
                     <>
                        <input name="name" required placeholder="Nom de la Mission Locale" className="w-full border p-2 rounded" />
                        <input name="city" required placeholder="Ville" className="w-full border p-2 rounded" />
                     </>
                  )}

                  {modalMode === 'user' && (
                      <>
                        {!editingUserId && (
                            <div className="bg-blue-50 border border-blue-100 p-3 rounded text-xs text-blue-700 flex items-center gap-2 mb-4">
                                <Mail size={14}/> Pour ajouter un utilisateur, renseignez son email. Il recevra une invitation (simulée).
                            </div>
                        )}
                        <div><label className="block text-xs font-bold text-slate-500 mb-1">Nom complet</label><input value={userFormName} onChange={(e) => setUserFormName(e.target.value)} required placeholder="Ex: Jean Dupont" className="w-full border p-2 rounded" /></div>
                        <div><label className="block text-xs font-bold text-slate-500 mb-1">Email</label><input value={userFormEmail} onChange={(e) => setUserFormEmail(e.target.value)} required type="email" placeholder="jean@missionlocale.fr" className="w-full border p-2 rounded" disabled={!!editingUserId} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Rôle</label>
                                <select value={userFormRole} onChange={(e) => setUserFormRole(e.target.value)} className="w-full border p-2 rounded bg-white">
                                    <option value="Conseiller">Conseiller</option>
                                    <option value="Directeur">Directeur</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Structure</label>
                                <select value={userFormStructure} onChange={(e) => setUserFormStructure(e.target.value)} className="w-full border p-2 rounded bg-white">
                                    {structures.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                      </>
                  )}

                  {modalMode === 'resource' && (
                     <>
                        <div><label className="block text-xs font-bold text-slate-500 mb-1">Titre</label><input name="title" defaultValue={editingResourceId ? resources.find(r => r.id === editingResourceId)?.title : ''} required placeholder="Titre de la ressource" className="w-full border p-2 rounded" /></div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">Type de contenu</label>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button type="button" onClick={() => setResFormType('file')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${resFormType === 'file' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Fichier</button>
                                <button type="button" onClick={() => setResFormType('text')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${resFormType === 'text' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Article</button>
                                <button type="button" onClick={() => setResFormType('link')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${resFormType === 'link' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Lien</button>
                                <button type="button" onClick={() => setResFormType('video')} className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${resFormType === 'video' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Vidéo</button>
                            </div>
                        </div>
                        {resFormType === 'file' && (
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {if(e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);}} />
                                <div className="flex flex-col items-center pointer-events-none">
                                    <UploadCloud className="text-slate-400 mb-2" size={32} />
                                    <span className="text-sm font-medium text-slate-600">{selectedFile ? selectedFile.name : (editingResourceId && resFormContent ? "Fichier actuel conservé (cliquer pour changer)" : "Cliquez pour sélectionner un fichier")}</span>
                                    <span className="text-xs text-slate-400 mt-1">PDF, Word ou Slides</span>
                                </div>
                            </div>
                        )}
                        {resFormType === 'text' && <div><textarea value={resFormContent} onChange={(e) => setResFormContent(e.target.value)} placeholder="Écrivez votre article ici..." rows={6} className="w-full border p-2 rounded font-mono text-sm" /></div>}
                        {(resFormType === 'link' || resFormType === 'video') && <div><input type="url" value={resFormContent} onChange={(e) => setResFormContent(e.target.value)} placeholder={resFormType === 'video' ? "https://youtube.com/watch?v=..." : "https://exemple.com"} className="w-full border p-2 rounded" /></div>}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Catégorie</label>
                            <select name="category" defaultValue={editingResourceId ? resources.find(r => r.id === editingResourceId)?.category : 'Formation'} className="w-full border p-2 rounded bg-white">
                                <option>Formation</option><option>Veille</option><option>Juridique</option><option>Outil</option><option>Interne</option>
                            </select>
                        </div>
                     </>
                  )}

                  {modalMode === 'domain' && (
                     <>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Nom de domaine</label>
                            <input
                                name="domain"
                                value={domainFormValue}
                                onChange={(e) => setDomainFormValue(e.target.value)}
                                required
                                placeholder="exemple.org"
                                className="w-full border p-2 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Structure associée (optionnel)</label>
                            <select
                                value={domainFormStructure}
                                onChange={(e) => setDomainFormStructure(e.target.value)}
                                className="w-full border p-2 rounded bg-white"
                            >
                                <option value="">Sans rattachement</option>
                                {structures.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <p className="text-[11px] text-slate-500 mt-1">Les emails terminant par ce domaine pourront créer un compte librement.</p>
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
  const [allowedDomains, setAllowedDomains] = useState<AllowedDomain[]>([]);

  const loadAllowedDomains = useCallback(async () => {
      if (!supabase) {
          setAllowedDomains(MOCK_ALLOWED_DOMAINS);
          return;
      }

      try {
          const { data, error } = await supabase.from('allowed_domains').select('*, structures(name)');
          if (error) throw error;
          if (data) {
              setAllowedDomains(data.map((d: any) => ({
                  id: d.id,
                  domain: d.domain,
                  structure_id: d.structure_id,
                  structure_name: d.structures?.name
              })));
          }
      } catch (err) {
          console.error('Erreur chargement domaines autorisés :', err);
      }
  }, []);

  useEffect(() => { loadAllowedDomains(); }, [loadAllowedDomains]);

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
            <LoginPage onLogin={setCurrentUser} onOpenLegal={openLegal} allowedDomains={allowedDomains} />
        ) : (
            <Dashboard 
                user={currentUser} 
                onLogout={() => setCurrentUser(null)} 
                onOpenLegal={openLegal}
                allowedDomains={allowedDomains}
                onAllowedDomainsChange={setAllowedDomains}
            />
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
