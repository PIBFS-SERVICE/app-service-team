import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Event } from '@/types/database'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScaleWithDetails {
  id: string
  volunteer_id: string
  sector_id: string
  volunteers: { id: string; name: string; avatar_url: string | null }
  sectors: { id: string; name: string; url_icon: string | null; url_icon_master: string | null }
}

export interface ShiftWithDetails {
  id: string
  scheduled_time: string
  lider_id: string | null
  volunteers: { id: string; name: string; avatar_url: string | null } | null
  scales: ScaleWithDetails[]
}

export interface EventWithDetails extends Event {
  shifts: ShiftWithDetails[]
}

export interface VolunteerForSelect {
  id: string
  name: string
  nickname: string | null
  avatar_url: string | null
}

export interface DraftScale {
  _id: string
  sector_id: string
  volunteer_id: string
  sector: { id: string; name: string; url_icon: string | null }
  volunteer: { id: string; name: string; avatar_url: string | null; nickname: string | null }
}

export interface DraftShift {
  _id: string
  scheduled_time: string
  lider_id: string
  scales: DraftScale[]
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useEvents() {
  return useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event')
        .select(`
          *,
          shifts (
            id, scheduled_time, lider_id,
            volunteers!shifts_lider_id_fkey ( id, name, avatar_url ),
            scales (
              id, volunteer_id, sector_id,
              volunteers ( id, name, avatar_url ),
              sectors ( id, name, url_icon, url_icon_master )
            )
          )
        `)
        .order('date', { ascending: false })
      if (error) throw error
      return (data as EventWithDetails[]).map(ev => ({
        ...ev,
        shifts: [...ev.shifts]
          .sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time))
          .map(shift => ({
            ...shift,
            scales: [...shift.scales].sort((a, b) => a.sectors.name.localeCompare(b.sectors.name)),
          })),
      }))
    },
  })
}

export function useAllVolunteers() {
  return useQuery({
    queryKey: ['admin-volunteers-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('volunteers')
        .select('id, name, nickname, avatar_url')
        .order('name')
      if (error) throw error
      return data as VolunteerForSelect[]
    },
  })
}

export function useVolunteersBySector(sectorId: string) {
  return useQuery({
    queryKey: ['volunteers-by-sector', sectorId],
    enabled: !!sectorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('volunteer_sectors')
        .select('volunteers ( id, name, nickname, avatar_url )')
        .eq('sector_id', sectorId)
      if (error) throw error
      return (data as unknown as { volunteers: VolunteerForSelect | null }[])
        .map(row => row.volunteers)
        .filter((v): v is VolunteerForSelect => v !== null)
    },
  })
}

export function invalidateEvents(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['admin-events'] })
  queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
}
