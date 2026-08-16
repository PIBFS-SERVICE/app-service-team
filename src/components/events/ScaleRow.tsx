import { Edit2, Loader2, X } from 'lucide-react'
import { getInitials } from '@/lib/events-helpers'
import type { VolunteerForSelect } from '@/hooks/use-events'
import type { Sector } from '@/types/database'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScaleForm } from './ScaleForm'

interface ScaleRowProps {
  volunteer: { id: string; name: string; nickname?: string | null; avatar_url: string | null }
  sector: { id: string; name: string }
  iconUrl: string | null
  sectors?: Sector[]
  /** Volunteer ids already used elsewhere in the shift, hidden from the edit picker. Leave undefined to allow picking any volunteer of the sector. */
  existingVolunteerIds?: string[]
  isEditing?: boolean
  savingEdit?: boolean
  onEditRequest?: () => void
  onEditSave?: (sectorId: string, volunteer: VolunteerForSelect) => void | Promise<void>
  onEditCancel?: () => void
  onRemove?: () => void
  removing?: boolean
}

export function ScaleRow({
  volunteer,
  sector,
  iconUrl,
  sectors = [],
  existingVolunteerIds,
  isEditing,
  savingEdit,
  onEditRequest,
  onEditSave,
  onEditCancel,
  onRemove,
  removing,
}: ScaleRowProps) {
  if (isEditing) {
    return (
      <ScaleForm
        compact
        sectors={sectors}
        initialSectorId={sector.id}
        initialVolunteerId={volunteer.id}
        existingVolunteerIds={existingVolunteerIds}
        submitLabel="Salvar"
        submitting={savingEdit}
        onSubmit={(sectorId, v) => onEditSave?.(sectorId, v)}
        onCancel={() => onEditCancel?.()}
      />
    )
  }

  return (
    <div className="flex items-center gap-2 py-1">
      <Avatar className="h-6 w-6 shrink-0">
        {volunteer.avatar_url && <AvatarImage src={volunteer.avatar_url} alt={volunteer.name} />}
        <AvatarFallback className="text-[10px]">{getInitials(volunteer.name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{volunteer.nickname || volunteer.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">{sector.name}</p>
      </div>
      {iconUrl && (
        <img src={iconUrl} alt={sector.name} className="h-8 w-8 object-contain shrink-0 opacity-70" />
      )}
      {onEditRequest && (
        <button
          onClick={onEditRequest}
          className="p-0.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
          aria-label="Editar escala"
        >
          <Edit2 size={12} />
        </button>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          disabled={removing}
          className="p-0.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-destructive shrink-0"
          aria-label="Remover escala"
        >
          {removing ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
        </button>
      )}
    </div>
  )
}
