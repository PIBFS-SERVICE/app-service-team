import { useQuery } from '@tanstack/react-query'
import { Users, Layers, CalendarDays, UserCheck } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'
import type { EventDetails } from '@/hooks/use-schedules'
import { EventCard } from '@/components/EventCard'

// ─── Query ────────────────────────────────────────────────────────────────────

function useDashboardStats() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]

      const [volunteersRes, sectorsRes, eventsRes] = await Promise.all([
        supabase.from('volunteers').select('id', { count: 'exact', head: true }),
        supabase.from('sectors').select('id', { count: 'exact', head: true }),
        supabase
          .from('event')
          .select(`
            id, name, date,
            shifts (
              id, scheduled_time, lider_id,
              volunteers!shifts_lider_id_fkey ( id, name, avatar_url ),
              scales (
                id,
                volunteers ( id, name, avatar_url ),
                sectors ( id, name, slug, url_icon, url_icon_master )
              )
            )
          `)
          .gte('date', today)
          .order('date', { ascending: true })
          .limit(5),
      ])

      const upcomingEvents: EventDetails[] = ((eventsRes.data || []) as any[]).map(ev => ({
        id: ev.id,
        name: ev.name,
        date: ev.date,
        shifts: [...(ev.shifts || [])]
          .sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time))
          .map(shift => ({
            id: shift.id,
            scheduled_time: shift.scheduled_time,
            lider: shift.volunteers || null,
            scales: [...(shift.scales || [])]
              .sort((a, b) => a.sectors.name.localeCompare(b.sectors.name))
              .map(scale => ({
                id: scale.id,
                volunteer: scale.volunteers,
                sector: scale.sectors,
              })),
          })),
      }))

      const nextEvent = upcomingEvents[0] || null
      const nextEventScales = nextEvent
        ? nextEvent.shifts.flatMap(s => s.scales).length
        : 0

      return {
        totalVolunteers: volunteersRes.count ?? 0,
        totalSectors: sectorsRes.count ?? 0,
        nextEvent,
        nextEventScales,
        upcomingEvents,
      }
    },
  })
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  loading?: boolean
}) {
  return (
    <div className="border border-border rounded-md p-5 bg-card relative overflow-hidden">
      <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">{label}</p>
      {loading ? (
        <Skeleton className="h-8 w-24 mt-2" />
      ) : (
        <p className="text-3xl font-semibold mt-2">{value}</p>
      )}
      <Icon size={32} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-15" />
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { data, isLoading } = useDashboardStats()

  const nextEventLabel = data?.nextEvent
    ? format(parseISO(data.nextEvent.date), 'dd/MM/yyyy', { locale: ptBR })
    : '—'

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="sticky top-0 z-10 flex items-center h-14 px-6 border-b border-border bg-background">
        <h1 className="text-base font-semibold">Dashboard</h1>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total de voluntários"
            value={data?.totalVolunteers ?? 0}
            icon={Users}
            loading={isLoading}
          />
          <StatCard
            label="Total de setores"
            value={data?.totalSectors ?? 0}
            icon={Layers}
            loading={isLoading}
          />
          <StatCard
            label="Próximo evento"
            value={nextEventLabel}
            icon={CalendarDays}
            loading={isLoading}
          />
          <StatCard
            label="Escalados no próximo"
            value={data?.nextEventScales ?? 0}
            icon={UserCheck}
            loading={isLoading}
          />
        </div>

        <div className="border border-border rounded-md bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Próximos eventos</h2>
            <Link to="/admin/events" className="text-xs text-primary hover:underline">
              Ver todos
            </Link>
          </div>

          <div className="p-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 rounded-lg" />
                ))}
              </div>
            ) : data?.upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum evento próximo encontrado.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {data?.upcomingEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
