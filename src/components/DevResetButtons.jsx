import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function DevResetButtons() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : ''
    const search = typeof window !== 'undefined' ? window.location.search : ''
    return hash.includes('dev') || search.includes('dev=1')
  })

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault()
        e.stopPropagation()
        setOpen(o => !o)
      }
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [])

  function resetEverything() {
    localStorage.removeItem('made_onboarding_v3')
    navigate('/onboarding/team')
    setTimeout(() => window.location.reload(), 50)
  }

  async function markDay1Done() {
    const m = await import('../data/onboarding.js')
    const items = m.getAllItemsForPhase('day1', getTeam() || 'Design')
    const done = currentCompleted()
    items.forEach(i => { done[i.id] = true })
    persist({ completed: done })
  }

  async function markAllDone() {
    const m = await import('../data/onboarding.js')
    const team = getTeam() || 'Design'
    const done = currentCompleted()
    ;['day1', 'week1', 'month1'].forEach(p => {
      m.getAllItemsForPhase(p, team).forEach(i => { done[i.id] = true })
    })
    persist({ completed: done, team })
  }

  function getTeam() {
    try {
      const raw = localStorage.getItem('made_onboarding_v3')
      return raw ? (JSON.parse(raw).team || null) : null
    } catch { return null }
  }

  function currentCompleted() {
    try {
      const raw = localStorage.getItem('made_onboarding_v3')
      return raw ? (JSON.parse(raw).completed || {}) : {}
    } catch { return {} }
  }

  function persist(patch) {
    let state = {}
    try {
      const raw = localStorage.getItem('made_onboarding_v3')
      state = raw ? JSON.parse(raw) : {}
    } catch {}
    state = { started: true, ...state, ...patch }
    localStorage.setItem('made_onboarding_v3', JSON.stringify(state))
    window.location.reload()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open dev tools"
        title="Dev tools (Cmd/Ctrl+R)"
        className="fixed bottom-3 left-3 w-3 h-3 rounded-full bg-transparent hover:bg-[#6324F3]/30 transition-colors z-50"
      />
    )
  }

  return (
    <div className="fixed bottom-3 left-3 z-50 bg-white border border-[#DAE3E3] rounded-sm shadow-lg p-3 flex flex-col gap-2 text-[12px] w-[200px]">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-made-neutral-100">Dev controls</span>
        <button
          onClick={() => setOpen(false)}
          className="text-[#A0ABAB] hover:text-made-neutral-100"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <button
        onClick={resetEverything}
        className="px-3 py-2 rounded-sm bg-[#6324F3] text-white font-medium hover:bg-[#5118D4] transition-colors"
      >
        Reset onboarding
      </button>
      <button
        onClick={markDay1Done}
        className="px-3 py-2 rounded-sm border border-[#E1E7E7] text-made-neutral-100 hover:border-[#6324F3] transition-colors"
      >
        Mark Day 1 done
      </button>
      <button
        onClick={markAllDone}
        className="px-3 py-2 rounded-sm border border-[#E1E7E7] text-made-neutral-100 hover:border-[#6324F3] transition-colors"
      >
        Mark all done
      </button>
      <div className="text-[10px] text-[#A0ABAB] mt-1">Toggle: ⌘/Ctrl + R</div>
    </div>
  )
}
