#!/usr/bin/env node
// Dumps the event template (turnos/setores fixos), o roster elegível por setor
// e as últimas N escalas de 'culto' em JSON, para servir de contexto a um
// agente (humano ou LLM) que vai gerar as próximas escalas recorrentes.
//
// Uso: node scripts/fetch-recent-scales.mjs [quantidade=5]

import { createClient } from '@supabase/supabase-js'

try {
  process.loadEnvFile(new URL('../.env', import.meta.url))
} catch {
  // sem .env local (ex: CI) — assume que as env vars já estão no ambiente
}

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltam VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY no ambiente.')
  process.exit(1)
}

const limit = Number(process.argv[2]) || 5
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function main() {
  const [templateShiftsRes, templateSettingsRes, volunteerSectorsRes, eventsRes] = await Promise.all([
    supabase
      .from('event_template_shifts')
      .select('id, scheduled_time, sort_order, event_template_sectors ( sectors ( id, name, slug ) )')
      .order('sort_order', { ascending: true }),
    supabase.from('event_template_settings').select('default_event_name').limit(1).maybeSingle(),
    supabase
      .from('volunteer_sectors')
      .select('sector_id, proficiency_status, is_active_in_sector, volunteers ( id, name, nickname )'),
    supabase
      .from('event')
      .select(
        `id, name, date, type,
         shifts (
           id, scheduled_time,
           lider:volunteers ( id, name, nickname ),
           scales (
             id,
             volunteer:volunteers ( id, name, nickname ),
             sector:sectors ( id, name, slug )
           )
         )`
      )
      .eq('type', 'culto')
      .order('date', { ascending: false })
      .limit(limit),
  ])

  for (const [label, res] of Object.entries({
    templateShifts: templateShiftsRes,
    templateSettings: templateSettingsRes,
    volunteerSectors: volunteerSectorsRes,
    events: eventsRes,
  })) {
    if (res.error) {
      console.error(`Erro consultando ${label}:`, res.error.message)
      process.exit(1)
    }
  }

  const template = {
    defaultEventName: templateSettingsRes.data?.default_event_name || 'Culto de Domingo',
    shifts: templateShiftsRes.data.map(s => ({
      scheduled_time: s.scheduled_time,
      sort_order: s.sort_order,
      sectors: s.event_template_sectors.map(r => r.sectors),
    })),
  }

  const rosterBySector = {}
  for (const row of volunteerSectorsRes.data) {
    const key = row.sector_id
    rosterBySector[key] ??= []
    rosterBySector[key].push({
      volunteer: row.volunteers,
      proficiency_status: row.proficiency_status,
      is_active_in_sector: row.is_active_in_sector,
    })
  }

  const recentEvents = eventsRes.data
    .slice()
    .reverse() // ordem cronológica: mais antigo -> mais recente
    .map(ev => ({
      date: ev.date,
      name: ev.name,
      shifts: ev.shifts
        .slice()
        .sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time))
        .map(sh => ({
          scheduled_time: sh.scheduled_time,
          lider: sh.lider,
          scales: sh.scales.map(sc => ({ sector: sc.sector, volunteer: sc.volunteer })),
        })),
    }))

  console.log(JSON.stringify({ template, rosterBySector, recentEvents }, null, 2))
}

main()
