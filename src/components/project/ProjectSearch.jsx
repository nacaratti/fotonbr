import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

const ProjectSearch = ({ searchTerm, setSearchTerm }) => {
  return (
    <motion.div 
      className="relative w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
    >
      <Input 
        type="search" 
        placeholder="Buscar projetos por nome, coordenador ou instituição..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 py-3 text-base"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
    </motion.div>
  );
};

export default ProjectSearch;