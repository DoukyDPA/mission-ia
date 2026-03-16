// src/components/auth/LoginPage.tsx
import React, { useState } from 'react';
import { Users, Lock, Building2, AlertCircle, ArrowLeft } from 'lucide-react';
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
  // Ajout du mode 'forgot' pour le mot de passe oublié
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
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
    setLoading(true); setError(''); setInfoMessage('');
    
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
             missionLocale: profile?.structures?.name || 'Visiteur / Test',
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
    if (!supabase) return; 
    
    setLoading(true); setError(''); setInfoMessage('');

    try {
      const { error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { 
            data: { 
                full_name: fullName, 
                // S'il n'y a pas de structure, on envoie null (mode découverte)
                structure_id: detectedStructure ? detectedStructure.structure_id : null 
            } 
        } 
      });
      
      if (signUpError) throw signUpError;
      
      setInfoMessage("Compte créé avec succès ! Veuillez consulter vos emails pour valider votre inscription (vérifiez également vos courriers indésirables).");
      setMode('login');
    } catch (err: any) { 
        setError("Erreur lors de l'inscription : " + err.message); 
    } finally { 
        setLoading(false); 
    }
  };

  // NOUVELLE FONCTION : Réinitialisation du mot de passe
  const handleResetPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!supabase) return;

      setLoading(true); setError(''); setInfoMessage('');

      try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
              // Redirige vers l'accueil de l'app (Supabase gérera le token dans l'URL)
              redirectTo: `${window.location.origin}/`, 
          });
          if (error) throw error;
          
          setInfoMessage("Si cette adresse correspond à un compte existant, un lien de réinitialisation vous a été envoyé.");
          setMode('login');
      } catch (err: any) {
          setError("Erreur : " + err.message);
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
        
        {/* On masque les boutons de navigation si on est sur la vue 'mot de passe oublié' */}
        {mode !== 'forgot' && (
            <div className="flex justify-center gap-2 mb-6 bg-slate-100 p-1 rounded-lg">
              <button onClick={() => {setMode('login'); setError(''); setInfoMessage('');}} className={`flex-1 text-sm font-semibold px-4 py-2 rounded-md transition-all ${mode === 'login' ? 'bg-white text-[#116862] shadow-sm' : 'text-slate-500'}`}>Connexion</button>
              <button onClick={() => {setMode('register'); setError(''); setInfoMessage('');}} className={`flex-1 text-sm font-semibold px-4 py-2 rounded-md transition-all ${mode === 'register' ? 'bg-white text-[#116862] shadow-sm' : 'text-slate-500'}`}>Inscription</button>
            </div>
        )}

        {mode === 'forgot' && (
            <div className="mb-6">
                <button onClick={() => {setMode('login'); setError(''); setInfoMessage('');}} className="text-sm font-semibold text-slate-500 hover:text-[#116862] flex items-center gap-1 mb-4 transition-colors">
                    <ArrowLeft size={16} /> Retour à la connexion
                </button>
                <h2 className="font-bold text-slate-800">Mot de passe oublié ?</h2>
                <p className="text-xs text-slate-500 mt-1">Saisissez votre email professionnel pour recevoir un lien de réinitialisation.</p>
            </div>
        )}

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 flex items-center gap-2"><AlertCircle size={16}/> {error}</div>}
        {infoMessage && <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm mb-4 border border-emerald-100">{infoMessage}</div>}

        <form onSubmit={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleResetPassword} className="space-y-4">
          
          {mode === 'register' && (
            <div><label className="block text-xs font-bold text-slate-500 mb-1">Nom complet</label><div className="relative"><Users className="absolute left-3 top-2.5 text-slate-400" size={18} /><input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full pl-10 p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#116862]" required placeholder="Prénom Nom" /></div></div>
          )}
          
          <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Email professionnel</label>
              <div className="relative">
                  <Users className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#116862]" required placeholder="nom@missionlocale.fr" />
              </div>
          </div>
          
          {/* Affichage des domaines revu pour inclure le mode découverte */}
          {mode === 'register' && email.includes('@') && (
              <div className={`text-xs p-2.5 rounded flex items-center gap-2 ${detectedStructure ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-sky-700 bg-sky-50 border border-sky-100'}`}>
                  <Building2 size={14}/>
                  {detectedStructure ? (
                      <span><strong>Structure identifiée :</strong> {detectedStructure.structure_name}</span>
                  ) : (
                      <span><strong>Mode Découverte :</strong> Domaine non affilié. Accès limité aux fonctionnalités publiques.</span>
                  )}
              </div>
          )}

          {mode !== 'forgot' && (
              <div>
                  <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-500">Mot de passe</label>
                      {mode === 'login' && (
                          <button type="button" onClick={() => {setMode('forgot'); setError(''); setInfoMessage('');}} className="text-[10px] font-bold text-[#116862] hover:underline">
                              Oublié ?
                          </button>
                      )}
                  </div>
                  <div className="relative">
                      <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#116862]" required placeholder="••••••••" />
                  </div>
              </div>
          )}
          
          <button disabled={loading} className="w-full bg-[#116862] text-white font-bold py-2.5 rounded-lg hover:bg-[#0e524d] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md mt-2">
              {loading ? 'Veuillez patienter...' : 
               mode === 'login' ? 'Se connecter' : 
               mode === 'register' ? "S'inscrire" : 
               "Envoyer le lien"}
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
