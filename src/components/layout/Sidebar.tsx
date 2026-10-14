'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/auth/actions'
import {
  LayoutDashboard, Package, Warehouse,
  ShoppingCart, BarChart2, Settings, LogOut, Wine
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/pos', label: 'Point of Sale', icon: ShoppingCart },
  { href: '/reports', label: 'Reports', icon: BarChart2 },
]

const managerItems = [
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ profile }: { profile: any }) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-56 flex-col bg-[#161616] border-r border-[#2a2a2a] shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#2a2a2a]">
        <div className="w-9 h-9 bg-[#c9a84c] rounded-xl flex items-center justify-center shrink-0">
          <Wine size={18} className="text-black" />
        </div>
        <div>
          <p className="text-[#c9a84c] font-bold text-sm font-display leading-tight">Jay Wines</p>
          <p className="text-[#6a5a40] text-[10px] uppercase tracking-widest">Mini Bar</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active
                  ? 'bg-[#c9a84c]/10 text-[#c9a84c] font-medium'
                  : 'text-[#a09070] hover:text-[#f0ead8] hover:bg-[#1e1e1e]'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}

        {profile?.role === 'manager' && (
          <>
            <div className="my-2 border-t border-[#2a2a2a]" />
            {managerItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  pathname.startsWith(href)
                    ? 'bg-[#c9a84c]/10 text-[#c9a84c] font-medium'
                    : 'text-[#a09070] hover:text-[#f0ead8] hover:bg-[#1e1e1e]'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[#2a2a2a]">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-[#8a6f30]/40 flex items-center justify-center text-[#c9a84c] text-xs font-bold">
            {profile?.full_name?.[0] ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-[#f0ead8] text-xs font-medium truncate">{profile?.full_name ?? 'User'}</p>
            <p className="text-[#6a5a40] text-[10px] capitalize">{profile?.role}</p>
          </div>
        </div>
        <form action={logout}>
          <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#6a5a40] hover:text-[#e05555] hover:bg-[#1e1e1e] transition-colors w-full">
            <LogOut size={15} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}