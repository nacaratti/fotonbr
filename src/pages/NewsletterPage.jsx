import React, { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // Importa seu cliente Supabase
import { useNavigate } from 'react-router-dom';

const NewsletterPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (title, description, variant = 'default') => {
    setToast({ title, description, variant });
    setTimeout(() => setToast(null), 4000);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !isValidEmail(email)) {
      showToast(
        'Erro de Validação',
        'Por favor, insira um endereço de e-mail válido.',
        'destructive'
      );
      return;
    }

    setLoading(true);

    try {
      // Inserir no Supabase usando seu cliente existente
      const { data, error } = await supabase
        .from('subs')
        .insert([{ 
          email: email.toLowerCase().trim(),
          source: 'website'
        }])
        .select();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          showToast(
            'Já Inscrito',
            'Este e-mail já está cadastrado em nossa newsletter.',
            'default'
          );
        } else {
          throw error;
        }
      } else if (data) {
        navigate('/obrigado'); // Redireciona para página de agradecimento
        setEmail('');
      }
    } catch (error) {
      console.error('Erro ao inscrever e-mail:', error);
      showToast(
        'Erro na Inscrição',
        'Ocorreu um erro ao tentar inscrever seu e-mail. Por favor, tente novamente.',
        'destructive'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Toast personalizado */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`p-4 rounded-lg shadow-lg border max-w-sm ${
            toast.variant === 'destructive' 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : 'bg-green-50 border-green-200 text-green-800'
          }`}>
            <div className="flex items-start gap-3">
              {toast.variant === 'destructive' ? (
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-semibold text-sm">{toast.title}</div>
                <div className="text-sm mt-1 opacity-90">{toast.description}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mb-12">
        <Mail className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          Newsletter fotonBR
        </h1>
        <p className="text-xl text-muted-foreground mt-2 max-w-2xl mx-auto">
          Mantenha-se atualizado com as últimas novidades, avanços e oportunidades no campo da fotônica no Brasil. Inscreva-se gratuitamente para receber nosso boletim mensal.
        </p>
      </div>

      <div className="max-w-lg mx-auto shadow-xl border border-border rounded-lg">
        <div className="p-6 border-b">
          <h2 className="text-2xl text-center font-semibold text-foreground">Inscreva-se para Novidades</h2>
          <p className="text-center text-muted-foreground mt-1">
            Não perca nenhuma atualização importante do setor.
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600" />
              <input
                id="email"
                type="email"
                placeholder="Digite seu melhor e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="pl-10 h-12 text-base w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                aria-label="Endereço de e-mail para newsletter"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
              />
            </div>
            <button 
              onClick={handleSubmit}
              className="w-full h-12 text-lg bg-primary hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
              disabled={loading}
            >
              <div className="flex items-center justify-center">
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Send className="mr-2 h-5 w-5" />
                )}
                {loading ? 'Inscrevendo...' : 'Inscrever-se Agora'}
              </div>
            </button>
          </div>
        </div>
      </div>

      <section className="mt-16 text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Por que se inscrever?</h2>
        <div className="grid md:grid-cols-3 gap-6 text-muted-foreground">
          <div className="p-4 border rounded-lg bg-background">
            <h3 className="font-semibold text-primary mb-1">Avanços Científicos</h3>
            <p className="text-sm">Receba em primeira mão as descobertas dos laboratórios brasileiros.</p>
          </div>
          <div className="p-4 border rounded-lg bg-background">
            <h3 className="font-semibold text-primary mb-1">Eventos e Chamadas</h3>
            <p className="text-sm">Fique por dentro de congressos, workshops e editais de fomento.</p>
          </div>
          <div className="p-4 border rounded-lg bg-background">
            <h3 className="font-semibold text-primary mb-1">Oportunidades</h3>
            <p className="text-sm">Informações sobre vagas de pesquisa, bolsas e colaborações.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default NewsletterPage;