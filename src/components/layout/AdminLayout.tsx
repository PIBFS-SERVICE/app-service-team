import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'

export function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b bg-card/80 backdrop-blur-md sticky top-0 z-40">
            <SidebarTrigger className="ml-3" />
          </header>
          <main className="flex-1 overflow-hidden">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
