import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import WeeklySchedule from "@/components/WeeklySchedule";
import MonthlyTable from "@/components/MonthlyTable";
import { useSchedules } from "@/hooks/use-schedules";
import { getTodayISODate } from "@/lib/volunteer-utils";

const Index = () => {
  const { data: events, isLoading, error, refetch } = useSchedules();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = getTodayISODate();
  const upcomingEvents = useMemo(() => events?.filter(ev => ev.date >= today) || [], [events, today]);

  useEffect(() => {
    if (upcomingEvents.length > 0 && !selectedDate) {
      setSelectedDate(upcomingEvents[0].date);
    }
  }, [upcomingEvents, selectedDate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3rem)]">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Carregando escalas...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !events) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3rem)]">
        <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-destructive mb-4">Erro ao carregar dados</p>
          <Button onClick={() => refetch()} variant="outline">Tentar novamente</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-end mb-4">
        <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Recarregar
        </Button>
      </div>

      <WeeklySchedule events={upcomingEvents} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      <MonthlyTable events={events} />
    </motion.div>
  );
};

export default Index;
