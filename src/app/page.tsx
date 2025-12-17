"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User, AllowedDomain } from '@/types';
import { LoginPage } from '@/components/auth/LoginPage';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Modal } from '@/components/ui/Modal';

// Mock domains si pas de DB
const MOCK_DOMAINS = [{ id: '1', domain: 'missionlocale.fr', structure_id: 1, structure_name: 'ML Lyon' }];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalType, setLegalType] = useState<'mentions' | 'privacy'>('mentions');
  const [allowedDomains, setAllowedDomains] = useState<AllowedDomain[]>([]);

  const loadAllowedDomains = useCallback(async () => {
      if (!supabase) { setAllowedDomains(MOCK_DOMAINS); return; }
      try {
          const { data } = await supabase.from('allowed_domains').select('*, structures(name)');
          if (data) setAllowedDomains(data.map((d: any) => ({
              id: d.id, domain: d.domain, structure_id: d.structure_id, structure_name: d.structures?.name
          })));
      } catch (err) { console.error('Erreur domaines:', err); }
  }, []);

  useEffect(() => { loadAllowedDomains(); }, [loadAllowedDomains]);

  const openLegal = (type: 'mentions' | 'privacy') => { setLegalType(type); setIsLegalOpen(true); }

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
                onLogout={() => setCurrentUser(null)} 
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
