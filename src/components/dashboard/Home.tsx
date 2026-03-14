import React from 'react';
import { GitFork, Sparkles, ShieldCheck, Radio, BookOpen, MessageSquare, Lightbulb, CheckCircle, ArrowRight } from 'lucide-react';

interface HomeProps {
  onNavigate: (tab: string) => void;
}

export const Home = ({ onNavigate }: HomeProps) => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* BANNIÈRE HERO - Inspirante et accueillante */}
      <div className="bg-gradient-to-br from-[#116862] to-[#0a4540] rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold mb-6 tracking-wide">
            NOUVELLE PLATEFORME
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight leading-tight">
            L'IA au service de <br/>votre quotidien
          </h1>
          <p className="text-lg md:text-xl text-teal-50 leading-relaxed mb-8 max-w-2xl">
            Bienvenue sur <strong>IAMESRESSOURCES</strong>. Explorez, testez et partagez des pratiques innovantes pour libérer du temps administratif et vous recentrer sur l'essentiel : l'humain.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => onNavigate('prompts')} 
              className="bg-white text-[#116862] px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-teal-50 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              Découvrir la Promptothèque <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => onNavigate('forum')} 
              className="bg-[#116862] border-2 border-white/30 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center gap-2"
            >
              Poser une question
            </button>
          </div>
        </div>
        {/* Décoration d'arrière-plan */}
        <Sparkles className="absolute right-[-20px] bottom-[-20px] text-white/5" size={250} />
      </div>

      {/* GRILLE DES MODULES - Navigation visuelle rapide */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div onClick={() => onNavigate('prompts')} className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-[#116862]/30 hover:shadow-md transition-all cursor-pointer">

          <h3 className="font-bold text-lg mb-2 text-slate-800 group-hover:text-[#116862] transition-colors">1. S'inspirer</h3>
          <p className="text-sm text-slate-500 leading-relaxed">Gagnez du temps avec nos modèles de prompts (synthèses, courriers, analyses) prêts à l'emploi.</p>
        </div>

        <div onClick={() => onNavigate('assistant')} className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-[#116862]/30 hover:shadow-md transition-all cursor-pointer">
          <h3 className="font-bold text-lg mb-2 text-slate-800 group-hover:text-[#116862] transition-colors">2. Expérimenter</h3>
          <p className="text-sm text-slate-500 leading-relaxed">Utilisez notre Labo pour créer et affiner vos propres instructions avec l'aide d'un assistant.</p>
        </div>

        <div onClick={() => onNavigate('forum')} className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-[#116862]/30 hover:shadow-md transition-all cursor-pointer">
          <h3 className="font-bold text-lg mb-2 text-slate-800 group-hover:text-[#116862] transition-colors">3. Échanger</h3>
          <p className="text-sm text-slate-500 leading-relaxed">Posez vos questions sur le forum de votre structure et apprenez des réussites de vos collègues.</p>
        </div>

        <div onClick={() => onNavigate('resources')} className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-[#116862]/30 hover:shadow-md transition-all cursor-pointer">
          <h3 className="font-bold text-lg mb-2 text-slate-800 group-hover:text-[#116862] transition-colors">4. S'informer et se former</h3>
          <p className="text-sm text-slate-500 leading-relaxed">Accédez à notre veille stratégique et nos tutoriels pour rester à la pointe des innovations RH.</p>
        </div>

      </div>

      {/* SECTION PÉDAGOGIE ET SÉCURITÉ */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Les bonnes pratiques */}
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

        {/* Alerte Sécurité */}
        <div className="bg-red-50 rounded-3xl p-8 border border-red-100 shadow-sm flex flex-col justify-center relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
           <ShieldCheck className="text-red-500 mb-6" size={48} />
           <h3 className="text-xl font-bold text-red-900 mb-3">Secret Professionnel & RGPD</h3>
           <p className="text-sm text-red-800/90 leading-relaxed mb-6">
             Ne saisissez <strong>absolument jamais</strong> de données nominatives dans une IA (nom, téléphone, adresse, numéro de sécu d'un candidat).
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
