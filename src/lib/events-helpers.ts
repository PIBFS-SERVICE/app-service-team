import { format } from 'date-fns'

export function formatTime(time: string): string {
  return time.slice(0, 5).replace(':', 'h')
}

export function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export function getSectorIcon(sector: { url_icon: string | null; url_icon_master: string | null }) {
  return sector.url_icon || sector.url_icon_master
}

export function getNextUnmappedSunday(existingDates: string[]): string {
  const date = new Date()
  const day = date.getDay()
  date.setDate(date.getDate() + (day === 0 ? 7 : 7 - day))
  while (existingDates.includes(format(date, 'yyyy-MM-dd'))) {
    date.setDate(date.getDate() + 7)
  }
  return format(date, 'yyyy-MM-dd')
}
