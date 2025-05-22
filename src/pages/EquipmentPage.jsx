import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ListFilter, ServerCrash } from 'lucide-react';
import { motion } from 'framer-motion';
import EquipmentFilters from '@/components/equipment/EquipmentFilters.jsx';
import EquipmentCard from '@/components/equipment/EquipmentCard.jsx';
import AddEquipmentDialog from '@/components/equipment/AddEquipmentDialog.jsx';

const EquipmentPage = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterInstitution, setFilterInstitution] = useState('all');
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('equipments')
        .select('*')
        .eq('status', 'approved') // Somente equipamentos aprovados
        .order('name', { ascending: true });
      
      if (fetchError) throw fetchError;
      setEquipment(data || []);
    } catch (e) {
      console.error("Erro ao buscar equipamentos:", e);
      setError(e.message || "Não foi possível carregar os equipamentos.");
      toast({
        title: "Erro ao Carregar Equipamentos",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const equipmentTypes = useMemo(() => {
    const types = new Set(equipment.map(item => item.type).filter(Boolean));
    return Array.from(types).sort();
  }, [equipment]);

  const institutions = useMemo(() => {
    const insts = new Set(equipment.map(item => item.institution).filter(Boolean));
    return Array.from(insts).sort();
  }, [equipment]);

  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => {
      const matchesSearchTerm = searchTerm.toLowerCase() === '' ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.specs && item.specs.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'all' || item.type === filterType;
      const matchesInstitution = filterInstitution === 'all' || item.institution === filterInstitution;
      return matchesSearchTerm && matchesType && matchesInstitution;
    });
  }, [equipment, searchTerm, filterType, filterInstitution]);

  const handleEquipmentAdded = () => {
    // Embora o equipamento vá para pending_equipments,
    // aqui poderíamos futuramente atualizar a UI se o admin aprovasse em tempo real.
    // Por agora, apenas um log ou nenhuma ação é necessária já que buscamos de `equipments`.
    console.log("Novo equipamento submetido para aprovação.");
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
            <ListFilter className="h-10 w-10 mr-3" /> Equipamentos Multiusuário
          </h1>
          <p className="text-lg text-muted-foreground">Encontre e solicite o uso de equipamentos de pesquisa.</p>
        </div>
        <AddEquipmentDialog onEquipmentAdded={handleEquipmentAdded} />
      </motion.div>

      <EquipmentFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterInstitution={filterInstitution}
        setFilterInstitution={setFilterInstitution}
        equipmentTypes={equipmentTypes}
        institutions={institutions}
      />

      {loading && (
        <div className="text-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-3 text-muted-foreground">Carregando equipamentos...</p>
        </div>
      )}
      {error && (
        <div className="text-center py-20 bg-destructive/10 border border-destructive rounded-lg p-6">
           <ServerCrash className="h-16 w-16 text-destructive mx-auto mb-4" />
          <p className="text-destructive text-lg font-semibold">Oops! Algo deu errado.</p>
          <p className="text-destructive/80 text-sm mb-4">{error}</p>
          <button onClick={fetchEquipment} className="text-sm text-primary hover:underline">Tentar novamente</button>
        </div>
      )}
      {!loading && !error && filteredEquipment.length === 0 && (
        <div className="text-center py-20 bg-card border border-border rounded-lg shadow-sm p-6">
          <ListFilter className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Nenhum equipamento encontrado com os filtros atuais.</p>
          <p className="text-muted-foreground text-sm">Tente ajustar sua busca ou filtros.</p>
        </div>
      )}
      {!loading && !error && filteredEquipment.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredEquipment.map((item, index) => (
            <EquipmentCard key={item.id} item={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipmentPage;