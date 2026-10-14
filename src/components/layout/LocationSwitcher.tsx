'use client'

import { useLocation } from '@/lib/context/LocationContext'
import { MapPin, ChevronDown } from 'lucide-react'
import { useState } from 'react'

type Location = { id: string; name: string }

export default function LocationSwitcher({ locations }: { locations: Location[] }) {
  const { location, setLocation } = useLocation()
  const [open, setOpen] = useState(false)

  if (locations.length <= 1) return (
    <div className="flex items-center gap-1.5 px-3 py-1.5">
      <MapPin size={12} className="text-[#c9a84c]" />
      <span className="text-[#a09070] text-xs truncate">{location?.name ?? 'No location'}</span>
    </div>
  )

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[#1e1e1e] transition-colors"
      >
        <MapPin size={12} className="text-[#c9a84c]" />
        <span className="text-[#a09070] text-xs truncate max-w-[120px]">{location?.name}</span>
        <ChevronDown size={11} className="text-[#6a5a40]" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl overflow-hidden z-50 min-w-[160px] shadow-xl">
          {locations.map(loc => (
            <button
              key={loc.id}
              onClick={() => { setLocation(loc); setOpen(false) }}
              className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                location?.id === loc.id
                  ? 'text-[#c9a84c] bg-[#c9a84c]/10'
                  : 'text-[#f0ead8] hover:bg-[#2a2a2a]'
              }`}
            >
              {loc.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}