// src/components/auth/LoginPage.tsx
import React, { useState } from 'react';
import { Users, Lock, Globe, Building2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { User, AllowedDomain } from '@/types';

interface LoginPageProps {
  onLogin: (u: User) => void;
  onOpenLegal: (type: 'mentions' | 'privacy') => void;
  allowedDomains: AllowedDomain[];
}

export const LoginPage = ({ onLogin, onOpenLegal, allowedDomains }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const getDetectedStructure = () => {
    if (!email.includes('@')) return null;
    const domain = email.split('@')[1].toLowerCase();
    return allowedDomains.find(d => d.domain.toLowerCase() === domain);
  };

  const detectedStructure = getDetectedStructure();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    
    // CORRECTION : Vérification que supabase existe
    if (!supabase) {
        setError("Le service d'authentification n'est pas disponible.");
        setLoading(false);
        return;
    }
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      
      if (data.user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('*, structures(name)')
            .eq('id', data.user.id)
            .single();
            
        onLogin({
             id: data.user.id,
             email: data.user.email || '',
             name: profile?.full_name || email.split('@')[0],
             role: profile?.role || 'Conseiller',
             missionLocale: profile?.structures?.name || 'National',
             avatar: (profile?.full_name || 'U').substring(0, 2).toUpperCase(),
             structure_id: profile?.structure_id
        });
      }
    } catch (err: any) { 
        setError("Email ou mot de passe incorrect."); 
    } finally { 
        setLoading(false); 
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detectedStructure || !supabase) return; // Sécurité ajoutée ici aussi
    
    setLoading(true); setError(''); setInfoMessage('');

    try {
      const { error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { 
            data: { 
                full_name: fullName, 
                structure_id: detectedStructure.structure_id 
            } 
        } 
      });
      
      if (signUpError) throw signUpError;
      
      setInfoMessage("Compte créé avec succès ! Veuillez consulter vos emails pour valider votre inscription (vérifiez également vos courriers indésirables).");
      setMode('login');
    } catch (err: any) { 
        setError(err.message); 
    } finally { 
        setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <h1 className="text-2xl font-bold text-[#116862] mb-2 text-center flex justify-center items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-8" />
        </h1>
        <p className="text-center text-slate-500 mb-6 text-sm">IAMESRESSOURCES : plateforme de ressources et prompts</p>
        
        <div className="flex justify-center gap-2 mb-6 bg-slate-100 p-1 rounded-lg">
          <button onClick={() => {setMode('login'); setError('');}} className={`flex-1 text-sm font-semibold px-4 py-2 rounded-md transition-all ${mode === 'login' ? 'bg-white text-[#116862] shadow-sm' : 'text-slate-500'}`}>Connexion</button>
          <button onClick={() => {setMode('register'); setError('');}} className={`flex-1 text-sm font-semibold px-4 py-2 rounded-md transition-all ${mode === 'register' ? 'bg-white text-[#116862] shadow-sm' : 'text-slate-500'}`}>Inscription</button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 flex items-center gap-2"><AlertCircle size={16}/> {error}</div>}
        {infoMessage && <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm mb-4 border border-emerald-100">{infoMessage}</div>}

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
          {mode === 'register' && (
            <div><label className="block text-xs font-bold text-slate-500 mb-1">Nom complet</label><div className="relative"><Users className="absolute left-3 top-2.5 text-slate-400" size={18} /><input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full pl-10 p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#116862]" required placeholder="Prénom Nom" /></div></div>
          )}
          
          <div><label className="block text-xs font-bold text-slate-500 mb-1">Email professionnel</label><div className="relative"><Users className="absolute left-3 top-2.5 text-slate-400" size={18} /><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#116862]" required placeholder="nom@missionlocale.fr" /></div></div>
          
          {mode === 'register' && email.includes('@') && (
              <div className={`text-xs p-2 rounded flex items-center gap-2 ${detectedStructure ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                  <Building2 size={14}/>
                  {detectedStructure ? `Structure détectée : ${detectedStructure.structure_name}` : "Domaine non autorisé."}
              </div>
          )}

          <div><label className="block text-xs font-bold text-slate-500 mb-1">Mot de passe</label><div className="relative"><Lock className="absolute left-3 top-2.5 text-slate-400" size={18} /><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#116862]" required placeholder="••••••••" /></div></div>
          
          <button disabled={loading || (mode === 'register' && !detectedStructure)} className="w-full bg-[#116862] text-white font-bold py-2.5 rounded-lg hover:bg-[#0e524d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-[#116862]/20">
              {loading ? 'Chargement...' : (mode === 'login' ? 'Se connecter' : "S'inscrire")}
          </button>
        </form>
      </div>

        <footer className="mt-8 text-center text-xs text-slate-400 space-y-2">
            <p>© 2026 CBE Sud 94 / Silveria</p>
            <div className="flex justify-center gap-4">
                <button onClick={() => onOpenLegal('mentions')} className="hover:text-[#116862]">Mentions Légales</button>
                <button onClick={() => onOpenLegal('privacy')} className="hover:text-[#116862]">Confidentialité</button>
            </div>
        </footer>
    </div>
  );
};
