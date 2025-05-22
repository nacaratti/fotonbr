import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
import { MessageSquare, Search, PlusCircle, ArrowUp, MessageCircle as MessageIcon, Eye, Clock, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ForumPostCard = ({ post }) => {
  const timeAgo = post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR }) : 'data desconhecida';
  const authorDisplayName = post.author?.username || (post.user_id ? `Usuário ${post.user_id.substring(0, 6)}` : 'Anônimo');
  const authorAvatarUrl = post.author?.avatar_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300 bg-card text-card-foreground">
        <CardHeader>
          <Link to={`/forum/post/${post.id}`}>
            <CardTitle className="text-lg text-primary hover:underline">{post.title}</CardTitle>
          </Link>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
            <Avatar className="h-5 w-5">
              <AvatarImage src={authorAvatarUrl} alt={authorDisplayName} />
              <AvatarFallback>
                {authorDisplayName ? authorDisplayName.substring(0,1).toUpperCase() : <UserCircle size={12}/>}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-foreground">{authorDisplayName}</span>
            <span>&bull;</span>
            <Clock className="h-3 w-3" />
            <span>{timeAgo}</span>
          </div>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="line-clamp-2 text-muted-foreground">{post.content || "Este post não tem conteúdo adicional."}</p>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="p-1 h-auto cursor-default">
              <ArrowUp className="h-3 w-3 mr-1" /> {post.upvotes_count || 0}
            </Button>
            <Link to={`/forum/post/${post.id}#comments`} className="flex items-center hover:text-primary">
              <MessageIcon className="h-3 w-3 mr-1" /> {post.comments_count || 0}
            </Link>
          </div>
          <div className="flex items-center">
            <Eye className="h-3 w-3 mr-1" /> {post.views_count || 0} visualizações
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};


const ForumPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('forum_posts')
        .select(`
          id,
          title,
          content,
          created_at,
          user_id,
          views_count,
          upvotes_count,
          author:profiles ( username, avatar_url ),
          comments_count:forum_comments(count)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }
      
      const { data, error: postsError } = await query;

      if (postsError) throw postsError;

      const postsWithCounts = data.map(post => ({
        ...post,
        comments_count: post.comments_count && post.comments_count.length > 0 ? post.comments_count[0]?.count : 0,
      }));

      setPosts(postsWithCounts);
    } catch (err) {
      console.error("Erro ao buscar posts:", err);
      setError(err.message || "Não foi possível carregar os posts.");
      setPosts([]); // Limpar posts em caso de erro
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary mb-1 flex items-center">
            <MessageSquare className="h-10 w-10 mr-3" /> Fórum FotonBR
          </h1>
          <p className="text-lg text-muted-foreground">Discuta, compartilhe e aprenda sobre fotônica.</p>
        </div>
        {user && (
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link to="/forum/novo-post">
              <PlusCircle className="h-5 w-5 mr-2" /> Criar Novo Post
            </Link>
          </Button>
        )}
      </motion.div>

      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Input
          type="search"
          placeholder="Buscar por título ou conteúdo do post..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 py-3 text-base border-border focus:ring-primary"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </motion.div>

      {loading && (
        <div className="text-center py-10">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-muted-foreground">Carregando posts...</p>
        </div>
      )}
      {error && <p className="text-destructive text-center py-4 bg-destructive/10 border border-destructive rounded-md">{error}</p>}
      
      {!loading && !error && posts.length === 0 && (
        <motion.div 
          className="text-center py-10 bg-card border border-border rounded-lg shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">
            {searchTerm ? "Nenhum post encontrado com sua busca." : "Ainda não há posts no fórum. Seja o primeiro a criar um!"}
          </p>
           {!searchTerm && user && (
             <Button asChild className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link to="/forum/novo-post">
                  <PlusCircle className="h-5 w-5 mr-2" /> Criar Primeiro Post
                </Link>
              </Button>
           )}
           {!searchTerm && !user && (
             <p className="mt-2 text-sm text-muted-foreground">
               <Link to="/login" className="text-primary hover:underline">Faça login</Link> ou <Link to="/signup" className="text-primary hover:underline">cadastre-se</Link> para criar um post.
             </p>
           )}
        </motion.div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map(post => (
            <ForumPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ForumPage;