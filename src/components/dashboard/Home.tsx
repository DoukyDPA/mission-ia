import React from 'react';
import { BookOpen, GitFork, Sparkles, ShieldCheck, Info } from 'lucide-react';

export const Home = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* En-tête de bienvenue */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-3xl font-bold text-slate-800 mb-4 text-[#116862]">Bienvenue sur Mission IA</h2>
        <p className="text-slate-600 leading-relaxed text-lg">
          Cette plateforme est votre espace collaboratif dédié à l'intelligence artificielle au sein des Missions Locales. 
          Elle a pour but d'harmoniser nos pratiques et de faciliter votre quotidien auprès des jeunes.
        </p>
      </div>

      {/* Grille des fonctionnalités */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-[#116862]/30 transition-colors">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
            <GitFork size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2 text-slate-800">Promptothèque</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Accédez à une bibliothèque de requêtes (prompts) pré-rédigées et testées pour les métiers de l'accompagnement. 
            Copiez-les en un clic pour gagner du temps dans vos tâches administratives ou pédagogiques.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-[#116862]/30 transition-colors">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
            <Sparkles size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2 text-slate-800">Labo Prompts</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Utilisez l'assistant intelligent pour créer ou améliorer vos propres instructions. 
            C'est l'endroit idéal pour transformer une idée simple en un prompt complexe et efficace.
          </p>
        </div>
      </div>

      {/* Rappel de sécurité */}
      <div className="bg-[#116862]/5 border border-[#116862]/20 p-6 rounded-xl flex gap-4">
        <div className="text-[#116862] shrink-0">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h3 className="font-bold text-[#116862] mb-1">Sécurité et RGPD</h3>
          <p className="text-sm text-[#116862]/80 leading-relaxed">
            <strong>Règle d'or :</strong> Ne saisissez jamais de données nominatives (noms, téléphones, adresses) 
            concernant les jeunes dans les outils d'IA. Pour les CV, utilisez systématiquement notre 
            <strong> anonymiseur</strong> disponible dans le menu latéral.
          </p>
        </div>
      </div>

      {/* Aide supplémentaire */}
      <div className="bg-slate-100 p-6 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-full text-slate-500">
            <Info size={20} />
          </div>
          <p className="text-sm font-medium text-slate-600">Besoin d'aide pour débuter ? Consultez la section Ressources.</p>
        </div>
        <button className="text-sm font-bold text-[#116862] hover:underline">Voir les guides</button>
      </div>
    </div>
  );
};
