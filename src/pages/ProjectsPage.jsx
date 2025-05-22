import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Briefcase, ServerCrash } from 'lucide-react';
import { motion } from 'framer-motion';
import ProjectSearch from '@/components/project/ProjectSearch.jsx';
import ProjectCard from '@/components/project/ProjectCard.jsx';
import AddProjectDialog from '@/components/project/AddProjectDialog.jsx';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'approved') // Somente projetos aprovados
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;
      setProjects(data || []);
    } catch (e) {
      console.error("Erro ao buscar projetos:", e);
      setError(e.message || "Não foi possível carregar os projetos.");
      toast({
        title: "Erro ao Carregar Projetos",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      return lowerSearchTerm === '' ||
        project.name.toLowerCase().includes(lowerSearchTerm) ||
        project.coordinator.toLowerCase().includes(lowerSearchTerm) ||
        project.institution.toLowerCase().includes(lowerSearchTerm) ||
        (project.description && project.description.toLowerCase().includes(lowerSearchTerm));
    });
  }, [projects, searchTerm]);
  
  const handleProjectAdded = () => {
     console.log("Novo projeto submetido para aprovação.");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary mb-1 flex items-center">
            <Briefcase className="h-10 w-10 mr-3" /> Projetos de Pesquisa
          </h1>
          <p className="text-lg text-muted-foreground">Explore oportunidades e conecte-se com pesquisadores.</p>
        </div>
         <AddProjectDialog onProjectAdded={handleProjectAdded} />
      </motion.div>

      <div className="mb-8">
        <ProjectSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      {loading && (
        <div className="text-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-3 text-muted-foreground">Carregando projetos...</p>
        </div>
      )}
      {error && (
        <div className="text-center py-20 bg-destructive/10 border border-destructive rounded-lg p-6">
           <ServerCrash className="h-16 w-16 text-destructive mx-auto mb-4" />
          <p className="text-destructive text-lg font-semibold">Oops! Algo deu errado.</p>
          <p className="text-destructive/80 text-sm mb-4">{error}</p>
          <button onClick={fetchProjects} className="text-sm text-primary hover:underline">Tentar novamente</button>
        </div>
      )}
      {!loading && !error && filteredProjects.length === 0 && (
        <div className="text-center py-20 bg-card border border-border rounded-lg shadow-sm p-6">
          <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Nenhum projeto encontrado com os termos da busca.</p>
           <p className="text-muted-foreground text-sm">Tente palavras-chave diferentes.</p>
        </div>
      )}
      {!loading && !error && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;