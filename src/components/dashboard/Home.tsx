import React from 'react';
import { GitFork, Sparkles, ShieldCheck, Radio, BookOpen } from 'lucide-react';

interface HomeProps {
  onNavigate: (tab: string) => void;
}

export const Home = ({ onNavigate }: HomeProps) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-3xl font-bold text-slate-800 mb-4 text-[#116862]">Bienvenue sur IAMESRESSOURCES</h2>
        <p className="text-slate-600 leading-relaxed text-lg">
          Votre espace collaboratif dédié à l'intelligence artificielle pour les structures d'accompagnement vers l'emploi. 
          Cette plateforme centralise les outils et les connaissances pour transformer l'innovation en leviers d'insertion professionnelle.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-[#116862]/30 transition-colors">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
            <GitFork size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2 text-slate-800">Promptothèque</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Accédez à une bibliothèque de requêtes (prompts) pré-rédigées et optimisées pour les conseillers emploi. 
            Gagnez du temps dans la rédaction de synthèses, d'analyses de CV ou de courriers administratifs.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-[#116862]/30 transition-colors">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-4">
            <Radio size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2 text-slate-800">Veille Stratégique</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Restez à la pointe des évolutions de l'IA et du marché du travail. 
            Consultez régulièrement nos analyses pour adapter vos méthodes d'accompagnement aux transformations numériques.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-[#116862]/30 transition-colors">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
            <Sparkles size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2 text-slate-800">Labo Prompts</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Expérimentez et créez vos propres instructions avec notre assistant intelligent. 
            Améliorez vos requêtes existantes pour obtenir des résultats plus précis.
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-200 flex flex-col justify-center">
            <h3 className="font-bold text-lg mb-2 text-slate-800">Besoin d'aide ?</h3>
            <p className="text-sm text-slate-500 mb-4">Découvrez comment tirer le meilleur parti de l'IA dans votre structure.</p>
            {/* BOUTON CORRIGÉ ICI */}
            <button 
              onClick={() => onNavigate('resources')} 
              className="text-[#116862] font-bold text-sm hover:underline text-left flex items-center gap-2"
            >
                <BookOpen size={16} /> Consulter les ressources →
            </button>
        </div>
      </div>

      <div className="bg-[#116862]/5 border border-[#116862]/20 p-6 rounded-xl flex gap-4">
        <div className="text-[#116862] shrink-0">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h3 className="font-bold text-[#116862] mb-1">Sécurité & Confidentialité</h3>
          {/* TEXTE CORRIGÉ AVEC BALISES STRONG ICI */}
          <p className="text-sm text-[#116862]/80 leading-relaxed">
            <strong>Important :</strong> Ne saisissez aucune donnée nominative sur les candidats. 
            Utilisez systématiquement l'<strong>anonymiseur</strong> disponible dans le menu latéral avant tout traitement de document par une IA.
          </p>
        </div>
      </div>
    </div>
  );
};
