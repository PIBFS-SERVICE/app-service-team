import { useState } from 'react'
import { Copy, Plus, Trash2 } from 'lucide-react'
import type { Sector } from '@/types/database'
import type { DraftShift, VolunteerForSelect } from '@/hooks/use-events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { VolunteerCombobox } from './VolunteerCombobox'
import { ScaleRow } from './ScaleRow'
import { ScaleForm } from './ScaleForm'

interface DraftShiftPanelProps {
  shift: DraftShift
  allVolunteers: VolunteerForSelect[]
  sectors: Sector[]
  onChange: (updated: DraftShift) => void
  onRemove: () => void
  onDuplicate: () => void
}

export function DraftShiftPanel({ shift, allVolunteers, sectors, onChange, onRemove, onDuplicate }: DraftShiftPanelProps) {
  const [addingScale, setAddingScale] = useState(false)
  const [editingScaleId, setEditingScaleId] = useState<string | null>(null)

  return (
    <div className="border border-border rounded-md p-3 space-y-3">
      <div className="flex items-end gap-2 flex-wrap">
        <div>
          <Label className="text-xs">Horário</Label>
          <Input
            type="time"
            value={shift.scheduled_time}
            onChange={e => onChange({ ...shift, scheduled_time: e.target.value })}
            className="h-8 text-xs w-32 mt-0.5"
          />
        </div>

        <div>
          <Label className="text-xs">Líder</Label>
          <VolunteerCombobox
            volunteers={allVolunteers}
            value={shift.lider_id}
            onChange={id => onChange({ ...shift, lider_id: id })}
            allowNone
            noneLabel="Sem líder"
            searchPlaceholder="Buscar líder..."
            triggerClassName="mt-0.5"
          />
        </div>

        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground mt-auto ml-auto"
          onClick={onDuplicate}
          aria-label="Duplicar turno"
          title="Duplicar turno"
        >
          <Copy size={14} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 mt-auto"
          onClick={onRemove}
        >
          <Trash2 size={12} className="mr-1" />
          Remover
        </Button>
      </div>

      <div>
        <p className="text-xs text-muted-foreground font-medium mb-1">Escalas ({shift.scales.length})</p>
        {shift.scales.length > 0 && (
          <div className="space-y-0.5 mb-2">
            {shift.scales.map(scale => (
              <ScaleRow
                key={scale._id}
                volunteer={scale.volunteer}
                sector={scale.sector}
                iconUrl={scale.sector.url_icon}
                sectors={sectors}
                existingVolunteerIds={shift.scales
                  .filter(s => s._id !== scale._id)
                  .map(s => s.volunteer_id)}
                isEditing={editingScaleId === scale._id}
                onEditRequest={editingScaleId ? undefined : () => setEditingScaleId(scale._id)}
                onEditSave={(sectorId, volunteer) => {
                  const sector = sectors.find(s => s.id === sectorId)
                  if (!sector) return
                  onChange({
                    ...shift,
                    scales: shift.scales.map(s =>
                      s._id === scale._id
                        ? {
                            ...s,
                            sector_id: sector.id,
                            volunteer_id: volunteer.id,
                            sector: { id: sector.id, name: sector.name, url_icon: sector.url_icon },
                            volunteer: {
                              id: volunteer.id,
                              name: volunteer.name,
                              avatar_url: volunteer.avatar_url,
                              nickname: volunteer.nickname,
                            },
                          }
                        : s
                    ),
                  })
                  setEditingScaleId(null)
                }}
                onEditCancel={() => setEditingScaleId(null)}
                onRemove={editingScaleId ? undefined : () =>
                  onChange({ ...shift, scales: shift.scales.filter(s => s._id !== scale._id) })
                }
              />
            ))}
          </div>
        )}
        {addingScale ? (
          <ScaleForm
            sectors={sectors}
            existingVolunteerIds={shift.scales.map(s => s.volunteer_id)}
            submitLabel="Adicionar"
            onSubmit={(sectorId, volunteer) => {
              const sector = sectors.find(s => s.id === sectorId)
              if (!sector) return
              onChange({
                ...shift,
                scales: [
                  ...shift.scales,
                  {
                    _id: crypto.randomUUID(),
                    sector_id: sector.id,
                    volunteer_id: volunteer.id,
                    sector: { id: sector.id, name: sector.name, url_icon: sector.url_icon },
                    volunteer: {
                      id: volunteer.id,
                      name: volunteer.name,
                      avatar_url: volunteer.avatar_url,
                      nickname: volunteer.nickname,
                    },
                  },
                ],
              })
              setAddingScale(false)
            }}
            onCancel={() => setAddingScale(false)}
          />
        ) : (
          <button
            onClick={() => setAddingScale(true)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
          >
            <Plus size={12} />
            Adicionar escala
          </button>
        )}
      </div>
    </div>
  )
}
