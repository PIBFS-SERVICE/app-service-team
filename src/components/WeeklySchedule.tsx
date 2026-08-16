import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { EventDetails, ShiftDetails, ScaleDetails } from "@/hooks/use-schedules";
import { getCurrentDateFormatted } from "@/lib/volunteer-utils";

interface WeeklyScheduleProps {
  events: EventDetails[];
  selectedDate: string | null;
  setSelectedDate: (date: string) => void;
}

function formatTime(time: string): string {
  return time.slice(0, 5).replace(':', 'h');
}

const WeeklySchedule = ({ events, selectedDate, setSelectedDate }: WeeklyScheduleProps) => {
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);

  const selectedEvent = events.find(ev => ev.date === selectedDate) || null;
  const activeShift =
    selectedEvent?.shifts.find(s => s.id === selectedShiftId) ||
    selectedEvent?.shifts[0] ||
    null;

  const renderScaleCard = (scale: ScaleDetails, isLeader: boolean, index: number) => {
    const icon = scale.sector.url_icon;
    return (
      <motion.div
        key={scale.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08 }}
      >
        <Card className={`overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${isLeader ? 'ring-2 ring-primary' : ''}`}>
          <CardContent className="p-0">
            <div className={`flex items-center p-2 ${isLeader ? "bg-primary text-primary-foreground" : "bg-card"}`}>
              <div className="w-20 h-20 bg-muted rounded-lg mr-4 flex items-center justify-center overflow-hidden relative flex-shrink-0">
                {scale.volunteer.avatar_url ? (
                  <img
                    src={scale.volunteer.avatar_url}
                    alt={scale.volunteer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className={`font-bold text-xl ${isLeader ? "text-primary-foreground" : "text-muted-foreground"}`}>
                    {scale.volunteer.name.charAt(0).toUpperCase()}
                  </span>
                )}
                {isLeader && (
                  <Crown className="absolute top-1 right-1 rotate-12 w-6 h-6 text-yellow-400 drop-shadow" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-lg ${isLeader ? "text-primary-foreground" : "text-foreground"}`}>
                  {scale.sector.name}
                </h3>
                <p className={`text-sm truncate ${isLeader ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {scale.volunteer.name}
                </p>
              </div>
              {icon && (
                <div className={`pr-2 flex-shrink-0 ${isLeader ? "text-primary-foreground" : "text-primary"}`}>
                  <img src={icon} alt={scale.sector.name} className="w-14 h-14 object-contain" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderShiftContent = (shift: ShiftDetails) => (
    <div className="space-y-3">
      {shift.lider && (
        <div className="p-3 bg-primary/10 rounded-lg">
          <div className="flex items-center text-primary">
            <Users className="w-5 h-5 mr-2" />
            <span className="font-medium text-sm">Líder: {shift.lider.name}</span>
          </div>
        </div>
      )}
      {shift.scales.map((scale, index) =>
        renderScaleCard(scale, scale.volunteer.id === shift.lider?.id, index)
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-foreground mb-1">Próximas escalas</h2>
        <div className="w-full h-1 bg-primary rounded mb-2" />
        <p className="text-muted-foreground text-sm">Data atual: {getCurrentDateFormatted()}</p>
      </div>

      <div className="mb-6 overflow-auto pb-2">
        <div className="flex gap-2">
          {events.map((event) => (
            <Button
              key={event.date}
              variant={selectedDate === event.date ? "default" : "outline"}
              onClick={() => { setSelectedDate(event.date); setSelectedShiftId(null); }}
              className="flex-shrink-0"
              size="sm"
            >
              {format(parseISO(event.date), "dd/MM", { locale: ptBR })}
            </Button>
          ))}
        </div>
      </div>

      {selectedEvent && selectedEvent.shifts.length > 1 && (
        <div className="mb-6 md:hidden">
          <div className="flex bg-muted rounded-lg p-1 gap-1">
            {selectedEvent.shifts.map((shift) => (
              <Button
                key={shift.id}
                variant={activeShift?.id === shift.id ? "default" : "ghost"}
                onClick={() => setSelectedShiftId(shift.id)}
                className="flex-1"
                size="sm"
              >
                {formatTime(shift.scheduled_time)}
              </Button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {selectedEvent && (
          <>
            <div className="md:hidden">
              {activeShift && renderShiftContent(activeShift)}
            </div>
            <div className="hidden md:block">
              {selectedEvent.shifts.length > 1 ? (
                <div
                  className="grid gap-8"
                  style={{ gridTemplateColumns: `repeat(${selectedEvent.shifts.length}, minmax(0, 1fr))` }}
                >
                  {selectedEvent.shifts.map((shift, i) => (
                    <motion.div
                      key={shift.id}
                      initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <h3 className="text-xl font-bold text-foreground mb-4">{formatTime(shift.scheduled_time)}</h3>
                      {renderShiftContent(shift)}
                    </motion.div>
                  ))}
                </div>
              ) : (
                selectedEvent.shifts[0] && renderShiftContent(selectedEvent.shifts[0])
              )}
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WeeklySchedule;
