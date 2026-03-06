// src/components/dashboard/PromptAssistant.tsx
import React, { useState } from 'react';
import { Sparkles, Copy, Loader2, Image as ImageIcon, FileText } from 'lucide-react';

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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Le Laboratoire de Prompts</h2>
          <p className="text-slate-500 text-sm mt-1">
            Rédigez votre idée simplement, l'IA vous aide à la transformer en un prompt expert.
          </p>
        </div>
      </div>

      {/* Sélecteur de mode */}
      <div className="flex bg-slate-100 p-1 rounded-lg w-fit mb-6">
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

      {/* Zone Pédagogique Côte à Côte */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Côté Humain */}
        <div className="flex flex-col h-full">
          <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            1. Mon intention brute
          </label>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col">
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
                <div className="text-sm text-slate-700 whitespace-pre-wrap flex-1 mb-10">
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
    </div>
  );
};
