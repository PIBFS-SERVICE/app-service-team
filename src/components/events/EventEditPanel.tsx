import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAllVolunteers, invalidateEvents, type EventWithDetails } from '@/hooks/use-events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShiftEditor } from './ShiftEditor'

interface EventEditPanelProps {
  event: EventWithDetails
  onClose: () => void
}

export function EventEditPanel({ event, onClose }: EventEditPanelProps) {
  const queryClient = useQueryClient()
  const { data: allVolunteers = [] } = useAllVolunteers()
  const [eventName, setEventName] = useState(event.name)
  const [eventDate, setEventDate] = useState(event.date)
  const [savingEvent, setSavingEvent] = useState(false)
  const [addingShift, setAddingShift] = useState(false)
  const [newShiftTime, setNewShiftTime] = useState('')
  const [addingShiftLoading, setAddingShiftLoading] = useState(false)

  const handleSaveEvent = async () => {
    if (!eventName.trim() || !eventDate) return
    setSavingEvent(true)
    const { error } = await supabase
      .from('event')
      .update({ name: eventName.trim(), date: eventDate })
      .eq('id', event.id)
    setSavingEvent(false)
    if (error) { toast.error(error.message); return }
    toast.success('Evento atualizado.')
    invalidateEvents(queryClient)
  }

  const handleAddShift = async () => {
    if (!newShiftTime) return
    setAddingShiftLoading(true)
    const { error } = await supabase.from('shifts').insert({
      event_id: event.id,
      scheduled_time: newShiftTime.length === 5 ? `${newShiftTime}:00` : newShiftTime,
      lider_id: null,
    })
    setAddingShiftLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Turno adicionado.')
    invalidateEvents(queryClient)
    setNewShiftTime('')
    setAddingShift(false)
  }

  return (
    <div className="flex flex-col h-full bg-card dark:bg-slate-900">
      <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
        <h2 className="text-sm font-semibold">Editar evento</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[160px]">
            <Label htmlFor="edit-name" className="text-xs">Nome</Label>
            <Input
              id="edit-name"
              value={eventName}
              onChange={e => setEventName(e.target.value)}
              className="h-8 text-xs mt-0.5"
            />
          </div>
          <div>
            <Label htmlFor="edit-date" className="text-xs">Data</Label>
            <Input
              id="edit-date"
              type="date"
              value={eventDate}
              onChange={e => setEventDate(e.target.value)}
              className="h-8 text-xs w-36 mt-0.5"
            />
          </div>
          <Button size="sm" className="h-8 text-xs" onClick={handleSaveEvent} disabled={savingEvent}>
            {savingEvent && <Loader2 size={12} className="animate-spin mr-1" />}
            Salvar evento
          </Button>
        </div>

        <div className="border-t border-border" />

        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Turnos ({event.shifts.length})
          </p>
          <div className="space-y-3">
            {event.shifts.map(shift => (
              <ShiftEditor key={shift.id} shift={shift} allVolunteers={allVolunteers} />
            ))}
          </div>
          {addingShift ? (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <div>
                <Label className="text-xs">Horário do turno</Label>
                <Input
                  type="time"
                  value={newShiftTime}
                  onChange={e => setNewShiftTime(e.target.value)}
                  className="h-8 text-xs w-32 mt-0.5"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleAddShift}
                  disabled={!newShiftTime || addingShiftLoading}
                >
                  {addingShiftLoading && <Loader2 size={12} className="animate-spin mr-1" />}
                  Adicionar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs"
                  onClick={() => { setAddingShift(false); setNewShiftTime('') }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingShift(true)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-3"
            >
              <Plus size={12} />
              Adicionar turno
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 h-14 px-4 border-t border-border shrink-0">
        <Button variant="secondary" size="sm" onClick={onClose}>Fechar</Button>
      </div>
    </div>
  )
}
