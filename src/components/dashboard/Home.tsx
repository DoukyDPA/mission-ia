// src/components/dashboard/Home.tsx
import React from 'react';
import { Sparkles, ShieldCheck, Lightbulb, CheckCircle, ArrowRight, Radio, BookOpen, GitFork } from 'lucide-react';
import { Resource } from '@/types';
import { ResourceHero } from './ResourceRail';

interface HomeProps {
  onNavigate: (tab: string) => void;
  /** Ressources déjà triées par date décroissante. */
  resources?: Resource[];
  onViewResource?: (r: Resource) => void;
}

const MODULES = [
  { tab: 'resources', titre: "S'informer", texte: "La veille IA, les tutoriels et les documents de référence, mis à jour en continu." },
  { tab: 'prompts',   titre: "S'inspirer",  texte: "Des modèles de prompts prêts à l'emploi : synthèses, courriers, analyses." },
  { tab: 'assistant', titre: 'Expérimenter', texte: "Le Labo, pour créer et affiner vos propres instructions avec un assistant." },
  { tab: 'forum',     titre: 'Échanger',    texte: "Le forum de votre structure, pour poser vos questions et partager vos réussites." },
];

export const Home = ({ onNavigate, resources = [], onViewResource }: HomeProps) => {
  const aLaUne = resources.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-12">

      {/* BANNIÈRE HERO */}
      <div className="bg-gradient-to-br from-[#116862] to-[#0a4540] rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold mb-5 tracking-wide">
            VEILLE ET RESSOURCES IA
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight leading-tight">
            L'IA au service de <br />votre quotidien
          </h1>
          <p className="text-base md:text-lg text-teal-50 leading-relaxed mb-7 max-w-2xl">
            Bienvenue sur <strong>IAMESRESSOURCES</strong>. Suivez l'actualité de l'IA dans l'emploi et la formation,
            testez des pratiques, partagez ce qui marche.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('resources')}
              className="bg-white text-[#116862] px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-teal-50 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              Voir toute la veille <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onNavigate('prompts')}
              className="bg-[#116862] border-2 border-white/30 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <GitFork size={18} /> La Promptothèque
            </button>
          </div>
        </div>
        <Sparkles className="absolute right-[-20px] bottom-[-20px] text-white/5" size={220} />
      </div>

      {/* À LA UNE : les dernières publications de la veille */}
      {aLaUne.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-5 border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Radio className="text-[#116862]" size={22} /> À la une
            </h2>
            <button
              onClick={() => onNavigate('resources')}
              className="text-sm font-bold text-[#116862] hover:underline flex items-center gap-1 shrink-0"
            >
              Toute la veille <ArrowRight size={15} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aLaUne.map(r => (
              <ResourceHero
                key={r.id}
                resource={r}
                onView={(res) => onViewResource ? onViewResource(res) : onNavigate('resources')}
              />
            ))}
          </div>
        </section>
      )}

      {aLaUne.length === 0 && (
        <section className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <BookOpen className="mx-auto text-slate-300 mb-3" size={36} />
          <p className="text-slate-500 font-medium">Aucune publication pour le moment.</p>
          <button onClick={() => onNavigate('resources')} className="mt-3 text-sm font-bold text-[#116862] hover:underline">
            Ouvrir la veille
          </button>
        </section>
      )}

      {/* GRILLE DES MODULES */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {MODULES.map((m, i) => (
          <button
            key={m.tab}
            onClick={() => onNavigate(m.tab)}
            className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-[#116862]/30 hover:shadow-md transition-all text-left"
          >
            <span className="text-[11px] font-bold text-slate-300 group-hover:text-[#116862]/50 transition-colors">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="font-bold text-lg mb-2 text-slate-800 group-hover:text-[#116862] transition-colors">{m.titre}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{m.texte}</p>
          </button>
        ))}
      </div>

      {/* PÉDAGOGIE ET SÉCURITÉ */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <Lightbulb className="text-amber-500" size={28} />
            Les 3 règles d'or de l'IA
          </h3>
          <div className="space-y-5">
            <div className="flex gap-4 items-start">
              <div className="mt-1"><CheckCircle className="text-[#116862]" size={20} /></div>
              <div>
                <h4 className="font-bold text-slate-700">Vous restez le pilote</h4>
                <p className="text-sm text-slate-500 mt-1">L'IA est un excellent assistant rédactionnel, mais elle n'a ni votre empathie, ni votre expertise métier. Gardez toujours votre esprit critique.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="mt-1"><CheckCircle className="text-[#116862]" size={20} /></div>
              <div>
                <h4 className="font-bold text-slate-700">Vérifiez systématiquement les informations</h4>
                <p className="text-sm text-slate-500 mt-1">L'IA peut parfois inventer des réponses (hallucinations) ou s'appuyer sur des dispositifs obsolètes. Relisez toujours avant de valider.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="mt-1"><CheckCircle className="text-[#116862]" size={20} /></div>
              <div>
                <h4 className="font-bold text-slate-700">Privilégiez le contexte</h4>
                <p className="text-sm text-slate-500 mt-1">Plus vous donnez de contexte à l'IA (le rôle qu'elle doit jouer, le ton attendu, le format de sortie), plus la réponse sera pertinente.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-3xl p-8 border border-red-100 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
          <ShieldCheck className="text-red-500 mb-6" size={48} />
          <h3 className="text-xl font-bold text-red-900 mb-3">Secret professionnel et RGPD</h3>
          <p className="text-sm text-red-800/90 leading-relaxed mb-6">
            Ne saisissez <strong>absolument jamais</strong> de données nominatives dans une IA (nom, téléphone, adresse, numéro de sécurité sociale d'un candidat).
          </p>
          <a
            href="https://solutions.silveria.fr/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-red-700 text-sm font-bold py-3 px-4 rounded-xl text-center shadow-sm hover:shadow-md transition-all border border-red-100"
          >
            Utiliser l'Anonymiseur de CV
          </a>
        </div>
      </div>
    </div>
  );
};
