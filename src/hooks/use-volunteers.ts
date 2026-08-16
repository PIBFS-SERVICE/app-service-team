import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { VolunteerWithSectors } from '@/types/database';

async function fetchVolunteers(): Promise<VolunteerWithSectors[]> {
  const { data, error } = await supabase
    .from('volunteers')
    .select(`
      *,
      volunteer_sectors (
        *,
        sectors (*)
      )
    `)
    .order('name');

  if (error) throw error;
  return (data as VolunteerWithSectors[]) || [];
}

async function fetchVolunteerById(id: string): Promise<VolunteerWithSectors | null> {
  const { data, error } = await supabase
    .from('volunteers')
    .select(`
      *,
      volunteer_sectors (
        *,
        sectors (*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as VolunteerWithSectors;
}

export function useVolunteers() {
  return useQuery({
    queryKey: ['volunteers'],
    queryFn: fetchVolunteers,
    staleTime: 5 * 60 * 1000,
  });
}

export function useVolunteer(id: string) {
  return useQuery({
    queryKey: ['volunteer', id],
    queryFn: () => fetchVolunteerById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
