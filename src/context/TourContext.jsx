import { createContext, useCallback, useContext, useState } from 'react'

const TourContext = createContext(null)
const SEEN_KEY = 'made_tours_seen_v1'

export function useTour() {
  return useContext(TourContext)
}

function readSeen() {
  try {
    const raw = localStorage.getItem(SEEN_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function writeSeen(set) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify([...set])) } catch {}
}

export function TourProvider({ children }) {
  const [tour, setTour] = useState(null)

  const hasSeen = useCallback((name) => readSeen().has(name), [])

  const startTour = useCallback((name, steps) => {
    if (!steps?.length) return
    setTour({ name, steps, currentIdx: 0 })
  }, [])

  const endTour = useCallback(() => {
    setTour(prev => {
      if (prev?.name) {
        const seen = readSeen()
        seen.add(prev.name)
        writeSeen(seen)
      }
      return null
    })
  }, [])

  const advance = useCallback(() => {
    setTour(prev => {
      if (!prev) return null
      const nextIdx = prev.currentIdx + 1
      if (nextIdx >= prev.steps.length) {
        const seen = readSeen()
        seen.add(prev.name)
        writeSeen(seen)
        return null
      }
      return { ...prev, currentIdx: nextIdx }
    })
  }, [])

  return (
    <TourContext.Provider value={{ tour, startTour, endTour, advance, hasSeen }}>
      {children}
    </TourContext.Provider>
  )
}
