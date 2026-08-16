import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import type { EventDetails } from "@/hooks/use-schedules";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { getTodayISODate } from "@/lib/volunteer-utils";

interface MonthlyTableProps {
  events: EventDetails[];
}

const PAGE_SIZE = 6;

const MonthlyTable = ({ events }: MonthlyTableProps) => {
  const today = getTodayISODate();
  const nextIndex = events.findIndex(ev => ev.date >= today);
  const totalPages = Math.max(1, Math.ceil(events.length / PAGE_SIZE));
  const defaultPage = nextIndex === -1 ? totalPages : Math.floor(nextIndex / PAGE_SIZE) + 1;

  const [page, setPage] = useState(defaultPage);
  const currentPage = Math.min(page, totalPages);

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageEvents = events.slice(start, start + PAGE_SIZE);
  const nextEventId = nextIndex !== -1 ? events[nextIndex].id : null;

  return (
    <motion.div
      id="monthly"
      className="mt-12"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground mb-1">Visão Ampla</h2>
          <div className="w-full h-1 bg-primary rounded mb-2" />
          <p className="text-muted-foreground text-sm">Histórico e panorama completo das escalas mapeadas</p>
        </div>
        {currentPage !== defaultPage && (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setPage(defaultPage)}>
            <RotateCcw className="w-4 h-4" />
            Voltar para atual
          </Button>
        )}
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum evento encontrado.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pageEvents.map(event => (
              <EventCard key={event.id} event={event} isNext={event.id === nextEventId} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[110px] text-center">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Próxima página"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default MonthlyTable;
