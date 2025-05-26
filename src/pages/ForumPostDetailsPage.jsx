import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/components/ui/use-toast.js';
import { motion } from 'framer-motion';
import PostDisplay from '@/components/forum/PostDisplay.jsx';
import CommentList from '@/components/forum/CommentList.jsx';
import CommentForm from '@/components/forum/CommentForm.jsx';
import { Button } from '@/components/ui/button.jsx';
import { MessageSquare, Loader2 } from 'lucide-react';

const ForumPostDetailsPage = () => {
  const { id: postId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [showCommentForm, setShowCommentForm] = useState(false);

  const fetchPostDetails = useCallback(async () => {
    setLoadingPost(true);
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select('*, author:profiles (id, username, avatar_url), upvotes_count, views_count')
        .eq('id', postId)
        .single();

      if (error) throw error;
      
      setPost({
        ...data,
        user_display_name: data.author?.username || (data.user_id ? `Usuário ${data.user_id.substring(0,6)}` : 'Anônimo'),
        avatar_url: data.author?.avatar_url
      });
      
      if (data) {
        // Increment view count only if post is successfully fetched
        // Use .then() to not block the main flow if it fails silently
        supabase.rpc('increment_view_count', { post_id_arg: postId })
          .then(({ error: viewError }) => {
            if (viewError) console.warn("Erro ao incrementar visualização (RPC):", viewError.message);
          });
      }

    } catch (error) {
      console.error("Erro ao buscar detalhes do post:", error);
      toast({ title: "Erro", description: `Não foi possível carregar o post. Detalhe: ${error.message}`, variant: "destructive" });
      setPost(null); // Ensure post is null on error
    } finally {
      setLoadingPost(false);
    }
  }, [postId, toast]);

  const fetchComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select('*, author:profiles (id, username, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data.map(c => ({
        ...c,
        user_display_name: c.author?.username || (c.user_id ? `Usuário ${c.user_id.substring(0,6)}` : 'Anônimo'),
        avatar_url: c.author?.avatar_url
      })));
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
      toast({ title: "Erro", description: `Não foi possível carregar os comentários. Detalhe: ${error.message}`, variant: "destructive" });
      setComments([]); // Ensure comments is empty array on error
    } finally {
      setLoadingComments(false);
    }
  }, [postId, toast]);

  useEffect(() => {
    fetchPostDetails();
    fetchComments();
  }, [fetchPostDetails, fetchComments]);

  const handleCommentAdded = (newComment) => {
    // Instead of refetching all comments, optimistically add the new one
    // This requires the newComment object to have the author profile pre-filled
    // If CommentForm already does this, then this is fine.
    setComments(prevComments => [...prevComments, newComment]);
    setShowCommentForm(false);
    toast({ title: "Sucesso", description: "Comentário adicionado!" });
  };

  const handleCommentUpdated = (updatedComment) => {
    setComments(prevComments => 
      prevComments.map(c => c.id === updatedComment.id ? {
        ...c, 
        ...updatedComment,
        user_display_name: updatedComment.author?.username || (updatedComment.user_id ? `Usuário ${updatedComment.user_id.substring(0,6)}` : 'Anônimo'),
        avatar_url: updatedComment.author?.avatar_url
      } : c)
    );
  };

  const handleCommentDeleted = (commentId) => {
    setComments(prevComments => prevComments.filter(c => c.id !== commentId));
  };
  
  const handleUpvoteSuccess = async () => {
    // Re-fetch post details to get updated upvote_count
    await fetchPostDetails(); 
  };

  const toggleCommentForm = () => {
    if (!user) {
      toast({
        title: "Login Necessário",
        description: "Você precisa estar logado para comentar.",
        action: <Button onClick={() => navigate('/login')} className="bg-primary hover:bg-primary/90 text-primary-foreground">Fazer Login</Button>,
        variant: "default"
      });
      return;
    }
    setShowCommentForm(prev => !prev);
  };

  if (loadingPost) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-3 text-lg text-muted-foreground">Carregando post...</span>
      </div>
    );
  }
  if (!post) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-destructive mb-4">Post não encontrado</h2>
        <p className="text-muted-foreground mb-6">O post que você está procurando não existe ou não pôde ser carregado.</p>
        <Button asChild variant="outline">
          <Link to="/forum">Voltar ao Fórum</Link>
        </Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto max-w-3xl py-8 px-4 space-y-8">
      <PostDisplay post={post} onUpvoteSuccess={handleUpvoteSuccess} />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="flex justify-end"
      >
        <Button onClick={toggleCommentForm} variant="outline" className="border-primary text-primary hover:bg-primary/10">
          <MessageSquare className="h-4 w-4 mr-2" />
          {showCommentForm ? 'Cancelar Comentário' : 'Adicionar Comentário'}
        </Button>
      </motion.div>

      {showCommentForm && user && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: 'auto', marginTop: '2rem' }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
        </motion.div>
      )}
      
      <motion.section
        id="comments"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-6 pt-6 border-t border-border"
      >
        <h2 className="text-2xl font-semibold text-foreground">Comentários ({comments.length})</h2>
        {!user && !showCommentForm && (
           <p className="text-muted-foreground text-sm bg-secondary p-3 rounded-md">
            <Link to="/login" className="text-primary hover:underline font-semibold">Faça login</Link> ou <Link to="/signup" className="text-primary hover:underline font-semibold">cadastre-se</Link> para participar da discussão.
          </p>
        )}
        <CommentList 
          comments={comments} 
          loading={loadingComments}
          onCommentUpdated={handleCommentUpdated}
          onCommentDeleted={handleCommentDeleted}
        />
      </motion.section>
    </div>
  );
};

export default ForumPostDetailsPage;