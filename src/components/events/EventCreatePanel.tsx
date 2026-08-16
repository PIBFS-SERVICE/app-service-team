import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { UNASSIGNED_VOLUNTEER_ID, UNASSIGNED_VOLUNTEER_NAME } from '@/lib/constants'
import { getNextUnmappedSunday } from '@/lib/events-helpers'
import { useSectors } from '@/hooks/use-sectors'
import { useEventTemplate } from '@/hooks/use-event-template'
import { useAllVolunteers, invalidateEvents, type DraftShift } from '@/hooks/use-events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { DraftShiftPanel } from './DraftShiftPanel'

interface EventCreatePanelProps {
  onClose: () => void
  existingDates: string[]
}

const FALLBACK_SHIFTS: DraftShift[] = [
  { _id: crypto.randomUUID(), scheduled_time: '10:00', lider_id: '', scales: [] },
  { _id: crypto.randomUUID(), scheduled_time: '18:30', lider_id: '', scales: [] },
]

export function EventCreatePanel({ onClose, existingDates }: EventCreatePanelProps) {
  const queryClient = useQueryClient()
  const { data: sectors = [] } = useSectors()
  const { data: allVolunteers = [] } = useAllVolunteers()
  const { data: template, isLoading: templateLoading } = useEventTemplate()

  const [name, setName] = useState('')
  const [date, setDate] = useState(() => getNextUnmappedSunday(existingDates))
  const [draftShifts, setDraftShifts] = useState<DraftShift[] | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (draftShifts !== null || templateLoading) return

    if (template && template.shifts.length > 0) {
      setName(template.defaultEventName)
      setDraftShifts(
        template.shifts.map(templateShift => ({
          _id: crypto.randomUUID(),
          scheduled_time: templateShift.scheduled_time.slice(0, 5),
          lider_id: '',
          scales: templateShift.sectors.map(sector => ({
            _id: crypto.randomUUID(),
            sector_id: sector.id,
            volunteer_id: UNASSIGNED_VOLUNTEER_ID,
            sector: { id: sector.id, name: sector.name, url_icon: sector.url_icon },
            volunteer: {
              id: UNASSIGNED_VOLUNTEER_ID,
              name: UNASSIGNED_VOLUNTEER_NAME,
              avatar_url: null,
              nickname: null,
            },
          })),
        }))
      )
    } else {
      setName(template?.defaultEventName || 'Culto de Domingo')
      setDraftShifts(FALLBACK_SHIFTS)
    }
  }, [templateLoading, template, draftShifts])

  const handleCreate = async () => {
    if (!name.trim() || !date || !draftShifts) return
    setSaving(true)

    const { data: ev, error: evError } = await supabase
      .from('event')
      .insert({ name: name.trim(), date, type: 'culto' })
      .select('id')
      .single()

    if (evError) { toast.error(evError.message); setSaving(false); return }

    const shiftResults = await Promise.all(
      draftShifts.map(s =>
        supabase.from('shifts').insert({
          event_id: ev.id,
          scheduled_time: s.scheduled_time.length === 5 ? `${s.scheduled_time}:00` : s.scheduled_time,
          lider_id: s.lider_id || null,
        }).select('id').single()
      )
    )

    const allScales = shiftResults.flatMap((res, i) => {
      if (res.error) return []
      return draftShifts[i].scales.map(sc => ({
        shift_id: res.data.id,
        volunteer_id: sc.volunteer_id,
        sector_id: sc.sector_id,
      }))
    })

    if (allScales.length > 0) {
      const { error: scErr } = await supabase.from('scales').insert(allScales)
      if (scErr) toast.error(`Escalas: ${scErr.message}`)
    }

    setSaving(false)
    invalidateEvents(queryClient)
    toast.success('Evento criado.')
    onClose()
  }

  return (
    <div className="flex flex-col h-full bg-card dark:bg-slate-900">
      <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
        <h2 className="text-sm font-semibold">Novo evento</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </div>

      {draftShifts === null ? (
        <div className="flex-1 p-4 space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-[160px]">
              <Label htmlFor="c-name" className="text-xs">Nome</Label>
              <Input
                id="c-name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="h-8 text-xs mt-0.5"
              />
            </div>
            <div>
              <Label htmlFor="c-date" className="text-xs">Data</Label>
              <Input
                id="c-date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="h-8 text-xs w-36 mt-0.5"
              />
            </div>
          </div>

          <div className="border-t border-border" />

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Turnos ({draftShifts.length})
            </p>
            <div className="space-y-3">
              {draftShifts.map(shift => (
                <DraftShiftPanel
                  key={shift._id}
                  shift={shift}
                  allVolunteers={allVolunteers}
                  sectors={sectors}
                  onChange={updated =>
                    setDraftShifts(prev => (prev ?? []).map(s => s._id === updated._id ? updated : s))
                  }
                  onRemove={() => setDraftShifts(prev => (prev ?? []).filter(s => s._id !== shift._id))}
                />
              ))}
            </div>
            <button
              onClick={() =>
                setDraftShifts(prev => [
                  ...(prev ?? []),
                  { _id: crypto.randomUUID(), scheduled_time: '', lider_id: '', scales: [] },
                ])
              }
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-3"
            >
              <Plus size={12} />
              Adicionar turno
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 h-14 px-4 border-t border-border shrink-0">
        <Button variant="secondary" size="sm" onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button size="sm" onClick={handleCreate} disabled={!name.trim() || !date || !draftShifts || saving}>
          {saving && <Loader2 size={12} className="animate-spin mr-1" />}
          Criar evento
        </Button>
      </div>
    </div>
  )
}
