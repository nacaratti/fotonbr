import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Briefcase, User, Building, Mail, Users, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import ApplyToProjectDialog from '@/components/project/ApplyToProjectDialog.jsx';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast.js';

const ProjectCard = ({ project, index }) => {
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleApplyClick = () => {
    if (!user) {
      toast({
        title: "Login Necessário",
        description: "Você precisa estar logado para se candidatar a projetos.",
        action: <Button onClick={() => navigate('/login')} className="bg-primary hover:bg-primary/90 text-primary-foreground">Fazer Login</Button>,
      });
      return;
    }
    setIsApplyDialogOpen(true);
  };


  return (
    <motion.div
      key={project.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
    >
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl text-primary">{project.name}</CardTitle>
          <CardDescription className="flex items-center text-sm">
            <User className="h-4 w-4 mr-1 text-muted-foreground" /> Coordenador: {project.coordinator}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-2 text-sm">
          <p className="flex items-center"><Building className="h-4 w-4 mr-2 text-muted-foreground" /> <strong>Instituição:</strong> {project.institution}</p>
          {project.description && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="description">
                <AccordionTrigger className="text-sm py-2">Descrição do Projeto</AccordionTrigger>
                <AccordionContent className="text-xs">
                  {project.description}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          {project.vacancies && project.vacancies.length > 0 && (
            <div className="pt-2">
              <p className="flex items-center font-semibold"><Users className="h-4 w-4 mr-2 text-muted-foreground" /> Vagas Disponíveis:</p>
              <ul className="list-disc list-inside pl-2 text-xs">
                {project.vacancies.map((vaga, i) => <li key={i}>{vaga}</li>)}
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-start space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <div className="text-xs text-muted-foreground flex items-center">
            <Mail className="h-3 w-3 mr-1" /> {project.contact_email}
          </div>
          <Button onClick={handleApplyClick} className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            <Send className="h-4 w-4 mr-2" />
            Candidatar-se
          </Button>
        </CardFooter>
      </Card>
      {user && project && (
        <ApplyToProjectDialog 
          project={project} 
          open={isApplyDialogOpen} 
          onOpenChange={setIsApplyDialogOpen} 
        />
      )}
    </motion.div>
  );
};

export default ProjectCard;