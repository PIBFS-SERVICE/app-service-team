import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, Sun, Moon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useVolunteer } from "@/hooks/use-volunteers";
import { useSchedules, type EventDetails } from "@/hooks/use-schedules";
import type { VolunteerWithSectors } from "@/types/database";
import { getMinistryTime, getInitials, getProficiencyIcon, getCurrentDateFormatted, getTodayISODate } from "@/lib/volunteer-utils";

interface VolunteerScheduleEntry {
  date: string;
  eventName: string;
  sectorName: string;
  shiftTime: string;
}

function getVolunteerSchedules(volunteerId: string, events: EventDetails[]): VolunteerScheduleEntry[] {
  const results: VolunteerScheduleEntry[] = [];
  events.forEach(event => {
    event.shifts.forEach(shift => {
      shift.scales.forEach(scale => {
        if (scale.volunteer.id === volunteerId) {
          results.push({
            date: event.date,
            eventName: event.name,
            sectorName: scale.sector.name,
            shiftTime: shift.scheduled_time,
          });
        }
      });
    });
  });
  return results;
}

function formatShiftTime(time: string): string {
  return time.slice(0, 5).replace(':', 'h');
}

function isMorningShift(time: string): boolean {
  return parseInt(time.slice(0, 2), 10) < 12;
}

const VolunteerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: volunteer, isLoading: loadingVolunteer } = useVolunteer(id || '');
  const { data: scheduleData, isLoading: loadingSchedules } = useSchedules();

  if (loadingVolunteer) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!volunteer) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-muted-foreground">Voluntário não encontrado.</p>
        <Button variant="outline" onClick={() => navigate('/equipe')} className="mt-4">Voltar</Button>
      </div>
    );
  }

  const primarySector = volunteer.volunteer_sectors.find(vs => vs.is_active_in_sector);
  const today = getTodayISODate();
  const upcomingSchedules = scheduleData
    ? getVolunteerSchedules(volunteer.id, scheduleData.filter(ev => ev.date >= today))
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Button variant="ghost" size="sm" onClick={() => navigate('/equipe')} className="mb-4 gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <h1 className="text-3xl font-extrabold text-foreground mb-1">{volunteer.nickname || volunteer.name}</h1>
        <div className="w-full h-1 bg-primary rounded mb-2" />
        <p className="text-muted-foreground text-sm">Data atual: {getCurrentDateFormatted()}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Volunteer Info Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Card className="p-6 h-full">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-20 h-20 ring-2 ring-border">
                <AvatarImage src={volunteer.avatar_url || undefined} alt={volunteer.name} />
                <AvatarFallback className="bg-muted text-muted-foreground font-bold text-xl">
                  {getInitials(volunteer.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-foreground">{volunteer.name}</h2>
                {volunteer.nickname && (
                  <p className="text-muted-foreground text-sm">"{volunteer.nickname}"</p>
                )}
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground">Área de atuação:</span>
                <p className="font-medium text-foreground text-base">{primarySector?.sectors.name || 'Sem área'}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Skills:</span>
                <div className="flex gap-3 mt-2 flex-wrap">
                  {volunteer.volunteer_sectors.map((vs) => {
                    const iconUrl = getProficiencyIcon(vs);
                    return (
                      <div key={vs.id} className="flex items-center gap-2">
                        {iconUrl ? (
                          <img src={iconUrl} alt={vs.sectors.name} className="w-8 h-8 object-contain" title={`${vs.sectors.name} (${vs.proficiency_status})`} />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground" title={`${vs.sectors.name} (${vs.proficiency_status})`}>
                            {vs.sectors.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="text-muted-foreground">Tempo de ministério (aa/mm/dd):</span>
                <p className="font-mono font-medium text-foreground text-lg">{getMinistryTime(volunteer.ministry_entry_date)}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Upcoming Schedules */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Próximas escalas
          </h2>

          {loadingSchedules && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          )}

          {!loadingSchedules && upcomingSchedules.length === 0 && (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">Nenhuma escala encontrada para este voluntário.</p>
            </Card>
          )}

          {!loadingSchedules && upcomingSchedules.length > 0 && (
            <div className="space-y-3">
              {upcomingSchedules.map((schedule, index) => (
                <motion.div
                  key={`${schedule.date}-${schedule.sectorName}-${schedule.shiftTime}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.08 }}
                >
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        {isMorningShift(schedule.shiftTime) ? (
                          <Sun className="w-5 h-5 text-primary" />
                        ) : (
                          <Moon className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground">
                          {format(parseISO(schedule.date), 'dd/MM/yyyy', { locale: ptBR })}
                          {' '}
                          <span className="font-normal text-primary">{schedule.sectorName}</span>
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {schedule.eventName} · {formatShiftTime(schedule.shiftTime)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default VolunteerProfile;
