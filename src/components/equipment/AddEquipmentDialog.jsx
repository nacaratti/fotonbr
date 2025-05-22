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

const AddEquipmentDialog = ({ onEquipmentAdded }) => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [newEquipmentData, setNewEquipmentData] = useState({
    name: '',
    type: '',
    institution: '',
    location: '',
    specs: '',
    contact_email: '',
    image_url: ''
  });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      setNewEquipmentData(prev => ({
        ...prev,
        contact_email: user.email || prev.contact_email
      }));
    }
    if (profile) {
      setNewEquipmentData(prev => ({
        ...prev,
        institution: profile.institution || prev.institution
      }));
    }
  }, [user, profile, showDialog]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEquipmentData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Erro", description: "Você precisa estar logado para adicionar equipamentos.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const submissionData = {
        name: newEquipmentData.name,
        type: newEquipmentData.type,
        institution: newEquipmentData.institution,
        location: newEquipmentData.location,
        specs: newEquipmentData.specs,
        contact_email: newEquipmentData.contact_email,
        image_url: newEquipmentData.image_url,
        user_id: user.id,
        user_name: profile?.username || user.email, 
        user_email: user.email,
        user_institution: newEquipmentData.institution 
      };

      const { data, error } = await supabase
        .from('pending_equipments')
        .insert([submissionData])
        .select();

      if (error) throw error;

      toast({
        title: "Equipamento Enviado!",
        description: "Seu equipamento foi enviado para aprovação.",
      });
      setShowDialog(false);
      setNewEquipmentData({ name: '', type: '', institution: profile?.institution || '', location: '', specs: '', contact_email: user?.email || '', image_url: '' }); 
      if (onEquipmentAdded) onEquipmentAdded(data[0]); 

    } catch (error) {
      toast({
        title: "Erro ao Enviar",
        description: error.message || "Não foi possível adicionar o equipamento.",
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
        Adicionar Equipamento (Requer Login)
      </Button>
    );
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Equipamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Equipamento</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do equipamento. Ele será revisado antes de ser publicado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label htmlFor="add-equip-name">Nome do Equipamento</Label>
            <Input id="add-equip-name" name="name" value={newEquipmentData.name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="add-equip-type">Tipo</Label>
            <Input id="add-equip-type" name="type" value={newEquipmentData.type} onChange={handleChange} placeholder="Ex: Microscópio, Espectrômetro"/>
          </div>
          <div>
            <Label htmlFor="add-equip-institution">Instituição</Label>
            <Input id="add-equip-institution" name="institution" value={newEquipmentData.institution} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="add-equip-location">Localização (Cidade, Estado)</Label>
            <Input id="add-equip-location" name="location" value={newEquipmentData.location} onChange={handleChange} placeholder="Ex: Campinas, SP" />
          </div>
          <div>
            <Label htmlFor="add-equip-contact_email">E-mail de Contato para Agendamento</Label>
            <Input id="add-equip-contact_email" name="contact_email" type="email" value={newEquipmentData.contact_email} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="add-equip-specs">Especificações Técnicas</Label>
            <Textarea id="add-equip-specs" name="specs" value={newEquipmentData.specs} onChange={handleChange} placeholder="Descreva as principais características e capacidades." />
          </div>
           <div>
            <Label htmlFor="add-equip-image_url">URL da Imagem (Opcional)</Label>
            <Input id="add-equip-image_url" name="image_url" value={newEquipmentData.image_url} onChange={handleChange} placeholder="https://exemplo.com/imagem.jpg"/>
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

export default AddEquipmentDialog;