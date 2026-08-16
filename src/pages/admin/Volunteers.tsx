import { useState, useMemo, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, parseISO } from 'date-fns'
import { Plus, Edit2, Eye, Trash2, Loader2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { VolunteerWithSectors, Sector, ProficiencyStatus } from '@/types/database'
import { ImageUpload } from '@/components/ImageUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

// ─── Constants ───────────────────────────────────────────────────────────────

const PROFICIENCY_LABELS: Record<ProficiencyStatus, string> = {
  apprentice: 'Aprendiz',
  knowledgeable: 'Conhecedor',
  master: 'Mestre',
}

const PROFICIENCY_CLASSES: Record<ProficiencyStatus, string> = {
  apprentice: 'bg-amber-100 text-amber-800',
  knowledgeable: 'bg-blue-100 text-blue-800',
  master: 'bg-green-100 text-green-800',
}

// ─── Queries ─────────────────────────────────────────────────────────────────

function useVolunteersAdmin() {
  return useQuery({
    queryKey: ['admin-volunteers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('volunteers')
        .select(`
          *,
          volunteer_sectors (
            id, volunteer_id, sector_id, proficiency_status, is_active_in_sector, created_at,
            sectors ( id, name, slug, url_icon_apprentice, url_icon_knowledgeable, url_icon_master )
          )
        `)
        .order('name')
      if (error) throw error
      return data as VolunteerWithSectors[]
    },
  })
}

function useSectors() {
  return useQuery({
    queryKey: ['admin-sectors-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('sectors').select('*').order('name')
      if (error) throw error
      return data as Sector[]
    },
  })
}

// ─── Form schemas ─────────────────────────────────────────────────────────────

const volunteerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  nickname: z.string().optional(),
  ministry_entry_date: z.string().min(1, 'Data de entrada é obrigatória'),
  contact_phone: z.string().optional(),
})

type VolunteerFormValues = z.infer<typeof volunteerSchema>

// ─── Helper ───────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

// ─── Volunteer Form Modal ─────────────────────────────────────────────────────

interface VolunteerFormModalProps {
  volunteer: VolunteerWithSectors | null
  open: boolean
  onClose: () => void
}

function VolunteerFormModal({ volunteer, open, onClose }: VolunteerFormModalProps) {
  const queryClient = useQueryClient()
  const { data: allSectors = [] } = useSectors()
  const [sectorLinks, setSectorLinks] = useState<
    { sector_id: string; proficiency_status: ProficiencyStatus; is_active_in_sector: boolean; id?: string }[]
  >([])
  const [addingSector, setAddingSector] = useState(false)
  const [newSectorId, setNewSectorId] = useState('')
  const [newProficiency, setNewProficiency] = useState<ProficiencyStatus>('apprentice')
  const [newIsPrimary, setNewIsPrimary] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const isEdit = !!volunteer

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VolunteerFormValues>({ resolver: zodResolver(volunteerSchema) })

  useEffect(() => {
    if (!open) return
    if (volunteer) {
      reset({
        name: volunteer.name,
        nickname: volunteer.nickname || '',
        ministry_entry_date: volunteer.ministry_entry_date,
        contact_phone: volunteer.contact_phone || '',
      })
      setAvatarUrl(volunteer.avatar_url || null)
      setSectorLinks(
        volunteer.volunteer_sectors.map((vs) => ({
          id: vs.id,
          sector_id: vs.sector_id,
          proficiency_status: vs.proficiency_status,
          is_active_in_sector: vs.is_active_in_sector,
        }))
      )
    } else {
      reset({ name: '', nickname: '', ministry_entry_date: '', contact_phone: '' })
      setAvatarUrl(null)
      setSectorLinks([])
    }
    setAddingSector(false)
  }, [open, volunteer])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('contact_phone', formatPhone(e.target.value))
  }

  const handleAddSectorLink = () => {
    if (!newSectorId) return
    setSectorLinks((prev) => [
      ...prev,
      { sector_id: newSectorId, proficiency_status: newProficiency, is_active_in_sector: newIsPrimary },
    ])
    setNewSectorId('')
    setNewProficiency('apprentice')
    setNewIsPrimary(false)
    setAddingSector(false)
  }

  const handleRemoveSectorLink = (idx: number) => {
    setSectorLinks((prev) => prev.filter((_, i) => i !== idx))
  }

  const onSubmit = async (values: VolunteerFormValues) => {
    const payload = {
      name: values.name,
      nickname: values.nickname || null,
      ministry_entry_date: values.ministry_entry_date,
      contact_phone: values.contact_phone || null,
      avatar_url: avatarUrl,
    }

    let volunteerId = volunteer?.id

    if (isEdit && volunteerId) {
      const { error } = await supabase.from('volunteers').update(payload).eq('id', volunteerId)
      if (error) { toast.error(error.message); return }
    } else {
      const { data, error } = await supabase.from('volunteers').insert(payload).select('id').single()
      if (error) { toast.error(error.message); return }
      volunteerId = data.id
    }

    // Sync sector links
    if (isEdit) {
      await supabase.from('volunteer_sectors').delete().eq('volunteer_id', volunteerId!)
    }
    if (sectorLinks.length > 0) {
      const { error } = await supabase.from('volunteer_sectors').insert(
        sectorLinks.map((l) => ({
          volunteer_id: volunteerId,
          sector_id: l.sector_id,
          proficiency_status: l.proficiency_status,
          is_active_in_sector: l.is_active_in_sector,
        }))
      )
      if (error) { toast.error(error.message); return }
    }

    toast.success(isEdit ? 'Voluntário atualizado.' : 'Voluntário criado com sucesso.')
    queryClient.invalidateQueries({ queryKey: ['admin-volunteers'] })
    onClose()
  }

  const availableSectors = allSectors.filter(
    (s) => !sectorLinks.some((l) => l.sector_id === s.id)
  )

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar voluntário' : 'Novo voluntário'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="v-name">Nome *</Label>
              <Input id="v-name" {...register('name')} className="mt-1" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="v-nickname">Apelido</Label>
              <Input id="v-nickname" {...register('nickname')} className="mt-1" />
            </div>

            <div>
              <Label htmlFor="v-date">Data de entrada *</Label>
              <Input id="v-date" type="date" {...register('ministry_entry_date')} className="mt-1" />
              {errors.ministry_entry_date && (
                <p className="text-xs text-destructive mt-1">{errors.ministry_entry_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="v-phone">Telefone</Label>
              <Input
                id="v-phone"
                type="tel"
                placeholder="(00) 00000-0000"
                {...register('contact_phone')}
                onChange={handlePhoneChange}
                className="mt-1"
              />
            </div>

            <div className="col-span-2">
              <ImageUpload
                bucket="avatars"
                value={avatarUrl}
                onChange={setAvatarUrl}
                label="Avatar"
              />
            </div>
          </div>

          {/* Sector links */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Setores vinculados</Label>
              {availableSectors.length > 0 && (
                <button
                  type="button"
                  onClick={() => setAddingSector(true)}
                  className="text-xs text-primary hover:underline"
                >
                  + Vincular setor
                </button>
              )}
            </div>

            {sectorLinks.length === 0 && !addingSector && (
              <p className="text-xs text-muted-foreground">Nenhum setor vinculado.</p>
            )}

            <div className="space-y-1">
              {sectorLinks.map((link, idx) => {
                const sector = allSectors.find((s) => s.id === link.sector_id)
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{sector?.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-mono ${PROFICIENCY_CLASSES[link.proficiency_status]}`}>
                        {PROFICIENCY_LABELS[link.proficiency_status]}
                      </span>
                      {link.is_active_in_sector && (
                        <span className="text-xs text-muted-foreground">Área principal</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSectorLink(idx)}
                      aria-label="Remover vínculo"
                      className="text-muted-foreground hover:text-destructive ml-2"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )
              })}
            </div>

            {addingSector && (
              <div className="rounded-md border border-border p-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="new-sector">Setor</Label>
                    <Select value={newSectorId} onValueChange={setNewSectorId}>
                      <SelectTrigger id="new-sector" className="mt-1">
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSectors.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="new-proficiency">Proficiência</Label>
                    <Select value={newProficiency} onValueChange={(v) => setNewProficiency(v as ProficiencyStatus)}>
                      <SelectTrigger id="new-proficiency" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apprentice">Aprendiz</SelectItem>
                        <SelectItem value="knowledgeable">Conhecedor</SelectItem>
                        <SelectItem value="master">Mestre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="new-primary"
                    checked={newIsPrimary}
                    onCheckedChange={(v) => setNewIsPrimary(!!v)}
                  />
                  <Label htmlFor="new-primary" className="text-sm font-normal cursor-pointer">
                    Área principal
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={handleAddSectorLink} disabled={!newSectorId}>
                    Adicionar
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setAddingSector(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Volunteer Detail Modal ────────────────────────────────────────────────────

interface VolunteerDetailModalProps {
  volunteer: VolunteerWithSectors | null
  open: boolean
  onClose: () => void
}

function VolunteerDetailModal({ volunteer, open, onClose }: VolunteerDetailModalProps) {
  const { data: scales, isLoading } = useQuery({
    queryKey: ['admin-volunteer-scales', volunteer?.id],
    enabled: !!volunteer?.id && open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scales')
        .select('id, shifts ( id, scheduled_time, event ( id, name, date ) ), sectors ( id, name )')
        .eq('volunteer_id', volunteer!.id)
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) throw error
      return data
    },
  })

  if (!volunteer) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Detalhes do voluntário</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <Avatar className="h-16 w-16">
            <AvatarImage src={volunteer.avatar_url || undefined} />
            <AvatarFallback className="text-lg">{getInitials(volunteer.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-base font-semibold">{volunteer.name}</p>
            {volunteer.nickname && (
              <p className="text-sm text-muted-foreground">{volunteer.nickname}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Data de entrada</span>
            <p className="font-medium">{format(parseISO(volunteer.ministry_entry_date), 'dd/MM/yyyy')}</p>
          </div>
          {volunteer.contact_phone && (
            <div>
              <span className="text-muted-foreground">Telefone</span>
              <p className="font-medium">{volunteer.contact_phone}</p>
            </div>
          )}
        </div>

        {/* Sectors */}
        <div>
          <p className="text-sm font-medium mb-2">Setores</p>
          {volunteer.volunteer_sectors.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum setor vinculado.</p>
          ) : (
            <div className="space-y-1">
              {volunteer.volunteer_sectors.map((vs) => (
                <div key={vs.id} className="flex items-center justify-between text-sm border border-border rounded-md px-3 py-2">
                  <span className="font-medium">{vs.sectors.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-mono ${PROFICIENCY_CLASSES[vs.proficiency_status]}`}>
                      {PROFICIENCY_LABELS[vs.proficiency_status]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {vs.is_active_in_sector ? 'Área principal' : 'Área secundária'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scale history */}
        <div>
          <p className="text-sm font-medium mb-2">Histórico de escalas</p>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : !scales || scales.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma escala registrada.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                  <th className="text-left py-2 font-medium">Evento</th>
                  <th className="text-left py-2 font-medium">Setor</th>
                  <th className="text-left py-2 font-medium">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {scales.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="py-2 pr-4">{s.shifts?.event?.name}</td>
                    <td className="py-2 pr-4">{s.sectors?.name}</td>
                    <td className="py-2 text-muted-foreground">
                      {s.shifts?.event?.date ? format(parseISO(s.shifts.event.date), 'dd/MM/yyyy') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Confirm Delete Dialog ─────────────────────────────────────────────────────

interface ConfirmDeleteProps {
  name: string
  open: boolean
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDeleteDialog({ name, open, loading, onConfirm, onCancel }: ConfirmDeleteProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Excluir voluntário</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja excluir <strong>{name}</strong>? Esta ação não pode ser desfeita.
        </p>
        <DialogFooter>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Volunteers() {
  const queryClient = useQueryClient()
  const { data: volunteers = [], isLoading } = useVolunteersAdmin()
  const { data: allSectors = [] } = useSectors()

  const [search, setSearch] = useState('')
  const [sectorFilter, setSectorFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<VolunteerWithSectors | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    return volunteers.filter((v) => {
      const matchSearch =
        !search ||
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        (v.nickname || '').toLowerCase().includes(search.toLowerCase())
      const matchSector =
        sectorFilter === 'all' ||
        v.volunteer_sectors.some((vs) => vs.sector_id === sectorFilter)
      return matchSearch && matchSector
    })
  }, [volunteers, search, sectorFilter])

  const handleDelete = async () => {
    if (!selected) return
    setDeleting(true)
    const { error } = await supabase.from('volunteers').delete().eq('id', selected.id)
    setDeleting(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Voluntário excluído.')
    queryClient.invalidateQueries({ queryKey: ['admin-volunteers'] })
    setDeleteOpen(false)
    setSelected(null)
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Page header */}
      <div className="sticky top-0 z-10 flex items-center justify-between h-14 px-6 border-b border-border bg-background">
        <h1 className="text-base font-semibold">Voluntários</h1>
        <Button size="sm" onClick={() => { setSelected(null); setFormOpen(true) }}>
          <Plus size={14} className="mr-1" />
          Novo voluntário
        </Button>
      </div>

      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <Input
            placeholder="Buscar por nome ou apelido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-64"
          />
          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Todos os setores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os setores</SelectItem>
              {allSectors.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border border-border rounded-md overflow-hidden bg-card">
          {isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-24 ml-auto" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users size={40} className="text-muted-foreground opacity-30 mb-3" />
              <p className="text-sm font-medium">Nenhum voluntário encontrado</p>
              <p className="text-xs text-muted-foreground mt-1">
                Crie o primeiro clicando em "Novo voluntário".
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                  <th className="text-left px-5 py-2 font-medium">Nome</th>
                  <th className="text-left px-5 py-2 font-medium">Data de entrada</th>
                  <th className="text-left px-5 py-2 font-medium">Setores</th>
                  <th className="px-5 py-2 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((v) => {
                  const primarySectors = v.volunteer_sectors.slice(0, 2)
                  const extra = v.volunteer_sectors.length - 2
                  return (
                    <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={v.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">{getInitials(v.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{v.name}</p>
                            {v.nickname && (
                              <p className="text-xs text-muted-foreground">{v.nickname}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-2.5 text-muted-foreground">
                        {format(parseISO(v.ministry_entry_date), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-1 flex-wrap">
                          {primarySectors.map((vs) => (
                            <Badge key={vs.id} variant="secondary" className="text-xs">
                              {vs.sectors.name}
                            </Badge>
                          ))}
                          {extra > 0 && (
                            <Badge variant="secondary" className="text-xs">+{extra}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                aria-label="Ver detalhes"
                                onClick={() => { setSelected(v); setDetailOpen(true) }}
                                className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                              >
                                <Eye size={14} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Ver detalhes</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                aria-label="Editar"
                                onClick={() => { setSelected(v); setFormOpen(true) }}
                                className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                              >
                                <Edit2 size={14} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Editar</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                aria-label="Excluir"
                                onClick={() => { setSelected(v); setDeleteOpen(true) }}
                                className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 size={14} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Excluir</TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <VolunteerFormModal
        open={formOpen}
        volunteer={selected}
        onClose={() => { setFormOpen(false); setSelected(null) }}
      />
      <VolunteerDetailModal
        open={detailOpen}
        volunteer={selected}
        onClose={() => { setDetailOpen(false); setSelected(null) }}
      />
      <ConfirmDeleteDialog
        open={deleteOpen}
        name={selected?.name || ''}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteOpen(false); setSelected(null) }}
      />
    </div>
  )
}
