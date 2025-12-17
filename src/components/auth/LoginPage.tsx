// src/components/auth/LoginPage.tsx
import React, { useState } from 'react';
import { Users, Lock, Globe } from 'lucide-react';
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

  const findAllowedDomain = (targetEmail: string) => {
    const normalized = targetEmail.toLowerCase();
    return allowedDomains.find(d => normalized.endsWith(d.domain.toLowerCase()));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    
    if (!supabase) {
      if (email.includes('@')) onLogin({ id: 999, email, name: 'Utilisateur Démo', role: 'Admin', missionLocale: 'National', avatar: 'AD' });
      else setError("Email invalide.");
      setLoading(false); return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('*, structures(name)').eq('id', data.user.id).single();
        onLogin({
             id: data.user.id, email: data.user.email || '',
             name: profile?.full_name || email.split('@')[0],
             role: profile?.role || 'Conseiller',
             missionLocale: profile?.structures?.name || 'National',
             avatar: (profile?.full_name || 'U').substring(0, 2).toUpperCase()
        });
      }
    } catch (err: any) { setError(err.message || "Erreur de connexion"); } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    
    const matchingDomain = findAllowedDomain(email);
    if (!matchingDomain) { setError("Email non autorisé."); setLoading(false); return; }

    if (!supabase) { onLogin({ id: Date.now(), email, name: fullName, role: 'Conseiller', missionLocale: matchingDomain.structure_name || 'National', avatar: 'UK' }); return; }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ 
        email, password,
        options: { emailRedirectTo: window.location.origin, data: { full_name: fullName, structure_id: matchingDomain.structure_id || null } } 
      });
      if (signUpError) throw signUpError;
      setInfoMessage("Compte créé ! Vérifiez vos emails.");
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">IAMESRESSOURCES</h1>
        <p className="text-center text-slate-500 mb-3 text-sm">Connectez-vous pour accéder aux ressources</p>
        
        <div className="flex justify-center gap-2 mb-4">
          <button onClick={() => setMode('login')} className={`text-sm font-semibold px-3 py-1 rounded ${mode === 'login' ? 'bg-[#116862] text-white' : 'text-slate-500'}`}>Connexion</button>
          <button onClick={() => setMode('register')} className={`text-sm font-semibold px-3 py-1 rounded ${mode === 'register' ? 'bg-[#116862] text-white' : 'text-slate-500'}`}>Créer un compte</button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4">{error}</div>}
        {infoMessage && <div className="bg-emerald-50 text-emerald-700 p-3 rounded text-sm mb-4">{infoMessage}</div>}

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
          {mode === 'register' && (
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label><div className="relative"><Users className="absolute left-3 top-2.5 text-slate-400" size={18} /><input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full pl-10 p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#116862]" required /></div></div>
          )}
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><div className="relative"><Users className="absolute left-3 top-2.5 text-slate-400" size={18} /><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#116862]" required /></div></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label><div className="relative"><Lock className="absolute left-3 top-2.5 text-slate-400" size={18} /><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#116862]" required /></div></div>
          <button disabled={loading} className="w-full bg-[#116862] text-white font-bold py-2.5 rounded-lg hover:bg-[#0e524d] disabled:opacity-50">{loading ? 'Chargement...' : (mode === 'login' ? 'Se connecter' : "S'inscrire")}</button>
        </form>
        
        <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-100">
           <p className="text-xs font-bold text-slate-600 flex gap-2 mb-1"><Globe size={14}/> Domaines autorisés</p>
           <ul className="text-[10px] text-slate-500 list-disc list-inside">{allowedDomains.length > 0 ? allowedDomains.map(d => <li key={d.id}>{d.domain} ({d.structure_name || 'Global'})</li>) : <li>Aucun domaine configuré</li>}</ul>
        </div>
      </div>
      <footer className="mt-8 text-center text-xs text-slate-400 space-y-2"><p>© 2024 Réseau des Missions Locales</p><div className="flex justify-center gap-4"><button onClick={() => onOpenLegal('mentions')} className="hover:text-[#116862]">Mentions Légales</button><button onClick={() => onOpenLegal('privacy')} className="hover:text-[#116862]">Confidentialité</button></div></footer>
    </div>
  );
};
