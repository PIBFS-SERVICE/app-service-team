import { Clock, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { EventDetails, ShiftDetails, ScaleDetails } from "@/hooks/use-schedules";

function formatTime(time: string): string {
  return time.slice(0, 5).replace(':', 'h');
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export function ScaleRow({ scale }: { scale: ScaleDetails }) {
  const icon = scale.sector.url_icon;
  return (
    <div className="flex items-center gap-2 py-1">
      <Avatar className="h-8 w-8 shrink-0">
        {scale.volunteer.avatar_url && (
          <AvatarImage src={scale.volunteer.avatar_url} alt={scale.volunteer.name} />
        )}
        <AvatarFallback className="text-[10px]">{getInitials(scale.volunteer.name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{scale.volunteer.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">{scale.sector.name}</p>
      </div>
      {icon && (
        <img src={icon} alt={scale.sector.name} className="h-8 w-8 object-contain shrink-0" />
      )}
    </div>
  );
}

export function ShiftCard({ shift }: { shift: ShiftDetails }) {
  return (
    <div className="min-w-[180px] max-w-[220px] rounded-md border border-border bg-background p-3 flex flex-col gap-2 shrink-0">
      <div className="flex items-center gap-1.5">
        <Clock size={12} className="text-muted-foreground shrink-0" />
        <span className="text-sm font-semibold">{formatTime(shift.scheduled_time)}</span>
      </div>
      {shift.lider && (
        <div className="flex items-center gap-1.5">
          <Avatar className="h-5 w-5 shrink-0">
            {shift.lider.avatar_url && <AvatarImage src={shift.lider.avatar_url} />}
            <AvatarFallback className="text-[9px]">{getInitials(shift.lider.name)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">{shift.lider.name}</span>
        </div>
      )}
      {shift.scales.length > 0 ? (
        <div className="mt-1 space-y-0.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Escalas</p>
          {shift.scales.map(scale => (
            <ScaleRow key={scale.id} scale={scale} />
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-muted-foreground italic mt-1">Sem escalas</p>
      )}
    </div>
  );
}

export function EventCard({ event, isNext = false }: { event: EventDetails; isNext?: boolean }) {
  return (
    <div
      className={cn(
        "border rounded-lg bg-card p-4 flex flex-col gap-3",
        isNext ? "border-primary ring-2 ring-primary shadow-md" : "border-border",
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-semibold truncate">{event.name}</p>
          {isNext && (
            <Badge className="gap-1 shrink-0">
              <Star size={12} className="fill-current" />
              Próxima
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          {format(parseISO(event.date), "dd/MM/yyyy (EEE)", { locale: ptBR })}
        </p>
      </div>
      <div className="border-t border-border" />
      {event.shifts.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">Sem turnos cadastrados</p>
      ) : (
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">Turnos</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {event.shifts.map(shift => (
              <ShiftCard key={shift.id} shift={shift} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
