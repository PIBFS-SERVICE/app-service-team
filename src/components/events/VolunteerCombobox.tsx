import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VolunteerForSelect } from '@/hooks/use-events'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'

interface VolunteerComboboxProps {
  volunteers: VolunteerForSelect[]
  value: string
  onChange: (id: string) => void
  placeholder?: string
  searchPlaceholder?: string
  loading?: boolean
  disabled?: boolean
  allowNone?: boolean
  noneLabel?: string
  triggerClassName?: string
}

export function VolunteerCombobox({
  volunteers,
  value,
  onChange,
  placeholder = 'Voluntário',
  searchPlaceholder = 'Buscar...',
  loading,
  disabled,
  allowNone,
  noneLabel = 'Sem líder',
  triggerClassName,
}: VolunteerComboboxProps) {
  const [open, setOpen] = useState(false)
  const selected = volunteers.find(v => v.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          disabled={disabled}
          className={cn('h-8 text-xs w-48 justify-between font-normal', triggerClassName)}
        >
          {selected ? (selected.nickname || selected.name) : (allowNone ? noneLabel : placeholder)}
          <ChevronsUpDown size={12} className="ml-1 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-8 text-xs" />
          <CommandList>
            {loading ? (
              <div className="p-2 text-xs text-center text-muted-foreground">Carregando...</div>
            ) : (
              <>
                <CommandEmpty>Nenhum voluntário encontrado.</CommandEmpty>
                <CommandGroup>
                  {allowNone && (
                    <CommandItem
                      value="__none__"
                      onSelect={() => { onChange(''); setOpen(false) }}
                      className="text-xs text-muted-foreground"
                    >
                      <Check size={12} className={cn('mr-2 shrink-0', !value ? 'opacity-100' : 'opacity-0')} />
                      {noneLabel}
                    </CommandItem>
                  )}
                  {volunteers.map(v => (
                    <CommandItem
                      key={v.id}
                      value={v.name}
                      onSelect={() => { onChange(v.id); setOpen(false) }}
                      className="text-xs"
                    >
                      <Check size={12} className={cn('mr-2 shrink-0', value === v.id ? 'opacity-100' : 'opacity-0')} />
                      {v.nickname || v.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
