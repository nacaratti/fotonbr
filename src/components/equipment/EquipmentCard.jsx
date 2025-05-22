import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { MapPin, Building, Info, CalendarPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

const EquipmentCard = ({ item, index }) => {
  const { toast } = useToast();

  const handleAgendamento = (equipmentName) => {
    toast({
      title: "Agendamento Solicitado",
      description: `Sua solicitação para ${equipmentName} foi enviada. Aguarde o contato.`,
    });
  };

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
    >
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl text-primary">{item.name}</CardTitle>
          <CardDescription className="flex items-center text-sm">
            <Info className="h-4 w-4 mr-1 text-muted-foreground" /> {item.type}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-2 text-sm">
            <p className="flex items-center"><Building className="h-4 w-4 mr-2 text-muted-foreground" /> <strong>Instituição:</strong> {item.institution}</p>
            <p className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-muted-foreground" /> <strong>Local:</strong> {item.location}</p>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="specs">
                <AccordionTrigger className="text-sm py-2">Especificações Técnicas</AccordionTrigger>
                <AccordionContent className="text-xs">
                  {item.specs || "Não informado."}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </CardContent>
        <CardFooter>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full">
                <CalendarPlus className="h-4 w-4 mr-2" />
                Solicitar Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Solicitar Agendamento: {item.name}</DialogTitle>
                <DialogDescription>
                  Para agendar o uso deste equipamento, entre em contato diretamente com o responsável através do e-mail: <strong>{item.contact_email}</strong>. 
                  Informe o período desejado e o projeto de pesquisa associado.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                    <Button onClick={() => handleAgendamento(item.name)}>Confirmar Leitura</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default EquipmentCard;