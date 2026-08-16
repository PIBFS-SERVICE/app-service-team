import { useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useEvents, invalidateEvents, type EventWithDetails } from '@/hooks/use-events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { EventListCard } from '@/components/events/EventListCard'
import { EventCreatePanel } from '@/components/events/EventCreatePanel'
import { EventEditPanel } from '@/components/events/EventEditPanel'

export default function Events() {
  const queryClient = useQueryClient()
  const { data: events = [], isLoading } = useEvents()

  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [panelMode, setPanelMode] = useState<'create' | 'edit' | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<EventWithDetails | null>(null)
  const [deleting, setDeleting] = useState(false)

  const existingDates = useMemo(() => events.map(e => e.date), [events])

  const filtered = useMemo(() => {
    return events.filter(e => {
      const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase())
      const matchFrom = !dateFrom || e.date >= dateFrom
      const matchTo = !dateTo || e.date <= dateTo
      return matchSearch && matchFrom && matchTo
    })
  }, [events, search, dateFrom, dateTo])

  const selectedFresh = useMemo(
    () => selected ? (events.find(e => e.id === selected.id) ?? selected) : null,
    [events, selected]
  )

  const handleDelete = async () => {
    if (!selected) return
    setDeleting(true)
    const { error } = await supabase.from('event').delete().eq('id', selected.id)
    setDeleting(false)
    if (error) { toast.error(error.message); return }
    toast.success('Evento excluído.')
    invalidateEvents(queryClient)
    setDeleteOpen(false)
    setSelected(null)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between h-14 px-6 border-b border-border bg-background shrink-0">
        <h1 className="text-base font-semibold">Eventos</h1>
        <Button size="sm" onClick={() => setPanelMode('create')}>
          <Plus size={14} className="mr-1" />
          Novo evento
        </Button>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0 overflow-y-auto p-6 space-y-4">
          <div className="flex gap-3 flex-wrap items-end">
            <Input
              placeholder="Buscar por título..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-56"
            />
            <div className="flex items-center gap-2">
              <div>
                <Label htmlFor="from" className="text-xs text-muted-foreground">De</Label>
                <Input
                  id="from"
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="w-36 mt-0.5"
                />
              </div>
              <div>
                <Label htmlFor="to" className="text-xs text-muted-foreground">Até</Label>
                <Input
                  id="to"
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="w-36 mt-0.5"
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar size={40} className="text-muted-foreground opacity-30 mb-3" />
              <p className="text-sm font-medium">Nenhum evento encontrado</p>
              <p className="text-xs text-muted-foreground mt-1">
                Crie o primeiro clicando em "Novo evento".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
              {filtered.map(event => (
                <EventListCard
                  key={event.id}
                  event={event}
                  onEdit={() => { setSelected(event); setPanelMode('edit') }}
                  onDelete={() => { setSelected(event); setDeleteOpen(true) }}
                />
              ))}
            </div>
          )}
        </div>

        <AnimatePresence>
          {panelMode && (
            <motion.aside
              initial={{ x: 440, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 440, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="w-[440px] max-w-[90vw] shrink-0 border-l border-border bg-background overflow-hidden"
            >
              {panelMode === 'create' && (
                <EventCreatePanel
                  onClose={() => setPanelMode(null)}
                  existingDates={existingDates}
                />
              )}
              {panelMode === 'edit' && selectedFresh && (
                <EventEditPanel
                  key={selectedFresh.id}
                  event={selectedFresh}
                  onClose={() => { setPanelMode(null); setSelected(null) }}
                />
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <ConfirmDeleteDialog
        title="Excluir evento"
        open={deleteOpen}
        name={selected?.name || ''}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteOpen(false); setSelected(null) }}
      />
    </div>
  )
}
