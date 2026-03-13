import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

const MOCK_FAQ = [
  { id: 1, category: "Utilisation de l'IA", question: "Quelles données puis-je partager avec l'IA ?", answer: "Vous ne devez partager aucune donnée nominative (nom, prénom, adresse, téléphone, numéro de sécu). Utilisez l'anonymiseur avant de soumettre un CV." },
  { id: 2, category: "Promptothèque", question: "Comment proposer un nouveau prompt ?", answer: "Allez dans l'onglet 'Promptothèque', cliquez sur 'Ajouter' en haut à droite, remplissez le formulaire et enregistrez." },
  { id: 3, category: "Technique", question: "Mon mot de passe ne fonctionne plus, que faire ?", answer: "Veuillez contacter l'administrateur de votre structure pour qu'il réinitialise vos accès." }
];

export const FAQ = ({ isAdmin }: { isAdmin: boolean }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openId, setOpenId] = useState<number | string | null>(null);

  const filteredFaq = MOCK_FAQ.filter(item => 
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher une réponse..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#116862] outline-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredFaq.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden transition-all">
            <button 
              onClick={() => setOpenId(openId === item.id ? null : item.id)}
              className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-slate-50 text-left font-semibold text-slate-800"
            >
              <span>{item.question}</span>
              {openId === item.id ? <ChevronUp size={20} className="text-[#116862]" /> : <ChevronDown size={20} className="text-slate-400" />}
            </button>
            
            {openId === item.id && (
              <div className="px-6 pb-4 pt-2 text-slate-600 bg-slate-50 border-t border-slate-100 leading-relaxed text-sm">
                {item.answer}
              </div>
            )}
          </div>
        ))}
        {filteredFaq.length === 0 && (
          <div className="text-center py-12 text-slate-500">Aucune réponse trouvée pour "{searchTerm}"</div>
        )}
      </div>
    </div>
  );
};
