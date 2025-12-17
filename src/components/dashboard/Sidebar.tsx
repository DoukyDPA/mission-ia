import React from 'react';
import { Menu, X, GitFork, BookOpen, Building2, Globe, Users, LogOut, ShieldCheck } from 'lucide-react';
import { SidebarItem } from '@/components/ui/SidebarItem';
import { User } from '@/types';

interface SidebarProps {
  user: User;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isAdmin: boolean;
  onLogout: () => void;
  onOpenLegal: (type: 'mentions' | 'privacy') => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

export const Sidebar = ({ user, currentTab, setCurrentTab, isAdmin, onLogout, onOpenLegal, isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) => {
  
  const MenuContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Header du menu */}
        <div className="p-6 border-b border-slate-100 hidden md:block">
           <div className="flex items-center gap-2 text-[#116862] font-bold text-xl">
               <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
           </div>
           <div className="mt-4 p-2 bg-[#116862]/10 rounded text-xs font-bold text-[#116862]">{user.missionLocale}</div>
        </div>

        <nav className="p-4 space-y-1">
           <SidebarItem icon={GitFork} label="Prompts" active={currentTab === 'prompts'} onClick={() => { setCurrentTab('prompts'); setIsMobileMenuOpen(false); }} />
           <SidebarItem icon={BookOpen} label="Ressources" active={currentTab === 'resources'} onClick={() => { setCurrentTab('resources'); setIsMobileMenuOpen(false); }} />
           {isAdmin && (
             <>
               <div className="mt-6 mb-2 px-4 text-xs font-bold text-slate-400 uppercase">Administration</div>
               <SidebarItem icon={Building2} label="Structures" active={currentTab === 'structures'} onClick={() => { setCurrentTab('structures'); setIsMobileMenuOpen(false); }} />
               <SidebarItem icon={Globe} label="Domaines" active={currentTab === 'domains'} onClick={() => { setCurrentTab('domains'); setIsMobileMenuOpen(false); }} />
               <SidebarItem icon={Users} label="Utilisateurs" active={currentTab === 'users'} onClick={() => { setCurrentTab('users'); setIsMobileMenuOpen(false); }} />
             </>
           )}
        </nav>

        {/* PROMO ANONYMISEUR */}
        <div className="px-4 mt-6">
            <p className="text-[10px] text-slate-500 text-center mb-2 leading-tight">Téléchargez gratuitement notre "anonymiseur" de CV pour utiliser l'IA en toute discrétion</p>
            <a href="https://solutions.silveria.fr/" target="_blank" rel="noopener noreferrer" className="flex justify-center hover:opacity-80 transition-opacity">
                <img src="/logo-anonymiseur.png" alt="Anonymiseur Silveria" className="h-auto w-40 md:w-40 w-48 object-contain" />
            </a>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="mb-2 px-2 hidden md:block"><p className="text-sm font-bold text-slate-700 truncate">{user.name}</p><p className="text-xs text-slate-500 truncate flex items-center gap-1">{user.role} {isAdmin && <ShieldCheck size={12} className="text-[#116862]"/>}</p></div>
        <button onClick={onLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-500 mb-3 ml-2 text-sm w-full md:w-auto justify-center md:justify-start p-2 md:p-0 border md:border-0 rounded"><LogOut size={16}/> Déconnexion</button>
        <div className="hidden md:flex justify-center gap-3 text-[10px] text-slate-400 border-t border-slate-200 pt-3"><button onClick={() => onOpenLegal('mentions')} className="hover:text-[#116862]">Mentions Légales</button><span>•</span><button onClick={() => onOpenLegal('privacy')} className="hover:text-[#116862]">Confidentialité</button></div>
        <div className="mt-4 pt-2 border-t border-slate-200 text-center hidden md:block">
           <div className="flex items-center justify-center gap-2 mb-1"><img src="/logo-silveria.png" alt="Silveria" className="h-6 w-auto object-contain" /></div>
           <p className="text-[9px] text-slate-400 font-bold">Conçu et mis à jour par Silveria</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Header Mobile */}
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
         <div className="flex items-center gap-2 font-bold text-lg text-[#116862]">
             <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
         </div>
         <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600 p-1"><Menu /></button>
      </div>

      {/* Overlay Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm md:hidden">
            <div className="bg-white w-3/4 h-full shadow-xl animate-in slide-in-from-left duration-200">
                <div className="flex justify-between items-center p-4 mb-2">
                    <span className="font-bold text-lg text-slate-800">Menu</span>
                    <button onClick={() => setIsMobileMenuOpen(false)}><X className="text-slate-500"/></button>
                </div>
                <div className="h-full overflow-y-auto pb-20"><MenuContent /></div>
            </div>
        </div>
      )}

      {/* Sidebar Desktop */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col z-10 justify-between sticky top-0 h-screen">
          <MenuContent />
      </aside>
    </>
  );
};
