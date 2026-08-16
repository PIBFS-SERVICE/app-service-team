import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSectors } from '@/hooks/use-sectors'
import { useEventTemplate, saveEventTemplate } from '@/hooks/use-event-template'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'

const templateShiftSchema = z.object({
  scheduled_time: z.string().min(1, 'Horário obrigatório'),
  sector_ids: z.array(z.string()),
})

const eventTemplateSchema = z.object({
  default_event_name: z.string().min(1, 'Nome é obrigatório'),
  shifts: z.array(templateShiftSchema),
})

type EventTemplateFormValues = z.infer<typeof eventTemplateSchema>

export function EventTemplateForm() {
  const queryClient = useQueryClient()
  const { data: template, isLoading: isLoadingTemplate } = useEventTemplate()
  const { data: sectors = [], isLoading: isLoadingSectors } = useSectors()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventTemplateFormValues>({
    resolver: zodResolver(eventTemplateSchema),
    defaultValues: { default_event_name: '', shifts: [] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'shifts' })

  useEffect(() => {
    if (isLoadingTemplate || !template) return
    reset({
      default_event_name: template.defaultEventName,
      shifts: template.shifts.map(s => ({
        scheduled_time: s.scheduled_time.slice(0, 5),
        sector_ids: s.sectors.map(sector => sector.id),
      })),
    })
  }, [isLoadingTemplate, template, reset])

  const onSubmit = async (values: EventTemplateFormValues) => {
    try {
      await saveEventTemplate(values.default_event_name.trim(), values.shifts)
      toast.success('Template salvo.')
      queryClient.invalidateQueries({ queryKey: ['event-template'] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar template.')
    }
  }

  if (isLoadingTemplate || isLoadingSectors) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="default-event-name">Nome padrão do evento</Label>
        <Input
          id="default-event-name"
          {...register('default_event_name')}
          placeholder="Culto de Domingo"
          className="mt-1"
        />
        {errors.default_event_name && (
          <p className="text-xs text-destructive mt-1">{errors.default_event_name.message}</p>
        )}
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="border border-border rounded-md p-3 space-y-3">
            <div className="flex items-end gap-2 flex-wrap">
              <div>
                <Label className="text-xs">Horário</Label>
                <Input
                  type="time"
                  {...register(`shifts.${index}.scheduled_time`)}
                  className="h-8 text-xs w-32 mt-0.5"
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => remove(index)}
              >
                <Trash2 size={12} className="mr-1" />
                Remover turno
              </Button>
            </div>
            {errors.shifts?.[index]?.scheduled_time && (
              <p className="text-xs text-destructive">{errors.shifts[index]?.scheduled_time?.message}</p>
            )}

            <div>
              <p className="text-xs text-muted-foreground font-medium mb-2">Setores deste turno</p>
              <Controller
                control={control}
                name={`shifts.${index}.sector_ids`}
                render={({ field: sectorField }) => (
                  <div className="grid grid-cols-2 gap-2">
                    {sectors.map(sector => (
                      <label key={sector.id} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={sectorField.value.includes(sector.id)}
                          onCheckedChange={checked => {
                            sectorField.onChange(
                              checked
                                ? [...sectorField.value, sector.id]
                                : sectorField.value.filter((id: string) => id !== sector.id)
                            )
                          }}
                        />
                        {sector.name}
                      </label>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => append({ scheduled_time: '', sector_ids: [] })}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Plus size={12} />
        Adicionar turno
      </button>

      <div className="pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar template
        </Button>
      </div>
    </form>
  )
}
