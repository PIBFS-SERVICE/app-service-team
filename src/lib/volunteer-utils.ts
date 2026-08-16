export function getMinistryTime(entryDate: string) {
  const entry = new Date(entryDate);
  const now = new Date();
  let years = now.getFullYear() - entry.getFullYear();
  let months = now.getMonth() - entry.getMonth();
  let days = now.getDate() - entry.getDate();
  if (days < 0) { months--; days += 30; }
  if (months < 0) { years--; months += 12; }
  return `${String(years).padStart(2, '0')}:${String(months).padStart(2, '0')}:${String(days).padStart(2, '0')}`;
}

export function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

export function getProficiencyIcon(vs: {
  proficiency_status: string;
  sectors: { url_icon_apprentice: string | null; url_icon_knowledgeable: string | null; url_icon_master: string | null };
}) {
  switch (vs.proficiency_status) {
    case 'master': return vs.sectors.url_icon_master;
    case 'knowledgeable': return vs.sectors.url_icon_knowledgeable;
    default: return vs.sectors.url_icon_apprentice;
  }
}

export const MINISTRY_LABELS: Record<string, string> = {
  projecao: "Projeção",
  transmissao: "Transmissão",
  fotografia: "Fotos",
  stories: "Stories",
  sonoplastaPa: "Sonoplasta .PA",
  sonoplastaLive: "Sonoplasta .Live",
};

export function getMinistryLabel(ministry: string) {
  return MINISTRY_LABELS[ministry] || ministry;
}

export function getCurrentDateFormatted() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
}

export function getTodayISODate() {
  return new Date().toISOString().split('T')[0];
}
