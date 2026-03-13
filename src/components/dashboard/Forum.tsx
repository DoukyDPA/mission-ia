import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Clock, Plus, ArrowLeft, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

interface ForumProps {
  user: User;
}

export const Forum = ({ user }: ForumProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [replies, setReplies] = useState<any[]>([]);
  
  // États pour les formulaires
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newReplyContent, setNewReplyContent] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  // Charger la liste des questions
  const fetchPosts = useCallback(async () => {
    if (!supabase) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:author_id(full_name),
          forum_replies(count)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setPosts(data || []);
    } catch (err: any) {
      console.error("Erreur lors du chargement du forum:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger les réponses d'une question spécifique
  const fetchReplies = useCallback(async (postId: string | number) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('forum_replies')
        .select(`*, profiles:author_id(full_name)`)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      setReplies(data || []);
    } catch (err: any) {
      console.error("Erreur réponses:", err.message);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (selectedPost) {
      fetchReplies(selectedPost.id);
    }
  }, [selectedPost, fetchReplies]);

  // Créer une nouvelle question
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim() || !supabase) return;
    
    try {
      const { error } = await supabase.from('forum_posts').insert({
        title: newPostTitle,
        content: newPostContent,
        author_id: user.id,
        structure_id: user.structure_id
      });
      
      if (error) throw error;
      
      setNewPostTitle('');
      setNewPostContent('');
      setIsCreatingPost(false);
      fetchPosts();
    } catch (err: any) {
      alert("Erreur lors de la création : " + err.message);
    }
  };

  // Répondre à une question
  const handleCreateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyContent.trim() || !selectedPost || !supabase) return;

    try {
      const { error } = await supabase.from('forum_replies').insert({
        post_id: selectedPost.id,
        content: newReplyContent,
        author_id: user.id
      });

      if (error) throw error;

      setNewReplyContent('');
      fetchReplies(selectedPost.id);
      // On rafraîchit aussi la liste pour mettre à jour le compteur de réponses
      fetchPosts(); 
    } catch (err: any) {
      alert("Erreur lors de la réponse : " + err.message);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'
    });
  };

  // --- VUE : LECTURE D'UN FIL DE DISCUSSION ---
  if (selectedPost) {
    return (
      <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button 
          onClick={() => setSelectedPost(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-[#116862] mb-6 font-medium text-sm transition-colors"
        >
          <ArrowLeft size={16} /> Retour à la liste des questions
        </button>

        {/* Question originale */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">{selectedPost.title}</h2>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
              {getInitials(selectedPost.profiles?.full_name)}
            </div>
            <div>
              <p className="font-bold text-sm text-slate-700">{selectedPost.profiles?.full_name || 'Anonyme'}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Clock size={12} /> {formatDate(selectedPost.created_at)}
              </p>
            </div>
          </div>
          <div className="text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
            {selectedPost.content}
          </div>
        </div>

        {/* Liste des réponses */}
        <h3 className="font-bold text-lg text-slate-800 mb-4 px-2 flex items-center gap-2">
          <MessageSquare size={18} className="text-[#116862]" /> 
          {replies.length} Réponse{replies.length > 1 ? 's' : ''}
        </h3>
        
        <div className="space-y-4 mb-8">
          {replies.map(reply => (
            <div key={reply.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex gap-4 ml-8">
              <div className="w-8 h-8 rounded-full bg-[#116862]/10 text-[#116862] font-bold flex items-center justify-center text-xs shrink-0">
                {getInitials(reply.profiles?.full_name)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-sm text-slate-700">{reply.profiles?.full_name || 'Anonyme'}</p>
                  <p className="text-xs text-slate-400">{formatDate(reply.created_at)}</p>
                </div>
                <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{reply.content}</p>
              </div>
            </div>
          ))}
          {replies.length === 0 && (
            <p className="text-sm text-slate-500 italic ml-8 py-4">Soyez le premier à répondre à cette question !</p>
          )}
        </div>

        {/* Formulaire de réponse */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 ml-8">
          <form onSubmit={handleCreateReply}>
            <textarea 
              value={newReplyContent}
              onChange={(e) => setNewReplyContent(e.target.value)}
              placeholder="Écrivez votre réponse ici..."
              className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#116862] outline-none mb-3 bg-white"
              rows={3}
              required
            />
            <div className="flex justify-end">
              <button 
                type="submit"
                className="bg-[#116862] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-[#0e524d] flex items-center gap-2"
              >
                <Send size={16} /> Envoyer
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- VUE : LISTE DES QUESTIONS ---
  return (
    <div className="max-w-5xl">
      <div className="bg-[#116862]/5 border border-[#116862]/20 p-4 rounded-lg mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-bold text-[#116862] text-lg">Forum de {user.missionLocale}</h3>
          <p className="text-sm text-[#116862]/80">Espace d'entraide réservé aux membres de votre structure.</p>
        </div>
        {!isCreatingPost && (
          <button 
            onClick={() => setIsCreatingPost(true)}
            className="bg-[#116862] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-[#0e524d] flex items-center gap-2"
          >
            <Plus size={16} /> Poser une question
          </button>
        )}
      </div>

      {/* Formulaire Nouvelle Question */}
      {isCreatingPost && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-lg mb-4 text-slate-800">Nouvelle question</h3>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Titre de votre question</label>
              <input 
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                type="text" 
                placeholder="Ex: Comment anonymiser un CV rapidement ?"
                className="w-full border border-slate-200 p-2 rounded-lg focus:ring-2 focus:ring-[#116862] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Détaillez votre besoin</label>
              <textarea 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Bonjour, j'essaie de..."
                className="w-full border border-slate-200 p-2 rounded-lg focus:ring-2 focus:ring-[#116862] outline-none"
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setIsCreatingPost(false)}
                className="px-4 py-2 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button 
                type="submit"
                className="bg-[#116862] text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-[#0e524d]"
              >
                Publier
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des posts */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400 font-medium">Chargement des discussions...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-white text-slate-500">
          <MessageSquare size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="font-medium text-slate-700">Aucune discussion pour le moment.</p>
          <p className="text-sm mt-1">Lancez le premier sujet d'entraide !</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => {
            const repliesCount = post.forum_replies ? post.forum_replies[0]?.count : 0;
            return (
              <div 
                key={post.id} 
                onClick={() => setSelectedPost(post)}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-[#116862]/40 hover:shadow-md cursor-pointer transition-all flex gap-4 group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0 group-hover:bg-[#116862]/10 group-hover:text-[#116862] transition-colors">
                  {getInitials(post.profiles?.full_name)}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-[#116862] transition-colors">{post.title}</h4>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed">{post.content}</p>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {formatDate(post.created_at)} par {post.profiles?.full_name || 'Anonyme'}
                    </span>
                    <span className={`flex items-center gap-1 ${repliesCount > 0 ? 'text-[#116862] bg-[#116862]/10 px-2 py-0.5 rounded-full' : ''}`}>
                      <MessageSquare size={14} /> {repliesCount} réponse{repliesCount > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
