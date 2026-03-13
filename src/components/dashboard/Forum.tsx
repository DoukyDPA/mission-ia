import React, { useState } from 'react';
import { MessageSquare, Clock, Plus } from 'lucide-react';
import { User } from '@/types';

// Mock data pour la démonstration
const MOCK_POSTS = [
  { id: 1, title: "Aide pour formuler un prompt de synthèse d'entretien", content: "Bonjour, je n'arrive pas à obtenir un résumé correct...", author_name: "Julie", author_avatar: "JU", structure_id: 1, created_at: "Il y a 2 heures", replies_count: 3 },
  { id: 2, title: "Outil de traduction de CV", content: "Quelqu'un a-t-il un prompt efficace pour traduire un CV de l'espagnol au français ?", author_name: "Marc", author_avatar: "MA", structure_id: 1, created_at: "Hier", replies_count: 0 }
];

export const Forum = ({ user }: { user: User }) => {
  return (
    <div className="max-w-5xl">
      <div className="bg-[#116862]/5 border border-[#116862]/20 p-4 rounded-lg mb-6 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-[#116862]">Forum de {user.missionLocale}</h3>
          <p className="text-sm text-[#116862]/80">Espace d'entraide réservé aux membres de votre structure.</p>
        </div>
        <button className="bg-[#116862] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-[#0e524d] flex items-center gap-2">
          <Plus size={16} /> Poser une question
        </button>
      </div>

      <div className="space-y-4">
        {MOCK_POSTS.map(post => (
          <div key={post.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-[#116862]/30 cursor-pointer transition-colors flex gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
              {post.author_avatar}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800 text-lg mb-1">{post.title}</h4>
              <p className="text-sm text-slate-500 line-clamp-1 mb-3">{post.content}</p>
              
              <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                <span className="flex items-center gap-1"><Clock size={14} /> {post.created_at} par {post.author_name}</span>
                <span className={`flex items-center gap-1 ${post.replies_count > 0 ? 'text-[#116862]' : ''}`}>
                  <MessageSquare size={14} /> {post.replies_count} réponse(s)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
