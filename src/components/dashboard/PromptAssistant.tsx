// src/components/dashboard/PromptAssistant.tsx
import React, { useState } from 'react';
import { Sparkles, Copy, Loader2, Image as ImageIcon, FileText, Info } from 'lucide-react';

export const PromptAssistant = () => {
  const [promptType, setPromptType] = useState<'text' | 'image'>('text');
  const [humanIntention, setHumanIntention] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = async () => {
    if (!humanIntention.trim()) return;
    
    setIsOptimizing(true);
    setOptimizedPrompt('');

    try {
      const response = await fetch('/api/optimize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intention: humanIntention, type: promptType }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setOptimizedPrompt(data.optimizedPrompt);
    } catch (error) {
      alert("Erreur lors de l'optimisation. Vérifiez la connexion ou la clé API.");
      console.error(error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(optimizedPrompt);
    alert('Prompt optimisé copié !');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Sélecteur de mode */}
      <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
        <button 
          onClick={() => setPromptType('text')}
          className={`flex items-center gap-2 px-6 py-2 text-sm font-bold rounded-md transition-all ${promptType === 'text' ? 'bg-white shadow text-[#116862]' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <FileText size={16} /> Générer du Texte
        </button>
        <button 
          onClick={() => setPromptType('image')}
          className={`flex items-center gap-2 px-6 py-2 text-sm font-bold rounded-md transition-all ${promptType === 'image' ? 'bg-white shadow text-[#116862]' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <ImageIcon size={16} /> Générer une Image
        </button>
      </div>

      {/* --- RAPPEL PÉDAGOGIQUE DES RÈGLES --- */}
      <div className="bg-[#116862]/10 border border-[#116862]/20 rounded-xl p-5 flex gap-4 text-slate-700 text-sm">
        <Info className="text-[#116862] shrink-0 mt-0.5" size={24} />
        <div>
          <h3 className="font-bold text-[#116862] text-base mb-2">
            {promptType === 'text' ? "Rappel : Les 5 clés d'un bon prompt texte" : "Rappel : Les clés d'un bon prompt image"}
          </h3>
          {promptType === 'text' ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 list-disc pl-4">
              <li><strong>Rôle :</strong> Donne un rôle à l'IA (Ex: "Tu es...")</li>
              <li><strong>Contexte :</strong> Précise la situation (Ex: "Je cherche à...")</li>
              <li><strong>Mission :</strong> Détaille la tâche (Ex: "Ta tâche est de...")</li>
              <li><strong>Forme :</strong> Spécifie le format (Ex: "Sous forme de tableau...")</li>
              <li><strong>Dialogue :</strong> Encourage l'échange (Ex: "Pose-moi des questions...")</li>
            </ul>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 list-disc pl-4">
              <li><strong>Composition :</strong> Décrivez la scène et le contexte</li>
              <li><strong>Sujet :</strong> Rôle du sujet ou des personnages</li>
              <li><strong>Style :</strong> Intention (photo réaliste, peinture, 3D...)</li>
              <li><strong>Ambiance :</strong> Scénographie, lumière et couleurs</li>
              <li><strong>Limites :</strong> Ce qu'il ne faut PAS faire (ex: pas de texte)</li>
            </ul>
          )}
        </div>
      </div>

      {/* --- ZONE CÔTE À CÔTE --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Côté Humain */}
        <div className="flex flex-col h-full">
          <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            1. Mon intention brute
          </label>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-[300px]">
            <textarea 
              className="w-full flex-1 resize-none outline-none text-slate-700"
              placeholder={promptType === 'text' 
                ? "Ex: Fais-moi une lettre de motivation pour un stage en communication..." 
                : "Ex: Un perroquet vert qui donne un cours dans une école d'animaux..."}
              value={humanIntention}
              onChange={(e) => setHumanIntention(e.target.value)}
            />
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={handleOptimize}
                disabled={isOptimizing || !humanIntention.trim()}
                className="bg-[#116862] text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#0e524d] disabled:opacity-50 transition-all"
              >
                {isOptimizing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isOptimizing ? 'Optimisation en cours...' : 'Optimiser avec Mistral'}
              </button>
            </div>
          </div>
        </div>

        {/* Côté IA (Résultat) */}
        <div className="flex flex-col h-full">
          <label className="text-sm font-bold text-[#116862] mb-2 flex items-center gap-2">
            <Sparkles size={16} /> 2. Le prompt optimisé
          </label>
          <div className="bg-slate-50 p-4 rounded-xl border-2 border-dashed border-[#116862]/30 flex-1 relative flex flex-col min-h-[300px]">
            {optimizedPrompt ? (
              <>
                <div className="text-sm text-slate-700 whitespace-pre-wrap flex-1 mb-10 overflow-y-auto">
                  {optimizedPrompt}
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="absolute bottom-4 right-4 bg-white border shadow-sm text-slate-600 px-3 py-1.5 rounded flex items-center gap-2 text-xs font-bold hover:text-[#116862] transition-colors"
                >
                  <Copy size={14} /> Copier le prompt
                </button>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center px-8">
                <Sparkles size={40} className="mb-3 opacity-20" />
                <p className="text-sm">
                  {promptType === 'text' 
                    ? "L'IA structurera votre demande avec un Rôle, un Contexte, une Tâche, un Format et des Instructions d'interaction."
                    : "L'IA ajoutera le style, la lumière, la composition et les détails pour guider le générateur d'images."}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* --- PHRASE D'ENCOURAGEMENT (Nouvel ajout) --- */}
      <div className="text-center text-sm text-slate-500 italic mt-6">
        N'hésitez pas à tester le prompt optimisé et à y ajouter votre propre "patte" pour que la réponse réponde parfaitement à votre attente.
      </div>
      
    </div>
  );
};
