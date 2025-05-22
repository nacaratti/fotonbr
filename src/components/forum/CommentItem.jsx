import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/components/ui/use-toast.js';
import { Button } from '@/components/ui/button.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
import { Edit3, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CommentItem = ({ comment, onCommentUpdated, onCommentDeleted }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(comment.content);
  };

  const handleSaveEdit = async () => {
    if (!editedContent.trim()) {
      toast({ title: "Erro", description: "O comentário não pode estar vazio.", variant: "destructive" });
      return;
    }
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .update({ content: editedContent })
        .match({ id: comment.id, user_id: user.id })
        .select('*, author:profiles(username, avatar_url)')
        .single();
      
      if (error) throw error;

      const updatedCommentWithProfile = {
        ...data,
        user_display_name: data.author?.username || (data.user_id ? data.user_id.split('@')[0] : 'Anônimo'),
        avatar_url: data.author?.avatar_url
      };
      
      onCommentUpdated(updatedCommentWithProfile);
      setIsEditing(false);
      toast({ title: "Sucesso", description: "Comentário atualizado." });
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível atualizar o comentário.", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!user || user.id !== comment.user_id) {
      toast({ title: "Erro", description: "Você não pode excluir este comentário.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from('forum_comments').delete().match({ id: comment.id, user_id: user.id });
      if (error) throw error;
      onCommentDeleted(comment.id);
      toast({ title: "Sucesso", description: "Comentário excluído." });
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível excluir o comentário.", variant: "destructive" });
    }
  };

  const commentTimeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR });

  return (
    <Card className="bg-secondary/50">
      <CardContent className="pt-4">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit}>Salvar</Button>
              <Button size="sm" variant="ghost" onClick={handleCancelEdit}>Cancelar</Button>
            </div>
          </div>
        ) : (
          <ReactMarkdown className="text-sm prose dark:prose-invert max-w-none">{comment.content}</ReactMarkdown>
        )}
        <div className="mt-2 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Avatar className="h-5 w-5">
              <AvatarImage src={comment.avatar_url} alt={comment.user_display_name} />
              <AvatarFallback>{comment.user_display_name ? comment.user_display_name.substring(0, 1).toUpperCase() : "?"}</AvatarFallback>
            </Avatar>
            <span>{comment.user_display_name}</span>
            <span>&bull;</span>
            <span>{commentTimeAgo}</span>
          </div>
          {user && user.id === comment.user_id && !isEditing && (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleEdit}><Edit3 className="h-3 w-3" /></Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive-foreground hover:bg-destructive" onClick={handleDelete}><Trash2 className="h-3 w-3" /></Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentItem;