import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const AddProjectDialog = ({ onProjectAdded }) => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [newProjectData, setNewProjectData] = useState({
    name: '',
    coordinator: '',
    institution: profile?.institution || '',
    description: '',
    vacancies: '', // String de vagas separadas por vírgula
    contact_email: user?.email || '',
    image_url: ''
  });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      setNewProjectData(prev => ({
        ...prev,
        contact_email: user.email || prev.contact_email
      }));
    }
    if (profile) {
      setNewProjectData(prev => ({
        ...prev,
        institution: profile.institution || prev.institution
      }));
    }
  }, [user, profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProjectData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Erro", description: "Você precisa estar logado para adicionar projetos.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const vacanciesArray = newProjectData.vacancies.split(',').map(v => v.trim()).filter(v => v);
      const submissionData = {
        ...newProjectData,
        vacancies: vacanciesArray,
        user_id: user.id,
        user_name: profile?.username || user.email,
        user_email: user.email,
        user_institution: newProjectData.institution
      };

      const { data, error } = await supabase
        .from('pending_projects')
        .insert([submissionData])
        .select();

      if (error) throw error;

      toast({
        title: "Projeto Enviado!",
        description: "Seu projeto foi enviado para aprovação.",
      });
      setShowDialog(false);
      setNewProjectData({ name: '', coordinator: '', institution: profile?.institution || '', description: '', vacancies: '', contact_email: user?.email || '', image_url: '' });
      if (onProjectAdded) onProjectAdded(data[0]);

    } catch (error) {
      toast({
        title: "Erro ao Enviar",
        description: error.message || "Não foi possível adicionar o projeto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return (
      <Button variant="outline" disabled>
        <PlusCircle className="h-4 w-4 mr-2" />
        Adicionar Projeto (Requer Login)
      </Button>
    );
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Projeto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Projeto</DialogTitle>
          <DialogDescription>
            Descreva seu projeto de pesquisa. Ele será revisado antes da publicação.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label htmlFor="name">Nome do Projeto</Label>
            <Input id="name" name="name" value={newProjectData.name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="coordinator">Coordenador(a)</Label>
            <Input id="coordinator" name="coordinator" value={newProjectData.coordinator} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="institution">Instituição</Label>
            <Input id="institution" name="institution" value={newProjectData.institution} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="contact_email">E-mail de Contato</Label>
            <Input id="contact_email" name="contact_email" type="email" value={newProjectData.contact_email} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="description">Descrição do Projeto</Label>
            <Textarea id="description" name="description" value={newProjectData.description} onChange={handleChange} placeholder="Objetivos, metodologia, impacto esperado..." />
          </div>
          <div>
            <Label htmlFor="vacancies">Vagas Disponíveis (separadas por vírgula)</Label>
            <Input id="vacancies" name="vacancies" value={newProjectData.vacancies} onChange={handleChange} placeholder="Ex: Mestrado, Doutorado, IC" />
          </div>
          <div>
            <Label htmlFor="image_url">URL da Imagem (Opcional)</Label>
            <Input id="image_url" name="image_url" value={newProjectData.image_url} onChange={handleChange} placeholder="https://exemplo.com/imagem_projeto.jpg"/>
          </div>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Enviar para Aprovação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectDialog;