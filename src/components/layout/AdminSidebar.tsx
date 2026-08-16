import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Calendar, Grid3X3, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Voluntários', href: '/admin/volunteers', icon: Users },
  { label: 'Eventos', href: '/admin/events', icon: Calendar },
  { label: 'Setores', href: '/admin/sectors', icon: Grid3X3 },
  { label: 'Configurações', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-lg flex-shrink-0">
            A
          </div>
          <div className="overflow-hidden">
            <span className="text-sm font-semibold text-sidebar-foreground">Ministério de Serviço</span>
            <p className="text-xs text-sidebar-foreground/50 mt-0.5">Área administrativa</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ label, href, icon: Icon }) => {
                const isActive =
                  href === '/admin'
                    ? location.pathname === '/admin'
                    : location.pathname.startsWith(href)
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
                      <Link
                        to={href}
                        className="flex items-center gap-3 transition-colors"
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="p-2 border-t border-sidebar-border mt-auto">
        <button
          onClick={handleSignOut}
          aria-label="Sair"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:text-red-400 hover:bg-sidebar-accent/50"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </Sidebar>
  )
}
