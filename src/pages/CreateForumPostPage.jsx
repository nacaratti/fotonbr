import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const CreateForumPostPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: "Erro", description: "O título é obrigatório.", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Erro", description: "Você precisa estar logado para criar um post.", variant: "destructive" });
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert([{ title, content, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      toast({ title: 'Post Criado!', description: 'Seu post foi publicado com sucesso.' });
      navigate(`/forum/post/${data.id}`);
    } catch (error) {
      console.error("Erro ao criar post:", error);
      toast({ title: 'Erro ao Criar Post', description: error.message || 'Não foi possível criar o post.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <PlusCircle className="h-12 w-12 text-primary mx-auto mb-2" />
          <CardTitle className="text-2xl">Criar Novo Post no Fórum</CardTitle>
          <CardDescription>Compartilhe suas ideias e perguntas com a comunidade.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-lg">Título do Post</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Um título claro e conciso"
                required
                className="text-base h-12"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content" className="text-lg">Conteúdo (Opcional)</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Detalhe sua pergunta ou discussão aqui..."
                rows={8}
                className="text-base"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">Você pode usar Markdown para formatação.</p>
            </div>
            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Send className="mr-2 h-5 w-5" />
              )}
              {loading ? 'Publicando...' : 'Publicar Post'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CreateForumPostPage;