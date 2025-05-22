import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle, XCircle, Eye, User, Mail, Building, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PendingProjectsTab = () => {
  const [pendingProjects, setPendingProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();
  const { user: adminUser } = useAuth();

  const fetchPendingProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pending_projects')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
      if (error) throw error;
      setPendingProjects(data || []);
    } catch (error) {
      console.error("Error fetching pending projects:", error);
      toast({ title: "Erro ao buscar projetos pendentes", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPendingProjects();
  }, [fetchPendingProjects]);

  const openDetailsModal = (project) => {
    setSelectedProject(project);
    setIsDetailsModalOpen(true);
  };

  const openActionModal = (project, type) => {
    setSelectedProject(project);
    setActionType(type);
    setAdminNotes('');
    setIsActionModalOpen(true);
  };

  const handleAction = async () => {
    if (!selectedProject || !adminUser) return;
    setActionLoading(true);
    
    try {
      if (actionType === 'approve') {
        const { error: insertError } = await supabase
          .from('projects')
          .insert([{
            name: selectedProject.name,
            coordinator: selectedProject.coordinator,
            institution: selectedProject.institution,
            description: selectedProject.description,
            vacancies: selectedProject.vacancies,
            contact_email: selectedProject.contact_email,
            image_url: selectedProject.image_url,
            status: 'approved',
            submitted_by_user_id: selectedProject.user_id,
            approved_by_admin_id: adminUser.id,
          }]);
        if (insertError) throw insertError;
      }

      const { error: updateError } = await supabase
        .from('pending_projects')
        .update({ 
          status: actionType === 'approve' ? 'approved' : 'rejected',
          notes_admin: adminNotes 
        })
        .eq('id', selectedProject.id);
      if (updateError) throw updateError;

      toast({ title: `Projeto ${actionType === 'approve' ? 'Aprovado' : 'Rejeitado'}`, description: `O projeto "${selectedProject.name}" foi processado.` });
      setIsActionModalOpen(false);
      fetchPendingProjects(); 
    } catch (error) {
      console.error(`Error ${actionType} project:`, error);
      toast({ title: "Erro ao processar", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-10"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (pendingProjects.length === 0) {
    return <p className="text-center text-muted-foreground py-10">Nenhum projeto pendente de aprovação.</p>;
  }

  return (
    <div className="space-y-4">
      {pendingProjects.map(proj => (
        <Card key={proj.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">{proj.name}</CardTitle>
            <CardDescription>
              Enviado em: {format(new Date(proj.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} por {proj.user_name || proj.user_email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm"><User className="inline h-4 w-4 mr-1 text-muted-foreground" /><strong>Coordenador:</strong> {proj.coordinator}</p>
            <p className="text-sm"><Building className="inline h-4 w-4 mr-1 text-muted-foreground" /><strong>Instituição:</strong> {proj.institution}</p>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => openDetailsModal(proj)}><Eye className="mr-1 h-4 w-4" /> Ver Detalhes</Button>
            <Button variant="destructive" size="sm" onClick={() => openActionModal(proj, 'reject')}><XCircle className="mr-1 h-4 w-4" /> Rejeitar</Button>
            <Button variant="default" size="sm" onClick={() => openActionModal(proj, 'approve')} className="bg-green-600 hover:bg-green-700"><CheckCircle className="mr-1 h-4 w-4" /> Aprovar</Button>
          </CardFooter>
        </Card>
      ))}

      {selectedProject && (
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalhes do Projeto: {selectedProject.name}</DialogTitle>
              <DialogDescription>Revisão do projeto submetido para aprovação.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto text-sm">
              <p><strong>Nome:</strong> {selectedProject.name}</p>
              <p><strong>Coordenador:</strong> {selectedProject.coordinator}</p>
              <p><strong>Instituição:</strong> {selectedProject.institution}</p>
              <p><strong>Email de Contato:</strong> {selectedProject.contact_email}</p>
              <p><strong>Descrição:</strong></p>
              <p className="whitespace-pre-wrap bg-muted p-2 rounded-md">{selectedProject.description || 'N/A'}</p>
              <p><strong>Vagas:</strong></p>
              {selectedProject.vacancies && selectedProject.vacancies.length > 0 ? (
                <ul className="list-disc list-inside pl-4">
                  {selectedProject.vacancies.map((v, i) => <li key={i}>{v}</li>)}
                </ul>
              ) : <p>Nenhuma vaga especificada.</p>}
              {selectedProject.image_url && <img  src={selectedProject.image_url} alt={selectedProject.name} className="rounded-md max-h-60 w-auto mx-auto" src="https://images.unsplash.com/photo-1697256200022-f61abccad430" />}
              <hr className="my-2"/>
              <p><strong>Enviado por:</strong></p>
              <p><User className="inline h-4 w-4 mr-1 text-muted-foreground" /> {selectedProject.user_name || 'N/A'}</p>
              <p><Mail className="inline h-4 w-4 mr-1 text-muted-foreground" /> {selectedProject.user_email || 'N/A'}</p>
              <p><Building className="inline h-4 w-4 mr-1 text-muted-foreground" /> Instituição do Usuário: {selectedProject.user_institution || 'N/A'}</p>
              <p><strong>Data de Envio:</strong> {format(new Date(selectedProject.created_at), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}</p>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Fechar</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {selectedProject && (
        <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{actionType === 'approve' ? 'Aprovar' : 'Rejeitar'} Projeto: {selectedProject.name}</DialogTitle>
              <DialogDescription>
                {actionType === 'approve' ? 'Confirmar aprovação e publicação do projeto.' : 'Confirmar rejeição do projeto.'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="adminNotesProject">Notas (opcional):</Label>
              <Textarea 
                id="adminNotesProject" 
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

export default PendingProjectsTab;