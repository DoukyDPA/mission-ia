// src/components/dashboard/Sidebar.tsx
import React from 'react';
import { 
  Menu, X, GitFork, BookOpen, Building2, Globe, Users, 
  LogOut, ShieldCheck, FileText, Sparkles, Home as HomeIcon,
  MessageSquare, HelpCircle
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
        {/* EN-TÊTE DESKTOP AVEC LE LOGO */}
        <div className="p-6 border-b border-slate-100 hidden md:block">
           <div className="flex items-center">
               <img src="/logo.png" alt="IAMESRESSOURCES" className="h-12 w-auto object-contain" />
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

        {/* RESTAURATION DE L'ESPACE CVFORIA */}
        <div className="px-4 mt-6 mb-4">
            <p className="text-[10px] text-slate-500 text-center mb-2 leading-tight font-medium">Anonymiseur de documents CVFORIA</p>
            <a href="https://solutions.silveria.fr/" target="_blank" rel="noopener noreferrer" className="flex justify-center hover:opacity-80 transition-opacity">
                <img src="/logo-anonymiseur.png" alt="CVFORIA" className="h-auto w-32 object-contain" />
            </a>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="mb-4 px-2 hidden md:block">
            <p className="text-sm font-bold text-slate-700 truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 uppercase font-medium flex items-center gap-1">
                {user.role} {isAdmin && <ShieldCheck size={12} className="text-[#116862]"/>}
            </p>
        </div>
        
        <button onClick={onLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-500 mb-4 ml-2 text-xs w-full md:w-auto font-medium">
            <LogOut size={14}/> Déconnexion
        </button>

        {/* RESTAURATION DU PIED DE PAGE COMPLET (Mentions, Logo Silveria, Copyright) */}
        <div className="hidden md:flex justify-center gap-3 text-[10px] text-slate-400 border-t border-slate-200 pt-3">
            <button onClick={() => onOpenLegal('mentions')} className="hover:text-[#116862] transition-colors">Mentions Légales</button>
            <span>•</span>
            <button onClick={() => onOpenLegal('privacy')} className="hover:text-[#116862] transition-colors">Confidentialité</button>
        </div>
        
        <div className="mt-4 pt-3 border-t border-slate-200 text-center hidden md:block">
           <div className="flex items-center justify-center mb-2">
               <img src="/logo-silveria.png" alt="Silveria" className="h-5 w-auto object-contain opacity-80" />
           </div>
           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">© 2026 - Silveria</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* EN-TÊTE MOBILE AVEC LE LOGO */}
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
         <img src="/logo.png" alt="IAMESRESSOURCES" className="h-8 w-auto object-contain" />
         <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600"><Menu /></button>
      </div>
      
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm md:hidden">
            <div className="bg-white w-3/4 h-full shadow-xl animate-in slide-in-from-left duration-200 flex flex-col">
                <div className="flex justify-end p-4 border-b border-slate-100"><button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-500"><X /></button></div>
                <div className="h-full overflow-y-auto"><MenuContent /></div>
            </div>
        </div>
      )}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col z-10 sticky top-0 h-screen overflow-y-auto">
        <MenuContent />
      </aside>
    </>
  );
};
