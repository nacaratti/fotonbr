import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Importar Link
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { UserCircle, Save, Building, Link as LinkIcon, BookOpen, Briefcase, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const UserProfilePage = () => {
  const { user, profile, updateUserProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    institution: '',
    university: '',
    orcid: '',
    lattes_url: '',
    linkedin_url: '',
    research_interests: '',
    bio: '',
    avatar_url: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        institution: profile.institution || '',
        university: profile.university || '',
        orcid: profile.orcid || '',
        lattes_url: profile.lattes_url || '',
        linkedin_url: profile.linkedin_url || '',
        research_interests: profile.research_interests || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Erro', description: 'Você precisa estar logado para atualizar o perfil.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const updateData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== null)
      );

      const { error } = await updateUserProfile(updateData);
      if (error) throw error;
      toast({ title: 'Sucesso!', description: 'Seu perfil foi atualizado.' });
    } catch (error) {
      toast({
        title: 'Erro ao Atualizar',
        description: error.message || 'Não foi possível atualizar o perfil.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (authLoading && !profile && !user) { // Check if user is also not available during initial load
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-15rem)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        <p className="ml-4 text-lg text-foreground">Carregando...</p>
      </div>
    );
  }
  
  if (!user) { // If not loading and user is still null, then redirect
     return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-15rem)] text-center">
        <UserCircle className="h-20 w-20 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Acesso Negado</h1>
        <p className="text-muted-foreground mb-6">Você precisa estar logado para ver esta página.</p>
        <Button asChild>
          <Link to="/login">Ir para Login</Link>
        </Button>
      </div>
    );
  }

  // If user is available, but profile is still loading (e.g., after login, profile fetch is in progress)
  if (authLoading && !profile) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-15rem)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        <p className="ml-4 text-lg text-foreground">Carregando perfil...</p>
      </div>
    );
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4 md:px-0 max-w-3xl"
    >
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3 mb-2">
            <UserCircle className="h-10 w-10 text-primary" />
            <div>
              <CardTitle className="text-3xl">Meu Perfil</CardTitle>
              <CardDescription>Atualize suas informações pessoais e profissionais.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Seu nome completo" disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Nome de Usuário (Apelido)</Label>
                <Input id="username" name="username" value={formData.username} onChange={handleChange} placeholder="Como você quer ser chamado" disabled={isSubmitting} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail (não editável)</Label>
              <Input id="email" type="email" value={user.email || ''} readOnly disabled className="bg-muted/50" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="institution">Instituição Principal</Label>
                <div className="relative flex items-center">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="institution" name="institution" value={formData.institution} onChange={handleChange} placeholder="Ex: Universidade de São Paulo" className="pl-10" disabled={isSubmitting} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="university">Outra Universidade/Afiliação</Label>
                 <div className="relative flex items-center">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="university" name="university" value={formData.university} onChange={handleChange} placeholder="Ex: UNICAMP (Opcional)" className="pl-10" disabled={isSubmitting} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="orcid">ORCID</Label>
                 <div className="relative flex items-center">
                  <Info className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="orcid" name="orcid" value={formData.orcid} onChange={handleChange} placeholder="0000-0000-0000-0000" className="pl-10" disabled={isSubmitting} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lattes_url">Link do Lattes</Label>
                <div className="relative flex items-center">
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="lattes_url" name="lattes_url" type="url" value={formData.lattes_url} onChange={handleChange} placeholder="https://lattes.cnpq.br/seu_id" className="pl-10" disabled={isSubmitting} />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">Link do LinkedIn</Label>
              <div className="relative flex items-center">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="linkedin_url" name="linkedin_url" type="url" value={formData.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/in/seu_perfil" className="pl-10" disabled={isSubmitting} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar_url">URL da Foto de Perfil</Label>
              <div className="relative flex items-center">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="avatar_url" name="avatar_url" type="url" value={formData.avatar_url} onChange={handleChange} placeholder="https://exemplo.com/sua_foto.jpg" className="pl-10" disabled={isSubmitting} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="research_interests">Interesses de Pesquisa</Label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea id="research_interests" name="research_interests" value={formData.research_interests} onChange={handleChange} placeholder="Ex: Fotônica integrada, Lasers, Biofotônica..." className="pl-10" rows={3} disabled={isSubmitting} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografia Curta</Label>
              <div className="relative">
                <Info className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} placeholder="Fale um pouco sobre você e sua atuação." className="pl-10" rows={4} disabled={isSubmitting} />
              </div>
            </div>
            
            <CardFooter className="px-0 pt-6">
              <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || authLoading}>
                {isSubmitting ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : <Save className="mr-2 h-4 w-4" />}
                Salvar Alterações
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserProfilePage;