import { motion } from "framer-motion";
import { useVolunteers } from "@/hooks/use-volunteers";
import { VolunteerCard } from "@/components/VolunteerCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentDateFormatted } from "@/lib/volunteer-utils";

const Team = () => {
  const { data: volunteers, isLoading, error } = useVolunteers();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-extrabold text-foreground mb-1">Equipe</h1>
        <div className="w-full h-1 bg-primary rounded mb-2" />
        <p className="text-muted-foreground text-sm">Data atual: {getCurrentDateFormatted()}</p>
      </motion.div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">Erro ao carregar dados da equipe.</p>
          <p className="text-muted-foreground text-sm mt-1">Verifique a configuração do banco de dados.</p>
        </div>
      )}

      {volunteers && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {volunteers.map((volunteer, index) => (
            <VolunteerCard key={volunteer.id} volunteer={volunteer} index={index} />
          ))}
        </div>
      )}

      {volunteers && volunteers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum voluntário cadastrado ainda.</p>
        </div>
      )}
    </div>
  );
};

export default Team;
