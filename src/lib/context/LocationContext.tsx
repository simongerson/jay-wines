'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type Location = { id: string; name: string }

const LocationContext = createContext<{
  location: Location | null
  setLocation: (l: Location) => void
}>({ location: null, setLocation: () => {} })

export function LocationProvider({
  children,
  locations,
  defaultLocation,
}: {
  children: ReactNode
  locations: Location[]
  defaultLocation: Location | null
}) {
  const [location, setLocation] = useState<Location | null>(defaultLocation)

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  return useContext(LocationContext)
}