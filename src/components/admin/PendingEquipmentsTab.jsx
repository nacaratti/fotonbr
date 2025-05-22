import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle, XCircle, Eye, Info, User, Mail, Building } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PendingEquipmentsTab = () => {
  const [pendingEquipments, setPendingEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();
  const { user: adminUser } = useAuth();

  const fetchPendingEquipments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pending_equipments')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
      if (error) throw error;
      setPendingEquipments(data || []);
    } catch (error) {
      console.error("Error fetching pending equipments:", error);
      toast({ title: "Erro ao buscar equipamentos pendentes", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPendingEquipments();
  }, [fetchPendingEquipments]);

  const openDetailsModal = (equipment) => {
    setSelectedEquipment(equipment);
    setIsDetailsModalOpen(true);
  };

  const openActionModal = (equipment, type) => {
    setSelectedEquipment(equipment);
    setActionType(type);
    setAdminNotes('');
    setIsActionModalOpen(true);
  };

  const handleAction = async () => {
    if (!selectedEquipment || !adminUser) return;
    setActionLoading(true);
    
    try {
      if (actionType === 'approve') {
        // 1. Insert into 'equipments' table
        const { error: insertError } = await supabase
          .from('equipments')
          .insert([{
            name: selectedEquipment.name,
            type: selectedEquipment.type,
            institution: selectedEquipment.institution,
            location: selectedEquipment.location,
            specs: selectedEquipment.specs,
            contact_email: selectedEquipment.contact_email,
            image_url: selectedEquipment.image_url,
            status: 'approved',
            submitted_by_user_id: selectedEquipment.user_id,
            approved_by_admin_id: adminUser.id,
          }]);
        if (insertError) throw insertError;
      }

      // 2. Update status in 'pending_equipments' table
      const { error: updateError } = await supabase
        .from('pending_equipments')
        .update({ 
          status: actionType === 'approve' ? 'approved' : 'rejected',
          notes_admin: adminNotes 
        })
        .eq('id', selectedEquipment.id);
      if (updateError) throw updateError;

      toast({ title: `Equipamento ${actionType === 'approve' ? 'Aprovado' : 'Rejeitado'}`, description: `O equipamento "${selectedEquipment.name}" foi processado.` });
      setIsActionModalOpen(false);
      fetchPendingEquipments(); // Refresh list
    } catch (error) {
      console.error(`Error ${actionType} equipment:`, error);
      toast({ title: "Erro ao processar", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-10"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (pendingEquipments.length === 0) {
    return <p className="text-center text-muted-foreground py-10">Nenhum equipamento pendente de aprovação.</p>;
  }

  return (
    <div className="space-y-4">
      {pendingEquipments.map(equip => (
        <Card key={equip.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">{equip.name}</CardTitle>
            <CardDescription>
              Enviado em: {format(new Date(equip.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} por {equip.user_name || equip.user_email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm"><Info className="inline h-4 w-4 mr-1 text-muted-foreground" /><strong>Tipo:</strong> {equip.type || 'N/A'}</p>
            <p className="text-sm"><Building className="inline h-4 w-4 mr-1 text-muted-foreground" /><strong>Instituição:</strong> {equip.institution}</p>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => openDetailsModal(equip)}><Eye className="mr-1 h-4 w-4" /> Ver Detalhes</Button>
            <Button variant="destructive" size="sm" onClick={() => openActionModal(equip, 'reject')}><XCircle className="mr-1 h-4 w-4" /> Rejeitar</Button>
            <Button variant="default" size="sm" onClick={() => openActionModal(equip, 'approve')} className="bg-green-600 hover:bg-green-700"><CheckCircle className="mr-1 h-4 w-4" /> Aprovar</Button>
          </CardFooter>
        </Card>
      ))}

      {selectedEquipment && (
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalhes do Equipamento: {selectedEquipment.name}</DialogTitle>
              <DialogDescription>Revisão do equipamento submetido para aprovação.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto text-sm">
              <p><strong>Nome:</strong> {selectedEquipment.name}</p>
              <p><strong>Tipo:</strong> {selectedEquipment.type || 'N/A'}</p>
              <p><strong>Instituição:</strong> {selectedEquipment.institution}</p>
              <p><strong>Localização:</strong> {selectedEquipment.location || 'N/A'}</p>
              <p><strong>Email de Contato:</strong> {selectedEquipment.contact_email}</p>
              <p><strong>Especificações:</strong></p>
              <p className="whitespace-pre-wrap bg-muted p-2 rounded-md">{selectedEquipment.specs || 'N/A'}</p>
              {selectedEquipment.image_url && <img  src={selectedEquipment.image_url} alt={selectedEquipment.name} className="rounded-md max-h-60 w-auto mx-auto" src="https://images.unsplash.com/photo-1587543313175-f79352876d67" />}
              <hr className="my-2"/>
              <p><strong>Enviado por:</strong></p>
              <p><User className="inline h-4 w-4 mr-1 text-muted-foreground" /> {selectedEquipment.user_name || 'N/A'}</p>
              <p><Mail className="inline h-4 w-4 mr-1 text-muted-foreground" /> {selectedEquipment.user_email || 'N/A'}</p>
              <p><Building className="inline h-4 w-4 mr-1 text-muted-foreground" /> Instituição do Usuário: {selectedEquipment.user_institution || 'N/A'}</p>
              <p><strong>Data de Envio:</strong> {format(new Date(selectedEquipment.created_at), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}</p>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Fechar</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {selectedEquipment && (
        <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{actionType === 'approve' ? 'Aprovar' : 'Rejeitar'} Equipamento: {selectedEquipment.name}</DialogTitle>
              <DialogDescription>
                {actionType === 'approve' ? 'Confirmar aprovação e publicação do equipamento.' : 'Confirmar rejeição do equipamento.'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="adminNotes">Notas (opcional):</Label>
              <Textarea 
                id="adminNotes" 
                value={adminNotes} 
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={actionType === 'approve' ? 'Notas sobre a aprovação...' : 'Motivo da rejeição...'}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline" disabled={actionLoading}>Cancelar</Button></DialogClose>
              <Button 
                onClick={handleAction} 
                disabled={actionLoading}
                className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {actionType === 'approve' ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PendingEquipmentsTab;