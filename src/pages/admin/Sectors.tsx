import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Edit2, Trash2, Loader2, Grid3X3 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Sector } from '@/types/database'
import { ImageUpload } from '@/components/ImageUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SectorWithCount extends Sector {
  volunteer_sectors: { id: string }[]
}

// ─── Query ────────────────────────────────────────────────────────────────────

function useSectors() {
  return useQuery({
    queryKey: ['admin-sectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sectors')
        .select('*, volunteer_sectors(id)')
        .order('name')
      if (error) throw error
      return data as SectorWithCount[]
    },
  })
}

// ─── Form schema ──────────────────────────────────────────────────────────────

const sectorSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  slug: z.string().optional(),
})

type SectorFormValues = z.infer<typeof sectorSchema>

// ─── Sector Form Modal ────────────────────────────────────────────────────────

interface SectorFormModalProps {
  sector: SectorWithCount | null
  open: boolean
  onClose: () => void
}

function SectorFormModal({ sector, open, onClose }: SectorFormModalProps) {
  const queryClient = useQueryClient()
  const isEdit = !!sector

  const [icon, setIcon] = useState<string | null>(null)
  const [iconApprentice, setIconApprentice] = useState<string | null>(null)
  const [iconKnowledgeable, setIconKnowledgeable] = useState<string | null>(null)
  const [iconMaster, setIconMaster] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SectorFormValues>({
    resolver: zodResolver(sectorSchema),
    defaultValues: sector ? { name: sector.name, slug: sector.slug } : { name: '', slug: '' },
  })

  useEffect(() => {
    if (!open) return
    reset(sector ? { name: sector.name, slug: sector.slug } : { name: '', slug: '' })
    setIcon(sector?.url_icon || null)
    setIconApprentice(sector?.url_icon_apprentice || null)
    setIconKnowledgeable(sector?.url_icon_knowledgeable || null)
    setIconMaster(sector?.url_icon_master || null)
  }, [open, sector])

  const onSubmit = async (values: SectorFormValues) => {
    const slug = values.slug || values.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const payload = {
      name: values.name,
      slug,
      url_icon: icon,
      url_icon_apprentice: iconApprentice,
      url_icon_knowledgeable: iconKnowledgeable,
      url_icon_master: iconMaster,
    }

    if (isEdit) {
      const { error } = await supabase.from('sectors').update(payload).eq('id', sector.id)
      if (error) { toast.error(error.message); return }
      toast.success('Setor atualizado.')
    } else {
      const { error } = await supabase.from('sectors').insert(payload)
      if (error) { toast.error(error.message); return }
      toast.success('Setor criado com sucesso.')
    }

    queryClient.invalidateQueries({ queryKey: ['admin-sectors'] })
    queryClient.invalidateQueries({ queryKey: ['admin-sectors-list'] })
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar setor' : 'Novo setor'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="s-name">Nome *</Label>
            <Input id="s-name" {...register('name')} className="mt-1" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="s-slug">Slug (opcional)</Label>
            <Input
              id="s-slug"
              {...register('slug')}
              placeholder="gerado automaticamente"
              className="mt-1"
            />
          </div>

          <div className="space-y-3 pt-1">
            <p className="text-sm font-medium">Ícone do setor</p>
            <ImageUpload
              bucket="sector-icons"
              value={icon}
              onChange={setIcon}
              label="Ícone geral"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
            />
            <p className="text-sm font-medium pt-1">Ícones por nível</p>
            <ImageUpload
              bucket="sector-icons"
              value={iconApprentice}
              onChange={setIconApprentice}
              label="Aprendiz"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
            />
            <ImageUpload
              bucket="sector-icons"
              value={iconKnowledgeable}
              onChange={setIconKnowledgeable}
              label="Conhecedor"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
            />
            <ImageUpload
              bucket="sector-icons"
              value={iconMaster}
              onChange={setIconMaster}
              label="Mestre"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
            />
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

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Sectors() {
  const queryClient = useQueryClient()
  const { data: sectors = [], isLoading } = useSectors()

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<SectorWithCount | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!selected) return
    setDeleting(true)
    const { error } = await supabase.from('sectors').delete().eq('id', selected.id)
    setDeleting(false)
    if (error) { toast.error(error.message); return }
    toast.success('Setor excluído.')
    queryClient.invalidateQueries({ queryKey: ['admin-sectors'] })
    queryClient.invalidateQueries({ queryKey: ['admin-sectors-list'] })
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
    setDeleteOpen(false)
    setSelected(null)
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Page header */}
      <div className="sticky top-0 z-10 flex items-center justify-between h-14 px-6 border-b border-border bg-background">
        <h1 className="text-base font-semibold">Setores</h1>
        <Button size="sm" onClick={() => { setSelected(null); setFormOpen(true) }}>
          <Plus size={14} className="mr-1" />
          Novo setor
        </Button>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-md" />
            ))}
          </div>
        ) : sectors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Grid3X3 size={40} className="text-muted-foreground opacity-30 mb-3" />
            <p className="text-sm font-medium">Nenhum setor encontrado</p>
            <p className="text-xs text-muted-foreground mt-1">
              Crie o primeiro clicando em "Novo setor".
            </p>
            <Button size="sm" className="mt-4" onClick={() => setFormOpen(true)}>
              <Plus size={14} className="mr-1" />
              Novo setor
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {sectors.map((sector) => (
              <div
                key={sector.id}
                className="border border-border rounded-md bg-card p-5 flex flex-col gap-3"
              >
                <div className="flex-1">
                  <p className="text-base font-medium">{sector.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {sector.volunteer_sectors.length} voluntário{sector.volunteer_sectors.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        aria-label="Editar setor"
                        onClick={() => { setSelected(sector); setFormOpen(true) }}
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
                        aria-label="Excluir setor"
                        onClick={() => { setSelected(sector); setDeleteOpen(true) }}
                        className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Excluir</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SectorFormModal
        open={formOpen}
        sector={selected}
        onClose={() => { setFormOpen(false); setSelected(null) }}
      />
      <ConfirmDeleteDialog
        title="Excluir setor"
        open={deleteOpen}
        name={selected?.name || ''}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteOpen(false); setSelected(null) }}
      />
    </div>
  )
}
