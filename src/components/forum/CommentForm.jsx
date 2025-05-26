import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/components/ui/use-toast.js';
import { Button } from '@/components/ui/button.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Send } from 'lucide-react';

const CommentForm = ({ postId, onCommentAdded }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) {
      toast({ title: "Aviso", description: "Comentário não pode estar vazio e você precisa estar logado.", variant: "default"});
      return;
    }
    setPostingComment(true);
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .insert([{ post_id: postId, user_id: user.id, content: newComment }])
        .select('*, author:profiles(username, avatar_url)')
        .single();

      if (error) throw error;
      
      const newCommentWithProfile = {
        ...data,
        user_display_name: data.author?.username || (data.user_id ? data.user_id.split('@')[0] : 'Anônimo'),
        avatar_url: data.author?.avatar_url
      };
      
      onCommentAdded(newCommentWithProfile);
      setNewComment('');
      toast({ title: "Sucesso", description: "Comentário adicionado!" });
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      toast({ title: "Erro", description: "Não foi possível adicionar o comentário.", variant: "destructive" });
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <form onSubmit={handleCommentSubmit} className="space-y-2">
      <Label htmlFor="newComment" className="sr-only">Seu comentário</Label>
      <Textarea
        id="newComment"
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Escreva seu comentário..."
        rows={3}
        disabled={postingComment}
      />
      <Button type="submit" disabled={postingComment || !newComment.trim()}>
        {postingComment ? 'Enviando...' : <><Send className="h-4 w-4 mr-2" /> Enviar Comentário</>}
      </Button>
    </form>
  );
};

export default CommentForm;