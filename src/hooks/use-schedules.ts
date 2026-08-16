import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ScaleDetails {
  id: string;
  volunteer: { id: string; name: string; avatar_url: string | null };
  sector: { id: string; name: string; slug: string; url_icon: string | null; url_icon_master: string | null };
}

export interface ShiftDetails {
  id: string;
  scheduled_time: string;
  lider: { id: string; name: string; avatar_url: string | null } | null;
  scales: ScaleDetails[];
}

export interface EventDetails {
  id: string;
  name: string;
  date: string;
  shifts: ShiftDetails[];
}

export function useSchedules() {
  return useQuery({
    queryKey: ['schedules'],
    queryFn: async (): Promise<EventDetails[]> => {
      const { data, error } = await supabase
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
        .order('date', { ascending: true });

      if (error) throw error;

      return ((data || []) as any[]).map(ev => ({
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
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}
