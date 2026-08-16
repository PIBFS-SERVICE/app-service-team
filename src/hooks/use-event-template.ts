import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Sector } from '@/types/database'

export interface TemplateShift {
  id: string
  scheduled_time: string
  sort_order: number
  sectors: Sector[]
}

export interface EventTemplate {
  defaultEventName: string
  shifts: TemplateShift[]
}

interface RawTemplateShiftRow {
  id: string
  scheduled_time: string
  sort_order: number
  event_template_sectors: { sectors: Sector }[]
}

export function useEventTemplate() {
  return useQuery({
    queryKey: ['event-template'],
    queryFn: async (): Promise<EventTemplate> => {
      const [shiftsRes, settingsRes] = await Promise.all([
        supabase
          .from('event_template_shifts')
          .select('id, scheduled_time, sort_order, event_template_sectors ( sectors (*) )')
          .order('sort_order', { ascending: true }),
        supabase.from('event_template_settings').select('*').limit(1).maybeSingle(),
      ])

      if (shiftsRes.error) throw shiftsRes.error
      if (settingsRes.error) throw settingsRes.error

      const shifts = (shiftsRes.data as unknown as RawTemplateShiftRow[]).map(row => ({
        id: row.id,
        scheduled_time: row.scheduled_time,
        sort_order: row.sort_order,
        sectors: row.event_template_sectors.map(r => r.sectors),
      }))

      return {
        defaultEventName: settingsRes.data?.default_event_name || 'Culto de Domingo',
        shifts,
      }
    },
  })
}

export interface TemplateShiftInput {
  scheduled_time: string
  sector_ids: string[]
}

export async function saveEventTemplate(defaultEventName: string, shifts: TemplateShiftInput[]) {
  const { error: settingsDelError } = await supabase
    .from('event_template_settings')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  if (settingsDelError) throw settingsDelError

  const { error: settingsInsError } = await supabase
    .from('event_template_settings')
    .insert({ default_event_name: defaultEventName })
  if (settingsInsError) throw settingsInsError

  const { error: shiftsDelError } = await supabase
    .from('event_template_shifts')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  if (shiftsDelError) throw shiftsDelError

  if (shifts.length === 0) return

  const { data: inserted, error: shiftsInsError } = await supabase
    .from('event_template_shifts')
    .insert(
      shifts.map((s, i) => ({
        scheduled_time: s.scheduled_time.length === 5 ? `${s.scheduled_time}:00` : s.scheduled_time,
        sort_order: i,
      }))
    )
    .select('id')
  if (shiftsInsError) throw shiftsInsError

  const sectorRows = shifts.flatMap((s, i) =>
    s.sector_ids.map(sector_id => ({ template_shift_id: inserted[i].id, sector_id }))
  )
  if (sectorRows.length > 0) {
    const { error: sectorsInsError } = await supabase.from('event_template_sectors').insert(sectorRows)
    if (sectorsInsError) throw sectorsInsError
  }
}
