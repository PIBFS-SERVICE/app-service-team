import { useAuth } from '@/hooks/useAuth'
import { EventTemplateForm } from '@/components/settings/EventTemplateForm'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function Settings() {
  const { session } = useAuth()

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="sticky top-0 z-10 flex items-center h-14 px-6 border-b border-border bg-background">
        <h1 className="text-base font-semibold">Configurações</h1>
      </div>

      <div className="p-6 space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conta</CardTitle>
            <CardDescription>Sessão atual</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-sm font-medium">{session?.user?.email ?? '—'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Template padrão de evento</CardTitle>
            <CardDescription>
              Estrutura de turnos e setores aplicada automaticamente na criação de um novo evento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EventTemplateForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
