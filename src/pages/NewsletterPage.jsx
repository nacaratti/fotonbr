import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Mail, Send } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const NewsletterPage = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: 'Erro de Validação',
        description: 'Por favor, insira um endereço de e-mail válido.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{ email: email.toLowerCase() }])
        .select();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: 'Já Inscrito',
            description: 'Este e-mail já está cadastrado em nossa newsletter.',
            variant: 'default',
          });
        } else {
          throw error;
        }
      } else if (data) {
        toast({
          title: 'Inscrição Confirmada!',
          description: 'Obrigado por se inscrever na newsletter FotonBR.',
        });
        setEmail('');
      }
    } catch (error) {
      console.error('Erro ao inscrever e-mail:', error);
      toast({
        title: 'Erro na Inscrição',
        description: 'Ocorreu um erro ao tentar inscrever seu e-mail. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <Mail className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          Newsletter FotonBR
        </h1>
        <p className="text-xl text-muted-foreground mt-2 max-w-2xl mx-auto">
          Mantenha-se atualizado com as últimas novidades, avanços e oportunidades no campo da fotônica no Brasil. Inscreva-se para receber nosso boletim mensal.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card className="max-w-lg mx-auto shadow-xl border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-foreground">Inscreva-se para Novidades</CardTitle>
            <CardDescription className="text-center">
              Não perca nenhuma atualização importante do setor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu melhor e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10 h-12 text-base"
                  aria-label="Endereço de e-mail para newsletter"
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Send className="mr-2 h-5 w-5" />
                )}
                {loading ? 'Inscrevendo...' : 'Inscrever-se Agora'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <motion.section 
        className="mt-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold text-foreground mb-4">Por que se inscrever?</h2>
        <div className="grid md:grid-cols-3 gap-6 text-muted-foreground">
          <div className="p-4 border rounded-lg bg-secondary/50">
            <h3 className="font-semibold text-primary mb-1">Avanços Científicos</h3>
            <p className="text-sm">Receba em primeira mão as descobertas dos laboratórios brasileiros.</p>
          </div>
          <div className="p-4 border rounded-lg bg-secondary/50">
            <h3 className="font-semibold text-primary mb-1">Eventos e Chamadas</h3>
            <p className="text-sm">Fique por dentro de congressos, workshops e editais de fomento.</p>
          </div>
          <div className="p-4 border rounded-lg bg-secondary/50">
            <h3 className="font-semibold text-primary mb-1">Oportunidades</h3>
            <p className="text-sm">Informações sobre vagas de pesquisa, bolsas e colaborações.</p>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default NewsletterPage;