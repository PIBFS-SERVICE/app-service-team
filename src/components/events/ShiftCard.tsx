import { Clock } from 'lucide-react'
import { formatTime, getInitials, getSectorIcon } from '@/lib/events-helpers'
import type { ShiftWithDetails } from '@/hooks/use-events'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScaleRow } from './ScaleRow'

interface ShiftCardProps {
  shift: ShiftWithDetails
}

export function ShiftCard({ shift }: ShiftCardProps) {
  return (
    <div className="min-w-[180px] max-w-[220px] rounded-md border border-border bg-background p-3 flex flex-col gap-2 shrink-0">
      <div className="flex items-center gap-1.5">
        <Clock size={12} className="text-muted-foreground shrink-0" />
        <span className="text-sm font-semibold">{formatTime(shift.scheduled_time)}</span>
      </div>
      {shift.volunteers && (
        <div className="flex items-center gap-1.5">
          <Avatar className="h-5 w-5 shrink-0">
            {shift.volunteers.avatar_url && <AvatarImage src={shift.volunteers.avatar_url} />}
            <AvatarFallback className="text-[9px]">{getInitials(shift.volunteers.name)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">{shift.volunteers.name}</span>
        </div>
      )}
      {shift.scales.length > 0 ? (
        <div className="mt-1 space-y-0.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Escalas</p>
          {shift.scales.map(scale => (
            <ScaleRow
              key={scale.id}
              volunteer={scale.volunteers}
              sector={scale.sectors}
              iconUrl={getSectorIcon(scale.sectors)}
            />
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-muted-foreground italic mt-1">Sem escalas</p>
      )}
    </div>
  )
}
