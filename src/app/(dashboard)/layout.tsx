import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { CommandBar } from '@/components/layout/command-bar'
import { GlobalStatusBar } from '@/components/layout/global-status-bar'
import { Toaster } from '@/components/ui/sonner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto p-4">{children}</main>
        <GlobalStatusBar />
      </div>
      <CommandBar />
      <Toaster />
    </div>
  )
}
