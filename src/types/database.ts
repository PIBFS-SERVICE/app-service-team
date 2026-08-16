export type ProficiencyStatus = 'apprentice' | 'knowledgeable' | 'master';

export interface Volunteer {
  id: string;
  name: string;
  nickname: string | null;
  ministry_entry_date: string;
  contact_phone: string | null;
  avatar_url: string | null;
  updated_at: string;
  created_at: string;
}

export interface Sector {
  id: string;
  name: string;
  slug: string;
  url_icon: string | null;
  url_icon_apprentice: string | null;
  url_icon_knowledgeable: string | null;
  url_icon_master: string | null;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  type: string;
  updated_at: string;
  created_at: string;
}

export interface Shift {
  id: string;
  event_id: string;
  lider_id: string | null;
  scheduled_time: string;
  updated_at: string;
  created_at: string;
}

export interface Scale {
  id: string;
  shift_id: string;
  volunteer_id: string;
  sector_id: string;
  updated_at: string;
  created_at: string;
}

export interface EventTemplateShift {
  id: string;
  scheduled_time: string;
  sort_order: number;
  updated_at: string;
  created_at: string;
}

export interface EventTemplateSector {
  id: string;
  template_shift_id: string;
  sector_id: string;
  created_at: string;
}

export interface EventTemplateSettings {
  id: string;
  default_event_name: string;
  updated_at: string;
  created_at: string;
}

export interface VolunteerSector {
  id: string;
  volunteer_id: string;
  sector_id: string;
  is_active_in_sector: boolean;
  proficiency_status: ProficiencyStatus;
  created_at: string;
}

export interface VolunteerWithSectors extends Volunteer {
  volunteer_sectors: (VolunteerSector & { sectors: Sector })[];
}

// Lambda API types
export interface ScheduleShift {
  turno: string;
  supervisorTurno: string;
  ministerios: Record<string, string>;
}

export interface ScheduleEntry {
  data: string;
  turnos: ScheduleShift[];
}

export interface ScheduleStats {
  proximaEscala: {
    data: string;
  };
}

export interface ScheduleData {
  escalas: ScheduleEntry[];
  estatisticas: ScheduleStats;
}
