'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, Warehouse,
  ShoppingCart, BarChart2
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/pos', label: 'POS', icon: ShoppingCart },
  { href: '/inventory', label: 'Stock', icon: Warehouse },
  { href: '/reports', label: 'Reports', icon: BarChart2 },
]

export default function BottomNav({ role }: { role: string }) {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#161616] border-t border-[#2a2a2a] flex items-center safe-area-pb z-50">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href)
        const isPOS = href === '/pos'
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 transition-colors ${
              isPOS
                ? active
                  ? 'text-black'
                  : 'text-black'
                : active
                ? 'text-[#c9a84c]'
                : 'text-[#6a5a40]'
            }`}
          >
            {isPOS ? (
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center -mt-5 shadow-lg ${
                active ? 'bg-[#e2c06a]' : 'bg-[#c9a84c]'
              }`}>
                <Icon size={22} className="text-black" />
              </div>
            ) : (
              <Icon size={20} />
            )}
            {!isPOS && (
              <span className="text-[10px] font-medium">{label}</span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}