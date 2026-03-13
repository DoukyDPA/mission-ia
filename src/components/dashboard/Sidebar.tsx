import React from 'react';
import { 
  Menu, X, GitFork, BookOpen, Building2, Globe, Users, 
  LogOut, ShieldCheck, FileText, Sparkles, Home as HomeIcon,
  MessageSquare, HelpCircle // Nouveaux imports
} from 'lucide-react';
import { SidebarItem } from '@/components/ui/SidebarItem';
import { User, Structure } from '@/types';

interface SidebarProps {
  user: User;
  userStructure: Structure | null;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isAdmin: boolean;
  onLogout: () => void;
  onOpenLegal: (type: 'mentions' | 'privacy') => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

export const Sidebar = ({ user, userStructure, currentTab, setCurrentTab, isAdmin, onLogout, onOpenLegal, isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) => {
  
  const MenuContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="p-6 border-b border-slate-100 hidden md:block">
           <div className="flex items-center gap-2 text-[#116862] font-extrabold text-xl tracking-tighter uppercase">
               IAMESRESSOURCES
           </div>
           <div className="mt-4 p-2 bg-[#116862]/10 rounded text-xs font-bold text-[#116862] truncate">
             {user.missionLocale}
           </div>
        </div>

        <nav className="p-4 space-y-1">
           <SidebarItem icon={HomeIcon} label="Accueil" active={currentTab === 'home'} onClick={() => { setCurrentTab('home'); setIsMobileMenuOpen(false); }} />
           
           <SidebarItem icon={GitFork} label="Promptothèque" active={currentTab === 'prompts'} onClick={() => { setCurrentTab('prompts'); setIsMobileMenuOpen(false); }} />
           
           <SidebarItem icon={Sparkles} label="Labo Prompts" active={currentTab === 'assistant'} onClick={() => { setCurrentTab('assistant'); setIsMobileMenuOpen(false); }} />
           
           <SidebarItem icon={BookOpen} label="Ressources & Veille" active={currentTab === 'resources'} onClick={() => { setCurrentTab('resources'); setIsMobileMenuOpen(false); }} />

           {/* --- NOUVEAUX ONGLETS FORUM & FAQ --- */}
           <div className="mt-6 mb-2 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-4 border-t border-slate-100">Entraide</div>
           
           <SidebarItem icon={MessageSquare} label="Forum" active={currentTab === 'forum'} onClick={() => { setCurrentTab('forum'); setIsMobileMenuOpen(false); }} />
           <SidebarItem icon={HelpCircle} label="FAQ Globale" active={currentTab === 'faq'} onClick={() => { setCurrentTab('faq'); setIsMobileMenuOpen(false); }} />
           
           {userStructure?.has_charter && userStructure?.charter_url && (
             <div className="mt-4 mb-2">
                <a 
                  href={userStructure.charter_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-1 text-[#116862] font-bold bg-[#116862]/5 hover:bg-[#116862]/10 border border-[#116862]/20 text-sm"
                >
                  <FileText size={18} />
                  <span>Ma Charte IA</span>
                </a>
             </div>
           )}

           {isAdmin && (
             <>
               <div className="mt-6 mb-2 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-4 border-t border-slate-100">Administration</div>
               <SidebarItem icon={Building2} label="Structures" active={currentTab === 'structures'} onClick={() => { setCurrentTab('structures'); setIsMobileMenuOpen(false); }} />
               <SidebarItem icon={Globe} label="Domaines" active={currentTab === 'domains'} onClick={() => { setCurrentTab('domains'); setIsMobileMenuOpen(false); }} />
               <SidebarItem icon={Users} label="Utilisateurs" active={currentTab === 'users'} onClick={() => { setCurrentTab('users'); setIsMobileMenuOpen(false); }} />
             </>
           )}
        </nav>

        <div className="px-4 mt-6">
            <p className="text-[10px] text-slate-500 text-center mb-2 leading-tight">Anonymiseur de documents</p>
            <a href="https://solutions.silveria.fr/" target="_blank" rel="noopener noreferrer" className="flex justify-center hover:opacity-80 transition-opacity">
                <img src="/logo-anonymiseur.png" alt="Anonymiseur" className="h-auto w-32 object-contain" />
            </a>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="mb-2 px-2 hidden md:block">
            <p className="text-sm font-bold text-slate-700 truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 uppercase font-medium">
                {user.role} {isAdmin && "• Admin"}
            </p>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-500 mb-3 ml-2 text-xs w-full">
            <LogOut size={14}/> Déconnexion
        </button>
        <div className="mt-2 text-center">
           <p className="text-[9px] text-slate-400 font-bold uppercase">Conçu par Silveria</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
         <span className="font-bold text-[#116862]">IAMESRESSOURCES</span>
         <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600"><Menu /></button>
      </div>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm md:hidden">
            <div className="bg-white w-3/4 h-full shadow-xl animate-in slide-in-from-left duration-200">
                <div className="flex justify-end p-4"><button onClick={() => setIsMobileMenuOpen(false)}><X /></button></div>
                <div className="h-full overflow-y-auto pb-20"><MenuContent /></div>
            </div>
        </div>
      )}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col z-10 sticky top-0 h-screen">
        <MenuContent />
      </aside>
    </>
  );
};
