import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Copy, Plus, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useSectors } from '@/hooks/use-sectors'
import { invalidateEvents, type ShiftWithDetails, type VolunteerForSelect } from '@/hooks/use-events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { VolunteerCombobox } from './VolunteerCombobox'
import { ScaleRow } from './ScaleRow'
import { ScaleForm } from './ScaleForm'

interface ShiftEditorProps {
  shift: ShiftWithDetails
  eventId: string
  allVolunteers: VolunteerForSelect[]
}

export function ShiftEditor({ shift, eventId, allVolunteers }: ShiftEditorProps) {
  const queryClient = useQueryClient()
  const { data: sectors = [] } = useSectors()
  const [shiftTime, setShiftTime] = useState(shift.scheduled_time.slice(0, 5))
  const [leaderId, setLeaderId] = useState(shift.lider_id || '')
  const [savingShift, setSavingShift] = useState(false)
  const [deletingShift, setDeletingShift] = useState(false)
  const [duplicatingShift, setDuplicatingShift] = useState(false)
  const [deletingScaleId, setDeletingScaleId] = useState<string | null>(null)
  const [editingScaleId, setEditingScaleId] = useState<string | null>(null)
  const [savingScaleId, setSavingScaleId] = useState<string | null>(null)
  const [addingScale, setAddingScale] = useState(false)
  const [addingScaleLoading, setAddingScaleLoading] = useState(false)

  const handleSaveShift = async () => {
    setSavingShift(true)
    const { error } = await supabase
      .from('shifts')
      .update({
        scheduled_time: shiftTime.length === 5 ? `${shiftTime}:00` : shiftTime,
        lider_id: leaderId || null,
      })
      .eq('id', shift.id)
    setSavingShift(false)
    if (error) { toast.error(error.message); return }
    toast.success('Turno salvo.')
    invalidateEvents(queryClient)
  }

  const handleDuplicateShift = async () => {
    setDuplicatingShift(true)
    const { data: newShift, error } = await supabase
      .from('shifts')
      .insert({
        event_id: eventId,
        scheduled_time: shift.scheduled_time,
        lider_id: shift.lider_id,
      })
      .select('id')
      .single()

    if (error) { toast.error(error.message); setDuplicatingShift(false); return }

    if (shift.scales.length > 0) {
      const { error: scErr } = await supabase.from('scales').insert(
        shift.scales.map(sc => ({
          shift_id: newShift.id,
          volunteer_id: sc.volunteer_id,
          sector_id: sc.sector_id,
        }))
      )
      if (scErr) toast.error(`Escalas: ${scErr.message}`)
    }

    setDuplicatingShift(false)
    toast.success('Turno duplicado.')
    invalidateEvents(queryClient)
  }

  const handleDeleteShift = async () => {
    setDeletingShift(true)
    const { error } = await supabase.from('shifts').delete().eq('id', shift.id)
    setDeletingShift(false)
    if (error) { toast.error(error.message); return }
    toast.success('Turno excluído.')
    invalidateEvents(queryClient)
  }

  const handleDeleteScale = async (scaleId: string) => {
    setDeletingScaleId(scaleId)
    const { error } = await supabase.from('scales').delete().eq('id', scaleId)
    setDeletingScaleId(null)
    if (error) { toast.error(error.message); return }
    toast.success('Escala removida.')
    invalidateEvents(queryClient)
  }

  const handleEditScale = async (scaleId: string, sectorId: string, volunteerId: string) => {
    setSavingScaleId(scaleId)
    const { error } = await supabase
      .from('scales')
      .update({ sector_id: sectorId, volunteer_id: volunteerId })
      .eq('id', scaleId)
    setSavingScaleId(null)
    if (error) { toast.error(error.message); return }
    toast.success('Escala atualizada.')
    setEditingScaleId(null)
    invalidateEvents(queryClient)
  }

  const handleAddScale = async (sectorId: string, volunteer: VolunteerForSelect) => {
    setAddingScaleLoading(true)
    const { error } = await supabase.from('scales').insert({
      shift_id: shift.id,
      sector_id: sectorId,
      volunteer_id: volunteer.id,
    })
    setAddingScaleLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Escala adicionada.')
    invalidateEvents(queryClient)
    setAddingScale(false)
  }

  return (
    <div className="border border-border rounded-md p-3 space-y-3">
      <div className="flex items-end gap-2 flex-wrap">
        <div>
          <Label className="text-xs">Horário</Label>
          <Input
            type="time"
            value={shiftTime}
            onChange={e => setShiftTime(e.target.value)}
            className="h-8 text-xs w-32 mt-0.5"
          />
        </div>

        <div>
          <Label className="text-xs">Líder</Label>
          <VolunteerCombobox
            volunteers={allVolunteers}
            value={leaderId}
            onChange={setLeaderId}
            allowNone
            noneLabel="Sem líder"
            searchPlaceholder="Buscar líder..."
            triggerClassName="mt-0.5"
          />
        </div>

        <Button size="sm" className="h-8 text-xs" onClick={handleSaveShift} disabled={savingShift}>
          {savingShift && <Loader2 size={12} className="animate-spin mr-1" />}
          Salvar turno
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground ml-auto"
          onClick={handleDuplicateShift}
          disabled={duplicatingShift}
          aria-label="Duplicar turno"
          title="Duplicar turno"
        >
          {duplicatingShift ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleDeleteShift}
          disabled={deletingShift}
        >
          {deletingShift
            ? <Loader2 size={12} className="animate-spin mr-1" />
            : <Trash2 size={12} className="mr-1" />}
          Excluir turno
        </Button>
      </div>

      <div>
        <p className="text-xs text-muted-foreground font-medium mb-1">
          Escalas ({shift.scales.length})
        </p>
        {shift.scales.length > 0 && (
          <div className="space-y-0.5 mb-2">
            {shift.scales.map(scale => (
              <ScaleRow
                key={scale.id}
                volunteer={scale.volunteers}
                sector={scale.sectors}
                iconUrl={scale.sectors.url_icon}
                sectors={sectors}
                isEditing={editingScaleId === scale.id}
                savingEdit={savingScaleId === scale.id}
                onEditRequest={editingScaleId ? undefined : () => setEditingScaleId(scale.id)}
                onEditSave={(sectorId, volunteer) => handleEditScale(scale.id, sectorId, volunteer.id)}
                onEditCancel={() => setEditingScaleId(null)}
                onRemove={editingScaleId ? undefined : () => handleDeleteScale(scale.id)}
                removing={deletingScaleId === scale.id}
              />
            ))}
          </div>
        )}
        {addingScale ? (
          <ScaleForm
            sectors={sectors}
            existingVolunteerIds={shift.scales.map(s => s.volunteer_id)}
            submitLabel="Adicionar"
            submitting={addingScaleLoading}
            onSubmit={handleAddScale}
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
