import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useToast } from '@/components/ui/use-toast.js';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
import { ArrowUp, Clock, UserCircle, CornerUpLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

const PostDisplay = ({ post, onUpvoteSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleUpvotePost = async () => {
    if (!user) {
      toast({ title: "Aviso", description: "Você precisa estar logado para votar.", variant: "default" });
      return;
    }
    try {
      const { error } = await supabase.rpc('increment_upvote_count', { post_id_arg: post.id, user_id_arg: user.id });
      if (error) throw error;
      
      onUpvoteSuccess(); // Callback to inform parent about successful upvote
      toast({ title: "Obrigado!", description: "Seu voto foi registrado." });
    } catch (error) {
      console.error("Erro ao votar:", error);
      if (error.message.includes("already upvoted")) {
         toast({ title: "Informação", description: "Você já votou neste post.", variant: "default" });
      } else {
        toast({ title: "Erro", description: "Não foi possível registrar seu voto.", variant: "destructive" });
      }
    }
  };

  const postTimeAgo = post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR }) : 'data desconhecida';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-lg">
        <CardHeader>
          <Link to="/forum" className="text-sm text-primary hover:underline flex items-center mb-2">
            <CornerUpLeft className="h-4 w-4 mr-1" /> Voltar para o Fórum
          </Link>
          <CardTitle className="text-3xl text-primary">{post.title}</CardTitle>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.avatar_url} alt={post.user_display_name} />
              <AvatarFallback>
                {post.user_display_name ? post.user_display_name.substring(0,1).toUpperCase() : <UserCircle size={16}/>}
              </AvatarFallback>
            </Avatar>
            <span>{post.user_display_name}</span>
            <span>&bull;</span>
            <Clock className="h-4 w-4" />
            <span>{postTimeAgo}</span>
          </div>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <ReactMarkdown>{post.content || ""}</ReactMarkdown>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button variant="ghost" onClick={handleUpvotePost} disabled={!user}>
            <ArrowUp className="h-5 w-5 mr-2" /> Votar ({post.upvotes_count || 0})
          </Button>
          <span className="text-sm text-muted-foreground">{post.views_count || 0} visualizações</span>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default PostDisplay;