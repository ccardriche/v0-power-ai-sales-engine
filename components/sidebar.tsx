'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Megaphone, 
  CheckSquare, 
  GitBranch, 
  Users, 
  Upload, 
  Settings,
  Zap,
  LogOut,
  ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & metrics' },
  { href: '/campaigns', label: 'Campaign Builder', icon: Megaphone, description: 'Create outreach' },
  { href: '/approvals', label: 'Approvals', icon: CheckSquare, description: 'Review content' },
  { href: '/sequences', label: 'Sequences', icon: GitBranch, description: 'Manage flows' },
  { href: '/leads', label: 'Leads', icon: Users, description: 'Your prospects' },
  { href: '/imports', label: 'Imports', icon: Upload, description: 'Add contacts' },
  { href: '/settings', label: 'Settings', icon: Settings, description: 'Configure' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  return (
    <aside className="w-72 bg-gradient-to-b from-[#0a1929] to-[#0f2a43] min-h-screen flex flex-col border-r border-white/5">
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center shadow-lg shadow-brand-teal/20 group-hover:shadow-brand-teal/40 transition-shadow">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-lg tracking-tight">Power AI</span>
            <span className="block text-xs text-white/50 font-medium">Sales Engine</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive 
                    ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/25' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon className={cn(
                  'w-5 h-5 transition-transform',
                  isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80'
                )} />
                <div className="flex-1 min-w-0">
                  <span className="block truncate">{item.label}</span>
                  {!isActive && (
                    <span className="block text-xs text-white/40 truncate">{item.description}</span>
                  )}
                </div>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-white/80" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 mt-auto">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
          <p className="text-xs text-white/70 leading-relaxed text-center">
            <span className="block text-white/90 font-medium mb-1">Our mission</span>
            &ldquo;Remove gates. Build bridges. Carry fire.&rdquo;
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
