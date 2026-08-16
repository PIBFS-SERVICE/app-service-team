import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const { signIn, session } = useAuth()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (session) return <Navigate to="/admin" replace />

  const onSubmit = async (values: FormValues) => {
    setApiError(null)
    const { error } = await signIn(values.email, values.password)
    if (error) {
      setApiError('E-mail ou senha incorretos.')
    } else {
      navigate('/admin', { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-[380px] border border-border rounded-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-base font-semibold">Ministério de Serviço</h1>
          <p className="text-xs text-muted-foreground mt-1">Área administrativa</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              {...register('email')}
              className="mt-1"
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className="mt-1"
            />
            {errors.password && (
              <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
            )}
          </div>

          {apiError && (
            <p className="text-sm text-destructive">{apiError}</p>
          )}

          <Button type="submit" className="w-full h-10" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
