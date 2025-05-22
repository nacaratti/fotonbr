import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, FlaskConical, Lightbulb, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className={`border-l-4 ${color}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  </motion.div>
);

const AdminDashboardTab = () => {
  const [stats, setStats] = useState({
    users: 0,
    forumPosts: 0,
    pendingEquipments: 0,
    pendingProjects: 0,
    approvedEquipments: 0,
    approvedProjects: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: forumPostsCount } = await supabase.from('forum_posts').select('*', { count: 'exact', head: true });
        
        const { count: pendingEquipmentsCount } = await supabase.from('pending_equipments').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        const { count: pendingProjectsCount } = await supabase.from('pending_projects').select('*', { count: 'exact', head: true }).eq('status', 'pending');

        const { count: approvedEquipmentsCount } = await supabase.from('equipments').select('*', { count: 'exact', head: true }).eq('status', 'approved');
        const { count: approvedProjectsCount } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'approved');

        setStats({
          users: usersCount || 0,
          forumPosts: forumPostsCount || 0,
          pendingEquipments: pendingEquipmentsCount || 0,
          pendingProjects: pendingProjectsCount || 0,
          approvedEquipments: approvedEquipmentsCount || 0,
          approvedProjects: approvedProjectsCount || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Visão Geral</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total de Usuários" value={stats.users} icon={<Users className="h-5 w-5 text-muted-foreground" />} color="border-blue-500" />
        <StatCard title="Posts no Fórum" value={stats.forumPosts} icon={<FileText className="h-5 w-5 text-muted-foreground" />} color="border-green-500" />
      </div>
      
      <h2 className="text-2xl font-semibold mt-8">Aprovações Pendentes</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title="Equipamentos Pendentes" value={stats.pendingEquipments} icon={<FlaskConical className="h-5 w-5 text-muted-foreground" />} color="border-yellow-500" />
        <StatCard title="Projetos Pendentes" value={stats.pendingProjects} icon={<Lightbulb className="h-5 w-5 text-muted-foreground" />} color="border-orange-500" />
      </div>

      <h2 className="text-2xl font-semibold mt-8">Conteúdo Aprovado</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title="Equipamentos Aprovados" value={stats.approvedEquipments} icon={<FlaskConical className="h-5 w-5 text-muted-foreground" />} color="border-teal-500" />
        <StatCard title="Projetos Aprovados" value={stats.approvedProjects} icon={<Lightbulb className="h-5 w-5 text-muted-foreground" />} color="border-purple-500" />
      </div>
    </div>
  );
};

export default AdminDashboardTab;