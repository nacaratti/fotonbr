import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, LayoutDashboard, FlaskConical, Lightbulb } from 'lucide-react';
import AdminDashboardTab from '@/components/admin/AdminDashboardTab.jsx';
import PendingEquipmentsTab from '@/components/admin/PendingEquipmentsTab.jsx';
import PendingProjectsTab from '@/components/admin/PendingProjectsTab.jsx';
import { motion } from 'framer-motion';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <motion.div 
      className="container mx-auto py-8 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-8">
        <ShieldCheck className="h-10 w-10 mr-3 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">Painel Administrativo</h1>
      </div>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6">
          <TabsTrigger value="dashboard" className="py-3 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <LayoutDashboard className="mr-2 h-5 w-5" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="equipments" className="py-3 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FlaskConical className="mr-2 h-5 w-5" /> Aprovar Equipamentos
          </TabsTrigger>
          <TabsTrigger value="projects" className="py-3 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Lightbulb className="mr-2 h-5 w-5" /> Aprovar Projetos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="focus-visible:ring-0 focus-visible:ring-offset-0">
          <AdminDashboardTab />
        </TabsContent>
        <TabsContent value="equipments" className="focus-visible:ring-0 focus-visible:ring-offset-0">
          <PendingEquipmentsTab />
        </TabsContent>
        <TabsContent value="projects" className="focus-visible:ring-0 focus-visible:ring-offset-0">
          <PendingProjectsTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default AdminPage;