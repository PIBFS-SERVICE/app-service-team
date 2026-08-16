import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface ConfirmDeleteDialogProps {
  title: string
  name: string
  open: boolean
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDeleteDialog({ title, name, open, loading, onConfirm, onCancel }: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onCancel()}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja excluir <strong>{name}</strong>? Esta ação não pode ser desfeita.
        </p>
        <DialogFooter>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
