import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Building } from 'lucide-react';
import { motion } from 'framer-motion';

const EquipmentFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  filterType, 
  setFilterType, 
  filterInstitution, 
  setFilterInstitution, 
  equipmentTypes, 
  institutions 
}) => {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-card shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <div className="relative">
        <Input 
          type="search" 
          placeholder="Buscar por nome ou especificação..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </div>
      <Select value={filterType} onValueChange={setFilterType}>
        <SelectTrigger className="w-full">
          <Filter className="h-4 w-4 mr-2 text-muted-foreground inline-block" />
          <SelectValue placeholder="Filtrar por tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Tipos</SelectItem>
          {equipmentTypes.map(type => (
            <SelectItem key={type} value={type}>{type}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filterInstitution} onValueChange={setFilterInstitution}>
        <SelectTrigger className="w-full">
          <Building className="h-4 w-4 mr-2 text-muted-foreground inline-block" />
          <SelectValue placeholder="Filtrar por instituição" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as Instituições</SelectItem>
          {institutions.map(inst => (
            <SelectItem key={inst} value={inst}>{inst}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  );
};

export default EquipmentFilters;