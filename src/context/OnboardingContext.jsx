import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { PHASES, getChaptersForPhase, getAllItemsForPhase } from '../data/onboarding'

const OnboardingContext = createContext(null)
const STORAGE_KEY = 'made_onboarding_v3'
const CONFETTI_FIRED_KEY = 'made_onboarding_confetti_fired_v1'

function clearConfettiFiredForPhase(phaseId) {
  try {
    const raw = localStorage.getItem(CONFETTI_FIRED_KEY)
    if (!raw) return
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return
    const idx = arr.indexOf(phaseId)
    if (idx < 0) return
    arr.splice(idx, 1)
    localStorage.setItem(CONFETTI_FIRED_KEY, JSON.stringify(arr))
    try { window.dispatchEvent(new CustomEvent('made:celebrated-changed')) } catch {}
  } catch {}
}

export function useOnboarding() {
  return useContext(OnboardingContext)
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveLocal(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

export function OnboardingProvider({ children }) {
  const local = loadLocal()

  const [team, setTeam] = useState(local?.team || null)
  const [completed, setCompleted] = useState(local?.completed || {})
  const [started, setStarted] = useState(local?.started || false)
  const [unlockedPhases, setUnlockedPhases] = useState(local?.unlockedPhases || ['day1'])
  const [completedPhases, setCompletedPhases] = useState(local?.completedPhases || [])
  const [teamChangeWarning, setTeamChangeWarning] = useState(false)
  const skipNextWriteRef = useRef(false)

  useEffect(() => {
    const state = { team, completed, started, unlockedPhases, completedPhases }
    saveLocal(state)
    if (skipNextWriteRef.current) {
      skipNextWriteRef.current = false
    }
  }, [team, completed, started, unlockedPhases, completedPhases])

  const selectTeam = useCallback((t) => {
    setTeam(prevTeam => {
      if (prevTeam && prevTeam !== t && Object.keys(completed).length > 0) {
        setTeamChangeWarning(true)
      }
      return t
    })
  }, [completed])

  const clearTeamChangeWarning = useCallback(() => setTeamChangeWarning(false), [])

  const beginOnboarding = useCallback(() => setStarted(true), [])

  const markItemDone = useCallback((itemId) => {
    setCompleted(prev => (prev[itemId] ? prev : { ...prev, [itemId]: true }))
  }, [])

  const unmarkItemDone = useCallback((itemId) => {
    setCompleted(prev => {
      if (!prev[itemId]) return prev
      PHASES.forEach(phase => {
        const items = getAllItemsForPhase(phase.id, team) || []
        if (!items.some(i => i.id === itemId)) return
        const wasComplete = items.length > 0 && items.every(i => prev[i.id])
        if (wasComplete) clearConfettiFiredForPhase(phase.id)
      })
      const next = { ...prev }
      delete next[itemId]
      return next
    })
  }, [team])

  const toggleItem = useCallback((itemId) => {
    setCompleted(prev => {
      const wasDone = !!prev[itemId]
      if (wasDone) {
        PHASES.forEach(phase => {
          const items = getAllItemsForPhase(phase.id, team) || []
          if (!items.some(i => i.id === itemId)) return
          const wasComplete = items.length > 0 && items.every(i => prev[i.id])
          if (wasComplete) clearConfettiFiredForPhase(phase.id)
        })
      }
      const next = { ...prev }
      if (wasDone) delete next[itemId]
      else next[itemId] = true
      return next
    })
  }, [team])

  const isItemDone = useCallback((itemId) => !!completed[itemId], [completed])

  const resetProgress = useCallback(() => {
    setCompleted({})
    setStarted(false)
    try {
      localStorage.removeItem(CONFETTI_FIRED_KEY)
      localStorage.removeItem('made_onboarding_phase_started_v1')
      window.dispatchEvent(new CustomEvent('made:celebrated-changed'))
      window.dispatchEvent(new CustomEvent('made:phase-started'))
    } catch {}
  }, [])

  const resetAll = useCallback(() => {
    setTeam(null)
    setCompleted({})
    setStarted(false)
    setUnlockedPhases(['day1'])
    setCompletedPhases([])
    setTeamChangeWarning(false)
    try {
      localStorage.removeItem(CONFETTI_FIRED_KEY)
      localStorage.removeItem('made_onboarding_phase_started_v1')
      window.dispatchEvent(new CustomEvent('made:celebrated-changed'))
      window.dispatchEvent(new CustomEvent('made:phase-started'))
    } catch {}
  }, [])

  useEffect(() => {
    const TRIGGER = 'reset'
    let buffer = ''
    let lastTs = 0

    function onKey(e) {
      const target = e.target
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key.length !== 1) return

      const now = Date.now()
      if (now - lastTs > 1500) buffer = ''
      lastTs = now
      buffer = (buffer + e.key.toLowerCase()).slice(-TRIGGER.length)

      if (buffer === TRIGGER) {
        buffer = ''
        try {
          localStorage.removeItem('made_onboarding_v3')
          localStorage.removeItem('made_onboarding_active_slide_v1')
        } catch {}
        resetAll()
        window.location.href = '/onboarding/team'
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [resetAll])

  const getPhaseProgress = useCallback((phaseId) => {
    if (!team) return { done: 0, total: 0, percent: 0 }
    const items = getAllItemsForPhase(phaseId, team)
    const done = items.filter(i => completed[i.id]).length
    return { done, total: items.length, percent: items.length ? Math.round((done / items.length) * 100) : 0 }
  }, [team, completed])

  const isPhaseComplete = useCallback((phaseId) => {
    if (completedPhases.includes(phaseId)) return true
    const { done, total } = getPhaseProgress(phaseId)
    return total > 0 && done === total
  }, [getPhaseProgress, completedPhases])

  const isPhaseStarted = useCallback((phaseId) => {
    const { done } = getPhaseProgress(phaseId)
    return done > 0
  }, [getPhaseProgress])

  const isPhaseUnlocked = useCallback((phaseId) => {
    if (phaseId === 'day1') return true
    if (unlockedPhases.includes(phaseId)) return true
    if (phaseId === 'week1') return isPhaseComplete('day1')
    if (phaseId === 'month1') return isPhaseComplete('week1')
    return false
  }, [isPhaseComplete, unlockedPhases])

  useEffect(() => {
    const fullyDone = (phaseId) => {
      if (!team) return false
      const items = getAllItemsForPhase(phaseId, team)
      return items.length > 0 && items.every(i => completed[i.id])
    }
    setCompletedPhases(prev => {
      const next = new Set(prev)
      if (fullyDone('day1')) next.add('day1')
      if (fullyDone('week1')) next.add('week1')
      if (fullyDone('month1')) next.add('month1')
      const arr = [...next]
      if (arr.length === prev.length && arr.every(p => prev.includes(p))) return prev
      return arr
    })
    setUnlockedPhases(prev => {
      const next = new Set(prev)
      next.add('day1')
      if (isPhaseComplete('day1')) next.add('week1')
      if (isPhaseComplete('week1')) next.add('month1')
      const arr = [...next]
      if (arr.length === prev.length && arr.every(p => prev.includes(p))) return prev
      return arr
    })
  }, [completed, team, isPhaseComplete])

  const isChapterComplete = useCallback((phaseId, chapterId) => {
    if (!team) return false
    const chapters = getChaptersForPhase(phaseId, team)
    const ch = chapters.find(c => c.id === chapterId)
    if (!ch) return false
    return ch.items.every(i => completed[i.id])
  }, [team, completed])

  const getChapterProgress = useCallback((phaseId, chapterId) => {
    if (!team) return { done: 0, total: 0, percent: 0 }
    const chapters = getChaptersForPhase(phaseId, team)
    const ch = chapters.find(c => c.id === chapterId)
    if (!ch) return { done: 0, total: 0, percent: 0 }
    const done = ch.items.filter(i => completed[i.id]).length
    return { done, total: ch.items.length, percent: ch.items.length ? Math.round((done / ch.items.length) * 100) : 0 }
  }, [team, completed])

  const getOverallProgress = useCallback(() => {
    if (!team) return { done: 0, total: 0, percent: 0 }
    let done = 0, total = 0
    PHASES.forEach(p => {
      const prog = getPhaseProgress(p.id)
      done += prog.done
      total += prog.total
    })
    return { done, total, percent: total ? Math.round((done / total) * 100) : 0 }
  }, [team, getPhaseProgress])

  const value = {
    team,
    selectTeam,
    teamChangeWarning,
    clearTeamChangeWarning,
    started,
    beginOnboarding,
    hydrating: false,
    completed,
    markItemDone,
    unmarkItemDone,
    toggleItem,
    isItemDone,
    resetProgress,
    getPhaseProgress,
    isPhaseComplete,
    isPhaseStarted,
    isPhaseUnlocked,
    isChapterComplete,
    getChapterProgress,
    getOverallProgress,
  }

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}
