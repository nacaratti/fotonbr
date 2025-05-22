import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const ApplyToProjectDialog = ({ project, open, onOpenChange }) => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [applicationData, setApplicationData] = useState({
    name: profile?.full_name || '',
    email: user?.email || '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      setApplicationData(prev => ({
        ...prev,
        email: user.email || prev.email,
      }));
    }
    if (profile) {
       setApplicationData(prev => ({
        ...prev,
        name: profile.full_name || profile.username || prev.name,
      }));
    }
  }, [user, profile, open]); // Re-evaluate when dialog opens

  const handleChange = (e) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Erro", description: "Você precisa estar logado para se candidatar.", variant: "destructive" });
      return;
    }
    if (!project) {
      toast({ title: "Erro", description: "Projeto não especificado.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const submissionData = {
        ...applicationData,
        project_id: project.id,
        project_name: project.name,
        user_id: user.id,
      };

      const { error } = await supabase
        .from('cv_submissions')
        .insert([submissionData]);

      if (error) throw error;

      toast({
        title: "Candidatura Enviada!",
        description: `Sua candidatura para "${project.name}" foi enviada com sucesso.`,
      });
      onOpenChange(false); // Fecha o dialog
      setApplicationData({ name: profile?.full_name || '', email: user?.email || '', message: '' }); // Reset form

    } catch (error) {
      toast({
        title: "Erro ao Enviar Candidatura",
        description: error.message || "Não foi possível enviar sua candidatura.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Candidatar-se para: {project.name}</DialogTitle>
          <DialogDescription>
            Preencha seus dados abaixo. Sua candidatura será enviada para o coordenador do projeto ({project.coordinator}). O contato principal é {project.contact_email}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label htmlFor="apply-name">Nome Completo</Label>
            <Input id="apply-name" name="name" value={applicationData.name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="apply-email">E-mail para Contato</Label>
            <Input id="apply-email" name="email" type="email" value={applicationData.email} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="apply-message">Mensagem / Carta de Apresentação (Opcional)</Label>
            <Textarea id="apply-message" name="message" value={applicationData.message} onChange={handleChange} placeholder="Fale um pouco sobre seu interesse e qualificações para este projeto." />
          </div>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={loading || !user} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              {user ? 'Enviar Candidatura' : 'Login Necessário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyToProjectDialog;