"use client";
import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  GitFork, 
  Users, 
  Search, 
  FileText, 
  Video, 
  Download, 
  ThumbsUp, 
  MessageSquare, 
  Copy, 
  Plus,
  ArrowRight,
  Menu,
  Bell,
  X,
  Send,
  LogOut,
  Lock,
  Building2,
  Globe,
  UploadCloud,
  ShieldCheck,
  UserPlus,
  Trash2,
  Filter,
  Info
} from 'lucide-react';

// --- Données simulées (Mock Data) ---

const INITIAL_STRUCTURES = [
  { id: 1, name: "Mission Locale de Lyon", city: "Lyon" },
  { id: 2, name: "Mission Locale de Paris", city: "Paris" },
  { id: 3, name: "Mission Locale de Marseille", city: "Marseille" }
];

const MOCK_USERS = [
  {
    id: 1,
    email: "jean.dupont@ml-lyon.fr",
    name: "Jean Dupont",
    role: "Conseiller",
    missionLocale: "Mission Locale de Lyon",
    avatar: "JD"
  },
  {
    id: 2,
    email: "sarah.martin@ml-paris.fr",
    name: "Sarah Martin",
    role: "Directrice",
    missionLocale: "Mission Locale de Paris",
    avatar: "SM"
  },
  {
    id: 3,
    email: "formateur@ia.fr",
    name: "Moi (Formateur)",
    role: "Admin",
    missionLocale: "National",
    avatar: "Admin"
  }
];

const INITIAL_RESOURCES = [
  { id: 1, title: "Module 1 : Les bases du Prompt Engineering", type: "pdf", date: "10 Oct 2023", size: "2.4 MB", category: "Formation", access: "global" },
  { id: 2, title: "Atelier : Utiliser l'IA pour les CVs", type: "video", date: "12 Oct 2023", duration: "45 min", category: "Formation", access: "global" },
  { id: 3, title: "Guide éthique et RGPD", type: "pdf", date: "15 Oct 2023", size: "1.1 MB", category: "Juridique", access: "global" },
  { id: 4, title: "Veille Hebdo : Nouveautés ChatGPT", type: "pdf", date: "Hier", size: "500 KB", category: "Veille", access: "global" },
  { id: 5, title: "Procédure interne : Inscription Parcours", type: "pdf", date: "Il y a 1 mois", size: "1.2 MB", category: "Interne", access: "Mission Locale de Lyon" }, 
];

const INITIAL_PROMPTS = [
  {
    id: 1,
    title: "Synthèse d'entretien jeune",
    content: "Agis comme un conseiller en insertion professionnelle. Voici les notes brutes prises lors de mon entretien avec un jeune de 19 ans sans qualification : [Insérer notes]. Rédige une synthèse formelle de 10 lignes pour son dossier administratif, en mettant en avant ses soft-skills.",
    author: "Jean Dupont",
    role: "Conseiller",
    avatar: "JD",
    missionLocale: "Mission Locale de Lyon",
    date: "Il y a 2 jours",
    tags: ["Administratif", "Suivi dossier"],
    likes: 12,
    forks: 3,
    isFork: false
  },
  {
    id: 2,
    title: "Synthèse d'entretien (Version structurée)",
    content: "Agis comme un conseiller expert. À partir des notes suivantes : [Insérer notes]. Crée un tableau à 3 colonnes : 1. Freins identifiés, 2. Leviers de motivation, 3. Plan d'action suggéré. Termine par une conclusion professionnelle pour le CER.",
    author: "Paul Ricard",
    role: "Chargé de projet",
    avatar: "PR",
    missionLocale: "Mission Locale de Lyon",
    date: "Il y a 4 heures",
    tags: ["Administratif", "Méthode"],
    likes: 8,
    forks: 0,
    isFork: true,
    parentId: 1,
    parentAuthor: "Jean Dupont"
  },
  {
    id: 3,
    title: "Générateur d'arguments pour Appel à Projet",
    content: "Tu es expert en financement public. Aide-moi à rédiger la partie 'Impact attendu' pour un appel à projet sur l'inclusion numérique. Voici les chiffres clés de notre structure : [Insérer chiffres]. Utilise un ton convaincant et institutionnel.",
    author: "Sarah Martin",
    role: "Directrice",
    avatar: "SM",
    missionLocale: "Mission Locale de Paris",
    date: "Il y a 1 semaine",
    tags: ["Direction", "Financement"],
    likes: 24,
    forks: 5,
    isFork: false
  },
  {
    id: 4,
    title: "Simulateur d'entretien d'embauche",
    content: "Tu es un recruteur exigeant pour un poste de vendeur en prêt-à-porter. Je suis un jeune sans expérience. Pose-moi une question à la fois, attends ma réponse, puis commente ma réponse avant de passer à la suivante.",
    author: "Karim Benali",
    role: "Conseiller",
    avatar: "KB",
    missionLocale: "Mission Locale de Marseille",
    date: "Il y a 3 jours",
    tags: ["Relation Jeunes", "Simulation"],
    likes: 15,
    forks: 1,
    isFork: false
  }
];

// --- Composants ---

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
      active 
        ? 'bg-indigo-50 text-indigo-700 font-medium' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
);

const Badge = ({ children, color = "blue" }) => {
  const styles = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${styles[color] || styles.blue}`}>
      {children}
    </span>
  );
};

const ResourceCard = ({ resource, userMissionLocale }) => (
  <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow group relative overflow-hidden">
    {resource.access === 'global' && (
       <div className="absolute top-0 right-0 bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-bl-lg font-bold flex items-center gap-1">
         <Globe size={10} /> National
       </div>
    )}
    {resource.access !== 'global' && (
       <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-bl-lg font-bold flex items-center gap-1">
         <Building2 size={10} /> {resource.access}
       </div>
    )}

    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${resource.type === 'pdf' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
        {resource.type === 'pdf' ? <FileText size={24} /> : <Video size={24} />}
      </div>
      <div>
        <h4 className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">{resource.title}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{resource.category}</span>
          <p className="text-sm text-slate-500">{resource.date} • {resource.type === 'pdf' ? resource.size : resource.duration}</p>
        </div>
      </div>
    </div>
    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors mt-4">
      <Download size={20} />
    </button>
  </div>
);

const PromptCard = ({ prompt, onFork }) => (
  <div className={`group relative bg-white border rounded-xl p-6 transition-all hover:shadow-md ${prompt.isFork ? 'border-indigo-200 ml-8' : 'border-slate-200'}`}>
    
    {prompt.isFork && (
      <div className="absolute -left-8 top-8 w-8 h-8 border-b-2 border-l-2 border-indigo-200 rounded-bl-xl text-indigo-300 flex items-end justify-center pb-1"></div>
    )}

    <div className="flex justify-between items-start mb-3">
      <div className="flex items-start space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${prompt.isFork ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
          {prompt.avatar}
        </div>
        <div>
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            {prompt.title}
            {prompt.isFork && (
              <span className="text-[10px] font-normal flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                <GitFork size={10} />
                 Variante
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500">{prompt.author} • {prompt.missionLocale} • {prompt.date}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {prompt.tags.map(tag => (
          <Badge key={tag} color={tag === "Direction" ? "purple" : "blue"}>{tag}</Badge>
        ))}
      </div>
    </div>

    <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm text-slate-700 mb-4 border border-slate-100 whitespace-pre-wrap">
      {prompt.content}
    </div>

    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
      <div className="flex space-x-4">
        <button className="flex items-center space-x-1 text-xs font-medium text-slate-500 hover:text-emerald-600 transition-colors">
          <ThumbsUp size={14} />
          <span>{prompt.likes} Utile</span>
        </button>
        <button className="flex items-center space-x-1 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors">
          <MessageSquare size={14} />
          <span>Commentaires</span>
        </button>
      </div>

      <div className="flex space-x-2">
        <button 
          onClick={() => onFork(prompt)}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
        >
          <GitFork size={14} />
          <span>Améliorer</span>
        </button>
        <button className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm">
          <Copy size={14} />
          <span>Copier</span>
        </button>
      </div>
    </div>
  </div>
);

// --- Login Page Component ---

const LoginPage = ({ onLogin, onOpenLegal }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-200">
          <Sparkles size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">MissionIA</h1>
        <p className="text-slate-500 mt-2">La plateforme d'intelligence collective des Missions Locales</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Connexion à votre espace</h2>
        
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email professionnel</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom.nom@missionlocale.fr"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <button className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
            Se connecter
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3 text-center">Comptes de démonstration</p>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => onLogin(MOCK_USERS[0])}
              className="text-xs flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-slate-600"
            >
              <span className="font-bold text-indigo-700 block mb-1">Jean</span>
              <span className="scale-90">Conseiller</span>
            </button>
            <button 
              onClick={() => onLogin(MOCK_USERS[1])}
              className="text-xs flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-slate-600"
            >
              <span className="font-bold text-indigo-700 block mb-1">Sarah</span>
              <span className="scale-90">Directrice</span>
            </button>
            <button 
              onClick={() => onLogin(MOCK_USERS[2])}
              className="text-xs flex flex-col items-center justify-center p-2 rounded-lg border border-slate-800 bg-slate-800 text-white hover:bg-slate-700 transition-all"
            >
              <span className="font-bold text-white block mb-1">Moi</span>
              <span className="scale-90 text-slate-300">Admin</span>
            </button>
          </div>
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

// --- Modal Component ---
const Modal = ({ isOpen, onClose, title, children }) => {
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

// --- Main Dashboard Component ---

const Dashboard = ({ user, onLogout, onOpenLegal }) => {
  const [currentTab, setCurrentTab] = useState('prompts'); 
  const [prompts, setPrompts] = useState(INITIAL_PROMPTS);
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [structures, setStructures] = useState(INITIAL_STRUCTURES);
  const [adminUsers, setAdminUsers] = useState(MOCK_USERS);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // SEARCH & FILTER STATE
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  
  // States for Admin forms
  const [newStructName, setNewStructName] = useState('');
  const [newStructCity, setNewStructCity] = useState('');
  
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('Conseiller');
  const [newUserStruct, setNewUserStruct] = useState(INITIAL_STRUCTURES[0].name);

  // Filter logic
  const visiblePrompts = prompts.filter(p => {
    // 1. Role / Scope Visibility
    const hasAccess = user.role === 'Admin' || p.missionLocale === user.missionLocale || p.missionLocale === "National" || p.tags.includes("Direction");
    if (!hasAccess) return false;

    // 2. Search Query (Content/Title/Tags)
    const query = searchQuery.toLowerCase();
    const matchesSearch = p.title.toLowerCase().includes(query) || 
                          p.content.toLowerCase().includes(query) ||
                          p.tags.some(t => t.toLowerCase().includes(query));
    if (!matchesSearch) return false;

    // 3. Category Filter
    if (selectedCategory !== 'Tous' && !p.tags.includes(selectedCategory)) return false;

    return true;
  });
  
  const visibleResources = resources.filter(r => {
    if (user.role === 'Admin') return true; 
    return r.access === 'global' || r.access === user.missionLocale;
  });

  // Form States (Prompt & Resource)
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTag, setNewTag] = useState('Administratif');
  const [resTitle, setResTitle] = useState('');
  const [resType, setResType] = useState('pdf');
  const [resCategory, setResCategory] = useState('Formation');
  const [resScope, setResScope] = useState('local'); // 'local' = restricted, 'global' = all
  const [targetStruct, setTargetStruct] = useState(''); // Specific ML for admin upload

  // Modals Openers
  const openCreateModal = () => {
    setModalMode('create');
    setNewTitle(''); setNewContent(''); setNewTag('Administratif');
    setIsModalOpen(true);
  };

  const openForkModal = (prompt) => {
    setModalMode('fork');
    setSelectedPrompt(prompt);
    setNewTitle(`${prompt.title} (Amélioré)`);
    setNewContent(prompt.content);
    setNewTag(prompt.tags[0]);
    setIsModalOpen(true);
  };

  const openResourceModal = () => {
    setModalMode('createResource');
    setResTitle(''); setResType('pdf'); setResCategory('Formation');
    setResScope('local');
    setTargetStruct(structures[0].name);
    setIsModalOpen(true);
  };

  const openStructureModal = () => {
    setModalMode('createStructure');
    setNewStructName(''); setNewStructCity('');
    setIsModalOpen(true);
  }

  const openUserModal = () => {
    setModalMode('createUser');
    setNewUserEmail(''); setNewUserName('');
    setNewUserRole('Conseiller');
    setNewUserStruct(structures[0].name);
    setIsModalOpen(true);
  }

  // Handlers
  const handlePromptSubmit = (e) => {
    e.preventDefault();
    const newPrompt = {
      id: Date.now(),
      title: newTitle,
      content: newContent,
      author: user.name,
      role: user.role,
      avatar: user.avatar,
      missionLocale: user.missionLocale,
      date: "À l'instant",
      tags: [newTag, modalMode === 'fork' ? 'Amélioration' : 'Nouveau'],
      likes: 0, forks: 0, isFork: modalMode === 'fork',
      parentId: modalMode === 'fork' ? selectedPrompt.id : null,
      parentAuthor: modalMode === 'fork' ? selectedPrompt.author : null
    };
    setPrompts([newPrompt, ...prompts]);
    setIsModalOpen(false);
  };

  const handleResourceSubmit = (e) => {
    e.preventDefault();
    let accessValue = 'global';
    
    if (resScope === 'local') {
        // If admin, access is the specific target struct. If user, it's their own struct.
        accessValue = user.role === 'Admin' ? targetStruct : user.missionLocale;
    }

    const newResource = {
        id: Date.now(),
        title: resTitle,
        type: resType,
        date: "À l'instant",
        size: "1.2 MB", duration: "10 min",
        category: resCategory,
        access: accessValue
    };
    setResources([newResource, ...resources]);
    setIsModalOpen(false);
  };

  const handleStructureSubmit = (e) => {
    e.preventDefault();
    setStructures([...structures, { id: Date.now(), name: newStructName, city: newStructCity }]);
    setIsModalOpen(false);
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    setAdminUsers([...adminUsers, {
        id: Date.now(),
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        missionLocale: newUserStruct,
        avatar: newUserName.substring(0,2).toUpperCase()
    }]);
    setIsModalOpen(false);
  };

  const handleNavClick = (tab) => {
    setCurrentTab(tab);
    setIsMobileMenuOpen(false);
  };

  const getModalTitle = () => {
      if (modalMode === 'create') return "Publier un nouveau prompt";
      if (modalMode === 'fork') return "Améliorer / Adapter un prompt";
      if (modalMode === 'createResource') return "Ajouter un document";
      if (modalMode === 'createStructure') return "Ajouter une Mission Locale";
      if (modalMode === 'createUser') return "Ajouter un participant";
      return "";
  }

  // Admin Views
  const renderStructures = () => (
    <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Gestion des Structures</h2>
            <button onClick={openStructureModal} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center hover:bg-indigo-700">
                <Plus size={16} className="mr-2"/> Ajouter
            </button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Nom de la structure</th>
                        <th className="px-6 py-4">Ville</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {structures.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-900">{s.name}</td>
                            <td className="px-6 py-4 text-slate-500">{s.city}</td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                            </td>
                        </tr>
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
            <button onClick={openUserModal} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center hover:bg-indigo-700">
                <UserPlus size={16} className="mr-2"/> Inviter
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
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {u.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{u.missionLocale}</td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col md:flex-row">
      
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
          <Sparkles className="fill-indigo-600" size={20} />
          <span>MissionIA</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-10 bg-white pt-20 px-4 md:hidden animate-in slide-in-from-top-10 duration-200">
           {/* Mobile Menu Content... */}
        </div>
      )}

      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full hidden md:flex flex-col z-10 justify-between">
        <div>
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
                <Sparkles className="fill-indigo-600" />
                <span>MissionIA</span>
              </div>
              <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mb-1">Espace dédié</p>
                <p className="text-sm font-bold text-indigo-900 leading-tight">{user.missionLocale}</p>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              <div className="text-xs font-semibold text-slate-400 mb-2 px-4 uppercase">Ressources</div>
              <SidebarItem 
                icon={BookOpen} label="Formation & Veille" active={currentTab === 'resources'} 
                onClick={() => setCurrentTab('resources')} 
              />
              
              <div className="mt-6 text-xs font-semibold text-slate-400 mb-2 px-4 uppercase">Communauté</div>
              <SidebarItem 
                icon={GitFork} label="Promptothèque" active={currentTab === 'prompts'} 
                onClick={() => setCurrentTab('prompts')} 
              />
              
              {user.role === 'Admin' && (
                <>
                    <div className="mt-6 text-xs font-semibold text-slate-400 mb-2 px-4 uppercase">Administration</div>
                    <SidebarItem icon={Building2} label="Structures" active={currentTab === 'admin_structures'} onClick={() => setCurrentTab('admin_structures')} />
                    <SidebarItem icon={Users} label="Utilisateurs" active={currentTab === 'admin_users'} onClick={() => setCurrentTab('admin_users')} />
                </>
              )}
            </nav>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white transition-colors mb-2">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full ${user.role === 'Admin' ? 'bg-indigo-600' : 'bg-slate-800'} text-white flex items-center justify-center text-xs font-bold`}>
                {user.avatar}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.role}</p>
              </div>
            </div>
            <button onClick={onLogout} className="text-slate-400 hover:text-red-500" title="Déconnexion">
              <LogOut size={18} />
            </button>
          </div>
          
          <div className="flex justify-center gap-3 text-[10px] text-slate-400 mt-2 border-t border-slate-200 pt-2">
             <button onClick={() => onOpenLegal('mentions')} className="hover:text-indigo-600">Mentions Légales</button>
             <span>•</span>
             <button onClick={() => onOpenLegal('privacy')} className="hover:text-indigo-600">Confidentialité</button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-6">
        {/* Header Desktop */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 hidden md:flex">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {currentTab === 'prompts' && `Base de Prompts : ${user.missionLocale}`}
              {currentTab === 'resources' && 'Centre de Ressources & Veille'}
              {currentTab === 'admin_structures' && 'Administration des Structures'}
              {currentTab === 'admin_users' && 'Administration des Participants'}
            </h1>
          </div>
          {/* SEARCH BAR (Active only in Prompts) */}
          {currentTab === 'prompts' && (
            <div className="flex items-center gap-3">
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Rechercher un prompt..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 bg-white"
                  />
                </div>
            </div>
          )}
        </header>

        {currentTab === 'prompts' && (
          /* ... Prompt View ... */
          <div className="space-y-6 max-w-4xl mx-auto">
             <div className="flex items-center justify-between bg-indigo-900 text-white p-6 rounded-2xl shadow-lg mb-8 relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-lg font-bold mb-2">Partagez votre expertise</h2>
                    <p className="text-indigo-200 text-sm mb-4 max-w-lg">Un prompt utile ? Partagez-le.</p>
                    <button onClick={openCreateModal} className="bg-white text-indigo-900 hover:bg-indigo-50 font-semibold py-2 px-4 rounded-lg text-sm flex items-center transition-colors">
                        <Plus size={16} className="mr-2" /> Nouveau Prompt
                    </button>
                </div>
                <Sparkles className="absolute right-[-20px] top-[-20px] opacity-10" size={200} />
             </div>
             
             {/* CATEGORY FILTERS */}
             <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-4">
                 {['Tous', 'Administratif', 'Relation Jeunes', 'Direction', 'RH', 'Simulation', 'Financement'].map(cat => (
                     <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            selectedCategory === cat 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                     >
                        {cat}
                     </button>
                 ))}
             </div>

             <div className="space-y-6">
                {visiblePrompts.length > 0 ? (
                    visiblePrompts.map(prompt => (
                        <PromptCard key={prompt.id} prompt={prompt} onFork={openForkModal} />
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                        <Filter className="mx-auto text-slate-300 mb-2" size={32} />
                        <p className="text-slate-500 font-medium">Aucun prompt ne correspond à votre recherche.</p>
                        <button onClick={() => {setSearchQuery(''); setSelectedCategory('Tous');}} className="text-indigo-600 text-sm hover:underline mt-1">Réinitialiser les filtres</button>
                    </div>
                )}
             </div>
          </div>
        )}

        {currentTab === 'resources' && (
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-2">
                 <h3 className="text-lg font-bold text-slate-800">Documents disponibles</h3>
                 <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{visibleResources.length} ressources</span>
               </div>
               {user.role === 'Admin' && (
                 <button onClick={openResourceModal} className="bg-slate-900 text-white hover:bg-slate-800 font-semibold py-2 px-4 rounded-lg text-sm flex items-center transition-colors shadow-md">
                    <UploadCloud size={16} className="mr-2" /> Ajouter un document
                 </button>
               )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {visibleResources.map(resource => (
                 <ResourceCard key={resource.id} resource={resource} userMissionLocale={user.missionLocale} />
               ))}
            </div>
          </div>
        )}

        {currentTab === 'admin_structures' && renderStructures()}
        {currentTab === 'admin_users' && renderUsers()}

      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={getModalTitle()}>
        {(modalMode === 'create' || modalMode === 'fork') && (
            /* FORMULAIRE PROMPT */
            <form onSubmit={handlePromptSubmit} className="space-y-4">
              {/* ... (Same prompt form as before) ... */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
                <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"/>
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                 <select 
                   value={newTag}
                   onChange={(e) => setNewTag(e.target.value)}
                   className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                 >
                   <option>Administratif</option>
                   <option>Relation Jeunes</option>
                   <option>Direction</option>
                   <option>RH</option>
                   <option>Simulation</option>
                   <option>Financement</option>
                 </select>
               </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contenu</label>
                <textarea required rows={6} value={newContent} onChange={(e) => setNewContent(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"/>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center shadow-lg shadow-indigo-200"><Send size={16} className="mr-2" /> Publier</button>
              </div>
            </form>
        )}

        {modalMode === 'createResource' && (
            /* FORMULAIRE RESOURCE ADMIN */
            <form onSubmit={handleResourceSubmit} className="space-y-4">
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm text-slate-600 mb-4 flex gap-2">
                    <div className="shrink-0 text-indigo-600"><UploadCloud size={20}/></div>
                    <p>Espace Admin : Ajoutez un document pour le réseau.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Titre du document</label>
                    <input type="text" required value={resTitle} onChange={(e) => setResTitle(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"/>
                </div>
                {/* Type & Category selects ... */}

                <div className="pt-2">
                     <label className="block text-sm font-bold text-slate-800 mb-2">Ciblage / Visibilité</label>
                     <div className="grid grid-cols-1 gap-3">
                        {/* Option Global */}
                        <button type="button" onClick={() => setResScope('global')} className={`p-3 rounded-lg border text-left flex items-start gap-3 transition-all ${resScope === 'global' ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-slate-200 hover:border-slate-300'}`}>
                            <div className={`mt-0.5 ${resScope === 'global' ? 'text-emerald-600' : 'text-slate-400'}`}><Globe size={20} /></div>
                            <div>
                                <span className={`block font-bold text-sm ${resScope === 'global' ? 'text-emerald-900' : 'text-slate-700'}`}>Réseau National (Toutes les ML)</span>
                            </div>
                        </button>
                        
                        {/* Option Local / Ciblé */}
                        <button type="button" onClick={() => setResScope('local')} className={`p-3 rounded-lg border text-left flex items-start gap-3 transition-all ${resScope === 'local' ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-slate-300'}`}>
                            <div className={`mt-0.5 ${resScope === 'local' ? 'text-indigo-600' : 'text-slate-400'}`}><Building2 size={20} /></div>
                            <div className="w-full">
                                <span className={`block font-bold text-sm ${resScope === 'local' ? 'text-indigo-900' : 'text-slate-700'}`}>Cibler une structure spécifique</span>
                                {resScope === 'local' && (
                                    <select 
                                        value={targetStruct} 
                                        onClick={(e) => e.stopPropagation()} // Prevent parent click
                                        onChange={(e) => setTargetStruct(e.target.value)}
                                        className="mt-2 w-full text-sm p-2 rounded border border-indigo-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {structures.map(s => (
                                            <option key={s.id} value={s.name}>{s.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </button>
                     </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
                  <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 flex items-center shadow-lg"><UploadCloud size={16} className="mr-2" /> Mettre en ligne</button>
                </div>
            </form>
        )}

        {modalMode === 'createStructure' && (
            <form onSubmit={handleStructureSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la structure</label>
                    <input required type="text" placeholder="Ex: Mission Locale de Bordeaux" value={newStructName} onChange={(e) => setNewStructName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ville</label>
                    <input required type="text" placeholder="Ex: Bordeaux" value={newStructCity} onChange={(e) => setNewStructCity(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"/>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
                  <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center shadow-lg">Ajouter</button>
                </div>
            </form>
        )}

        {modalMode === 'createUser' && (
            <form onSubmit={handleUserSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
                    <input required type="text" placeholder="Ex: Thomas Dubosc" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input required type="email" placeholder="thomas@missionlocale.fr" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Rôle</label>
                        <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500">
                            <option>Conseiller</option>
                            <option>Directeur</option>
                            <option>Chargé de projet</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Structure</label>
                        <select value={newUserStruct} onChange={(e) => setNewUserStruct(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500">
                            {structures.map(s => (
                                <option key={s.id} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
                  <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center shadow-lg">Inviter</button>
                </div>
            </form>
        )}
      </Modal>
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalType, setLegalType] = useState('mentions'); // 'mentions' or 'privacy'

  const openLegal = (type) => {
      setLegalType(type);
      setIsLegalOpen(true);
  }

  // --- CONTENU LEGAL ---
  const LegalContent = () => (
      <div className="prose prose-sm prose-slate max-w-none">
          {legalType === 'mentions' ? (
              <>
                  <p><strong>Éditeur du site :</strong> MissionIA (Association fictive pour la démo)</p>
                  <p><strong>Siège social :</strong> 123 Avenue de l'Intelligence, 75000 Paris</p>
                  <p><strong>Contact :</strong> contact@missionia.fr</p>
                  <p><strong>Hébergeur :</strong> Vercel Inc.</p>
                  <p>Ce site est une plateforme de démonstration pédagogique.</p>
              </>
          ) : (
              <>
                  <p><strong>Protection des données (RGPD) :</strong></p>
                  <p>Les données collectées (prompts, documents, profils) sont utilisées exclusivement dans le cadre de l'animation du réseau des Missions Locales.</p>
                  <p>Conformément à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification et de suppression de vos données.</p>
                  <p>Aucune donnée n'est revendue à des tiers.</p>
              </>
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
