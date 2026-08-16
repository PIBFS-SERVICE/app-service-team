import { useRef, useState } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Label } from '@/components/ui/label'

interface ImageUploadProps {
  bucket: 'avatars' | 'sector-icons'
  value: string | null
  onChange: (url: string | null) => void
  label: string
  accept?: string
}

export function ImageUpload({
  bucket,
  value,
  onChange,
  label,
  accept = 'image/jpeg,image/png,image/webp',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      onChange(data.publicUrl)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer upload da imagem'
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative h-12 w-12 shrink-0 rounded-md overflow-hidden border border-border bg-muted">
            <img src={value} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
            >
              <X size={14} className="text-white" />
            </button>
          </div>
        ) : (
          <div className="h-12 w-12 shrink-0 rounded-md border border-dashed border-border flex items-center justify-center text-muted-foreground bg-muted/30">
            <Upload size={16} />
          </div>
        )}

        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="text-xs text-primary hover:underline disabled:opacity-50 flex items-center gap-1.5"
        >
          {uploading && <Loader2 size={12} className="animate-spin" />}
          {uploading ? 'Enviando...' : value ? 'Alterar imagem' : 'Selecionar imagem'}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />
      </div>
    </div>
  )
}
