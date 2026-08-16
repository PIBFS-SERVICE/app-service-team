import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Edit2, Trash2 } from 'lucide-react'
import type { EventWithDetails } from '@/hooks/use-events'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ShiftCard } from './ShiftCard'

interface EventListCardProps {
  event: EventWithDetails
  onEdit: () => void
  onDelete: () => void
}

export function EventListCard({ event, onEdit, onDelete }: EventListCardProps) {
  return (
    <div className="border border-border rounded-lg bg-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <button onClick={onEdit} className="text-left group flex-1 min-w-0">
          <p className="text-sm font-semibold group-hover:text-primary transition-colors truncate">{event.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {format(parseISO(event.date), "EEE, dd/MM/yyyy", { locale: ptBR })}
          </p>
        </button>
        <div className="flex items-center gap-0.5 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onEdit}
                className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Editar"
              >
                <Edit2 size={13} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Editar</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onDelete}
                className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                aria-label="Excluir"
              >
                <Trash2 size={13} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Excluir</TooltipContent>
          </Tooltip>
        </div>
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
  )
}
