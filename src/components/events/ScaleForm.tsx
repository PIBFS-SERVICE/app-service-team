import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useVolunteersBySector, type VolunteerForSelect } from '@/hooks/use-events'
import type { Sector } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { VolunteerCombobox } from './VolunteerCombobox'

interface ScaleFormProps {
  sectors: Sector[]
  initialSectorId?: string
  initialVolunteerId?: string
  /** Volunteer ids already assigned elsewhere in the same shift — hidden from the picker. Leave empty to allow reassigning to any volunteer of the sector (used when editing in place). */
  existingVolunteerIds?: string[]
  submitLabel: string
  submitting?: boolean
  /** Compact inline layout (used for inline edit) vs the dashed "add scale" card layout. */
  compact?: boolean
  onSubmit: (sectorId: string, volunteer: VolunteerForSelect) => void | Promise<void>
  onCancel: () => void
}

export function ScaleForm({
  sectors,
  initialSectorId = '',
  initialVolunteerId = '',
  existingVolunteerIds = [],
  submitLabel,
  submitting,
  compact,
  onSubmit,
  onCancel,
}: ScaleFormProps) {
  const [sectorId, setSectorId] = useState(initialSectorId)
  const [volunteerId, setVolunteerId] = useState(initialVolunteerId)
  const { data: sectorVolunteers = [], isLoading } = useVolunteersBySector(sectorId)

  const availableVolunteers = sectorVolunteers.filter(
    v => v.id === initialVolunteerId || !existingVolunteerIds.includes(v.id)
  )

  const handleSubmit = () => {
    const volunteer = availableVolunteers.find(v => v.id === volunteerId)
    if (!sectorId || !volunteer) return
    onSubmit(sectorId, volunteer)
  }

  const h = compact ? 'h-7' : 'h-8'

  const fields = (
    <div className="flex gap-2 flex-wrap items-center">
      <Select value={sectorId} onValueChange={v => { setSectorId(v); setVolunteerId('') }}>
        <SelectTrigger className={`${h} text-xs ${compact ? 'w-40' : 'w-44'}`}>
          <SelectValue placeholder="Setor" />
        </SelectTrigger>
        <SelectContent>
          {sectors.map(s => (
            <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <VolunteerCombobox
        volunteers={availableVolunteers}
        value={volunteerId}
        onChange={setVolunteerId}
        loading={isLoading}
        disabled={!compact && !sectorId}
        searchPlaceholder="Buscar voluntário..."
        triggerClassName={`${h} ${compact ? 'w-44' : 'w-48'}`}
      />

      <Button
        size="sm"
        className={`${h} text-xs`}
        disabled={!sectorId || !volunteerId || submitting}
        onClick={handleSubmit}
      >
        {submitting && <Loader2 size={12} className="animate-spin mr-1" />}
        {submitLabel}
      </Button>
      <Button size="sm" variant="ghost" className={`${h} text-xs`} onClick={onCancel}>
        Cancelar
      </Button>
    </div>
  )

  if (compact) {
    return <div className="py-1">{fields}</div>
  }

  return (
    <div className="border border-dashed border-border rounded-md p-3 space-y-2 bg-muted/20">
      <p className="text-xs font-medium text-muted-foreground">Adicionar escala</p>
      {fields}
    </div>
  )
}
