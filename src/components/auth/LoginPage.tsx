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

  // Fonction pour trouver la structure basée sur l'email saisi
  const getDetectedStructure = () => {
    if (!email.includes('@')) return null;
    const domain = email.split('@')[1].toLowerCase();
    return allowedDomains.find(d => d.domain.toLowerCase() === domain);
  };

  const detectedStructure = getDetectedStructure();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    
    if (!supabase) {
      // Simulation pour le mode démo (sans backend)
      if (email.includes('@')) onLogin({ id: 999, email, name: 'Utilisateur Démo', role: 'Admin', missionLocale: 'National', avatar: 'AD' });
      else setError("Email invalide.");
      setLoading(false); return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      
      if (data.user) {
        // On récupère le profil complet avec la structure
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
             missionLocale: profile?.structures?.name || 'National', // Nom de la structure
             avatar: (profile?.full_name || 'U').substring(0, 2).toUpperCase(),
             structure_id: profile?.structure_id // ID de la structure (CRUCIAL pour la charte)
        });
      }
    } catch (err: any) { 
        setError("Email ou mot de passe incorrect."); 
        console.error(err);
    } finally { 
        setLoading(false); 
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    
    // Vérification stricte du domaine avant inscription
    if (!detectedStructure) {
        setError(`Le domaine @${email.split('@')[1] || '...'} n'est pas autorisé. Contactez votre administrateur.`);
        setLoading(false);
        return;
    }

    if (!supabase) { 
        onLogin({ id: Date.now(), email, name: fullName, role: 'Conseiller', missionLocale: detectedStructure.structure_name || 'National', avatar: 'UK', structure_id: detectedStructure.structure_id }); 
        return; 
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { 
            // On envoie ces infos, mais c'est le TRIGGER SQL qui fera le vrai travail de liaison
            data: { 
                full_name: fullName, 
                structure_id: detectedStructure.structure_id 
            } 
        } 
      });
      if (signUpError) throw signUpError;
      setInfoMessage("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
      setMode('login'); // Basculer vers la connexion
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
        <p className="text-center text-slate-500 mb-6 text-sm">Plateforme de ressources et prompts</p>
        
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
          
          {/* Feedback visuel de la structure détectée */}
          {mode === 'register' && email.includes('@') && (
              <div className={`text-xs p-2 rounded flex items-center gap-2 ${detectedStructure ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                  <Building2 size={14}/>
                  {detectedStructure 
                    ? `Structure détectée : ${detectedStructure.structure_name || 'Structure identifiée'}` 
                    : "Aucune structure associée à ce domaine d'email."}
              </div>
          )}

          <div><label className="block text-xs font-bold text-slate-500 mb-1">Mot de passe</label><div className="relative"><Lock className="absolute left-3 top-2.5 text-slate-400" size={18} /><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#116862]" required placeholder="••••••••" /></div></div>
          
          <button disabled={loading || (mode === 'register' && !detectedStructure)} className="w-full bg-[#116862] text-white font-bold py-2.5 rounded-lg hover:bg-[#0e524d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-[#116862]/20">
              {loading ? 'Chargement...' : (mode === 'login' ? 'Se connecter' : "S'inscrire")}
          </button>
        </form>
        
        {mode === 'register' && (
            <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs font-bold text-slate-600 flex gap-2 mb-2"><Globe size={14}/> Domaines autorisés existants</p>
            <div className="flex flex-wrap gap-2">
                {allowedDomains.length > 0 ? allowedDomains.map(d => (
                    <span key={d.id} className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">
                        {d.domain}
                    </span>
                )) : <span className="text-[10px] text-slate-400">Aucun domaine configuré</span>}
            </div>
            </div>
        )}
      </div>
      <footer className="mt-8 text-center text-xs text-slate-400 space-y-2"><p>© 2024 Réseau des Missions Locales</p><div className="flex justify-center gap-4"><button onClick={() => onOpenLegal('mentions')} className="hover:text-[#116862]">Mentions Légales</button><button onClick={() => onOpenLegal('privacy')} className="hover:text-[#116862]">Confidentialité</button></div></footer>
    </div>
  );
};
