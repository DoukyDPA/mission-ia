"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User, AllowedDomain } from '@/types';
import { LoginPage } from '@/components/auth/LoginPage';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Modal } from '@/components/ui/Modal';
import { Loader2 } from 'lucide-react'; // Icône de chargement

// Mock domains si pas de DB
const MOCK_DOMAINS = [{ id: '1', domain: 'missionlocale.fr', structure_id: 1, structure_name: 'ML Lyon' }];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true); // Nouvel état pour le chargement
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalType, setLegalType] = useState<'mentions' | 'privacy'>('mentions');
  const [allowedDomains, setAllowedDomains] = useState<AllowedDomain[]>([]);

  // 1. Chargement des domaines autorisés
  const loadAllowedDomains = useCallback(async () => {
      if (!supabase) { setAllowedDomains(MOCK_DOMAINS); return; }
      try {
          const { data } = await supabase.from('allowed_domains').select('*, structures(name)');
          if (data) setAllowedDomains(data.map((d: any) => ({
              id: d.id, domain: d.domain, structure_id: d.structure_id, structure_name: d.structures?.name
          })));
      } catch (err) { console.error('Erreur domaines:', err); }
  }, []);

  // 2. VÉRIFICATION DE LA SESSION AU DÉMARRAGE (La partie qui manquait)
  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) {
        setIsLoadingSession(false);
        return;
      }

      // On récupère la session stockée dans le navigateur
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Si une session existe, on récupère le profil complet depuis la DB
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*, structures(name)')
                .eq('id', session.user.id)
                .single();
            
            // On rétablit l'utilisateur connecté
            setCurrentUser({
                id: session.user.id,
                email: session.user.email || '',
                name: profile?.full_name || session.user.email?.split('@')[0] || 'Utilisateur',
                role: profile?.role || 'Conseiller',
                missionLocale: profile?.structures?.name || 'National',
                avatar: (profile?.full_name || 'U').substring(0, 2).toUpperCase(),
                structure_id: profile?.structure_id
            });
        } catch (e) {
            console.error("Erreur récupération profil", e);
        }
      }
      
      // On arrête l'écran de chargement
      setIsLoadingSession(false);
    };

    checkSession();
    loadAllowedDomains();

    // Écouteur : si l'utilisateur se déconnecte depuis un autre onglet ou expire
    const { data: authListener } = supabase?.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
        }
    });

    return () => {
        authListener?.subscription.unsubscribe();
    };
  }, [loadAllowedDomains]);

  const openLegal = (type: 'mentions' | 'privacy') => { setLegalType(type); setIsLegalOpen(true); }

  // 3. Écran de chargement pendant qu'on vérifie la session
  if (isLoadingSession) {
      return (
          <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 gap-3">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
              <p className="text-sm font-medium">Chargement de votre session...</p>
          </div>
      );
  }

  return (
    <>
        {!currentUser ? (
            <LoginPage 
                onLogin={setCurrentUser} 
                onOpenLegal={openLegal} 
                allowedDomains={allowedDomains} 
            />
        ) : (
            <Dashboard 
                user={currentUser} 
                // Pour la déconnexion, on appelle aussi Supabase
                onLogout={async () => {
                    await supabase?.auth.signOut();
                    setCurrentUser(null);
                }} 
                onOpenLegal={openLegal}
                allowedDomains={allowedDomains}
                onAllowedDomainsChange={setAllowedDomains}
            />
        )}

        <Modal isOpen={isLegalOpen} onClose={() => setIsLegalOpen(false)} title={legalType === 'mentions' ? "Mentions Légales" : "Confidentialité"}>
            <div className="prose prose-sm text-slate-600">
                {legalType === 'mentions' ? (
                    <div className="space-y-3">
                        <p><strong>Éditeur :</strong> IAMESRESSOURCES</p>
                        <p><strong>Hébergement :</strong> Vercel Inc.</p>
                        <p>Plateforme pour les Missions Locales.</p>
                    </div>
                ) : (
                    <p>Vos données sont utilisées uniquement pour le fonctionnement du service.</p>
                )}
            </div>
        </Modal>
    </>
  );
}
