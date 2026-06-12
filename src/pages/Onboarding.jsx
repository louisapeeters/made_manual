import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { useOnboarding } from '../context/OnboardingContext'
import {
  PHASES,
  getChaptersForPhase,
} from '../data/onboarding'
import { CHAPTERS } from '../data/chapters'
import { useTour } from '../context/TourContext'
import { SetupLogo } from '../components/SetupLogo'

const PHASE_DAY_WEIGHTS = { day1: 1, week1: 6, month1: 23 }
const TOTAL_DAYS = 30

const HEADER_OFFSET_CSS = 'clamp(72px,5.5vh,108px)'
const PROGRESS_BAR_HEIGHT = 88
const MOBILE_BOTTOM_PILL_HEIGHT = 56

const ACTIVE_SLIDE_KEY = 'made_onboarding_active_slide_v1'
const CONFETTI_FIRED_KEY = 'made_onboarding_confetti_fired_v1'
const PHASE_STARTED_KEY = 'made_onboarding_phase_started_v1'

function hasPhaseStarted(phaseId) {
  try {
    const raw = localStorage.getItem(PHASE_STARTED_KEY)
    if (!raw) return false
    const arr = JSON.parse(raw)
    return Array.isArray(arr) && arr.includes(phaseId)
  } catch { return false }
}

function markPhaseStarted(phaseId) {
  try {
    const raw = localStorage.getItem(PHASE_STARTED_KEY)
    const arr = raw ? JSON.parse(raw) : []
    if (!Array.isArray(arr) || arr.includes(phaseId)) return
    arr.push(phaseId)
    localStorage.setItem(PHASE_STARTED_KEY, JSON.stringify(arr))
    try { window.dispatchEvent(new CustomEvent('made:phase-started')) } catch {}
  } catch {}
}

function hasConfettiFired(phaseId) {
  try {
    const raw = localStorage.getItem(CONFETTI_FIRED_KEY)
    if (!raw) return false
    const arr = JSON.parse(raw)
    return Array.isArray(arr) && arr.includes(phaseId)
  } catch { return false }
}

function markConfettiFired(phaseId) {
  try {
    const raw = localStorage.getItem(CONFETTI_FIRED_KEY)
    const arr = raw ? JSON.parse(raw) : []
    if (!Array.isArray(arr) || arr.includes(phaseId)) return
    arr.push(phaseId)
    localStorage.setItem(CONFETTI_FIRED_KEY, JSON.stringify(arr))
    try { window.dispatchEvent(new CustomEvent('made:celebrated-changed')) } catch {}
  } catch {}
}

function indexOf(slides, id) {
  const i = slides.findIndex(s => s.id === id)
  return i < 0 ? 0 : i
}

function computePhaseLocked(phasesData, isItemDone) {
  const locked = {}
  let blocked = false
  phasesData.forEach(p => {
    locked[p.id] = blocked
    if (!blocked) {
      const tasks = p.chapters.flatMap(c => c.items)
      if (tasks.length === 0 || tasks.some(t => !isItemDone(t.id))) blocked = true
    }
  })
  return locked
}

export default function Onboarding() {
  const location = useLocation()
  const { team, started, isItemDone, markItemDone, unmarkItemDone } = useOnboarding()

  const phasesData = useMemo(() => {
    if (!team) return []
    return PHASES.map(p => ({
      ...p,
      chapters: getChaptersForPhase(p.id, team),
    }))
  }, [team])

  const [activeId, setActiveId] = useState(null)

  const [celebratedTick, setCelebratedTick] = useState(0)
  useEffect(() => {
    function bump() { setCelebratedTick(t => t + 1) }
    window.addEventListener('made:celebrated-changed', bump)
    return () => window.removeEventListener('made:celebrated-changed', bump)
  }, [])

  const [startedTick, setStartedTick] = useState(0)
  useEffect(() => {
    function bump() { setStartedTick(t => t + 1) }
    window.addEventListener('made:phase-started', bump)
    return () => window.removeEventListener('made:phase-started', bump)
  }, [])

  const slides = useMemo(() => {
    const out = []
    phasesData.forEach((p, pIdx) => {
      const chapters = p.chapters
      const tasks = chapters.flatMap(c => c.items)
      const nextPhase = phasesData[pIdx + 1] || null
      const phaseStarted = hasPhaseStarted(p.id) || tasks.some(t => isItemDone(t.id))
      if (!phaseStarted) {
        out.push({
          id: `${p.id}__intro`,
          kind: 'intro',
          phase: p,
          chapters,
          tasks,
          firstTask: tasks[0] || null,
          nextPhase,
        })
      }
      tasks.forEach(t => out.push({
        id: t.id,
        kind: 'task',
        phase: p,
        chapter: chapters.find(c => c.id === t.chapterId),
        task: t,
        chapters,
        tasks,
      }))
      const allDone = tasks.length > 0 && tasks.every(t => isItemDone(t.id))
      const celebrated = hasConfettiFired(p.id)
      const completeId = `${p.id}__complete`
      const isCurrentSlide = activeId === completeId
      const isFinalPhase = pIdx === phasesData.length - 1
      if (isFinalPhase || !(allDone && celebrated) || isCurrentSlide) {
        out.push({
          id: completeId,
          kind: 'complete',
          phase: p,
          chapters,
          tasks,
          nextPhase,
          isFinalPhase,
        })
      }
    })
    return out
  }, [phasesData, isItemDone, celebratedTick, startedTick, activeId])

  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    if (!slides.length || activeId) return
    const locked = computePhaseLocked(phasesData, isItemDone)
    let persisted = null
    try { persisted = localStorage.getItem(ACTIVE_SLIDE_KEY) } catch {}
    if (persisted) {
      const persistedSlide = slides.find(s => s.id === persisted)
      if (persistedSlide && !locked[persistedSlide.phase.id]) {
        setActiveId(persisted)
        return
      }
    }
    const phaseWithIncomplete = phasesData.find(p =>
      p.chapters.flatMap(c => c.items).some(t => !isItemDone(t.id))
    )
    const target = phaseWithIncomplete
      ? slides.find(s => s.kind === 'intro' && s.phase.id === phaseWithIncomplete.id)
      : slides[0]
    setActiveId((target || slides[0]).id)
  }, [slides.length])

  const contentScrollRef = useRef(null)
  useEffect(() => {
    contentScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [activeId])

  useEffect(() => {
    if (!activeId) return
    try { localStorage.setItem(ACTIVE_SLIDE_KEY, activeId) } catch {}
  }, [activeId])

  const [visited, setVisited] = useState(() => new Set())
  useEffect(() => {
    if (!slides.length) return
    setVisited(prev => {
      const next = new Set(prev)
      slides.forEach(s => {
        if (s.kind === 'task' && isItemDone(s.id)) next.add(s.id)
      })
      return next
    })
  }, [slides.length])

  if (!team || !started) {
    return <Navigate to="/onboarding/team" replace state={{ from: location }} />
  }
  if (!slides.length) return null
  if (!activeId) return null

  const current = slides.find(s => s.id === activeId) || slides[0]
  const currentIdx = indexOf(slides, current.id)
  const next = currentIdx < slides.length - 1 ? slides[currentIdx + 1] : null

  if (current.kind === 'task' && !visited.has(current.id)) {
    Promise.resolve().then(() => {
      setVisited(prev => prev.has(current.id) ? prev : new Set([...prev, current.id]))
    })
  }

  const phaseLocked = computePhaseLocked(phasesData, isItemDone)

  const phaseSegments = phasesData.map(p => (PHASE_DAY_WEIGHTS[p.id] || 0) / TOTAL_DAYS * 100)
  const markerPositions = phaseSegments.reduce((acc, w) => {
    const last = acc.length ? acc[acc.length - 1] : 0
    acc.push(last + w)
    return acc
  }, [])
  const progressPct = phasesData.reduce((acc, p, i) => {
    const tasks = p.chapters.flatMap(c => c.items)
    if (!tasks.length) return acc
    const doneRatio = tasks.filter(t => isItemDone(t.id)).length / tasks.length
    return acc + doneRatio * phaseSegments[i]
  }, 0)

  function goTo(slideId) {
    setActiveId(slideId)
    const target = slides.find(s => s.id === slideId)
    if (target?.kind === 'task') {
      setVisited(prev => prev.has(slideId) ? prev : new Set([...prev, slideId]))
    }
  }

  function handleNext() {
    if (current.kind === 'intro') {
      markPhaseStarted(current.phase.id)
    }
    let phaseNowComplete = false
    if (current.kind === 'task') {
      const justMarked = !isItemDone(current.id)
      if (justMarked) markItemDone(current.id)
      const remaining = (current.tasks || []).filter(
        t => t.id !== current.id && !isItemDone(t.id)
      )
      phaseNowComplete = remaining.length === 0
    }
    if (phaseNowComplete) {
      const complete = slides.find(
        s => s.kind === 'complete' && s.phase.id === current.phase.id
      )
      if (complete && complete.id !== current.id) {
        goTo(complete.id)
        return
      }
    }
    if (next) goTo(next.id)
  }

  function handleToggleTask(taskId) {
    if (!visited.has(taskId)) return
    if (isItemDone(taskId)) unmarkItemDone(taskId)
    else markItemDone(taskId)
  }

  function handlePhaseClick(phaseId) {
    if (phaseLocked[phaseId]) return
    const intro = slides.find(s => s.kind === 'intro' && s.phase.id === phaseId)
    if (intro) { goTo(intro.id); return }
    const firstTask = slides.find(s => s.kind === 'task' && s.phase.id === phaseId)
    if (firstTask) { goTo(firstTask.id); return }
    const complete = slides.find(s => s.kind === 'complete' && s.phase.id === phaseId)
    if (complete) goTo(complete.id)
  }

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        paddingTop: HEADER_OFFSET_CSS,
        height: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="flex-1 flex flex-col lg:grid lg:grid-cols-[clamp(260px,calc(5vw+200px),340px)_1fr] min-h-0"
        style={{
          paddingBottom: `${MOBILE_BOTTOM_PILL_HEIGHT + 32}px`,
        }}
      >
        <Sidebar
          phase={current.phase}
          chapters={current.chapters}
          activeTaskId={current.kind === 'task' ? current.id : null}
          isItemDone={isItemDone}
          isItemVisited={id => visited.has(id)}
          onSelect={goTo}
          onToggle={handleToggleTask}
        />

        <div ref={contentScrollRef} className="flex-1 min-h-0 overflow-y-auto bg-white">
          <div className="max-w-[860px] mx-auto px-[clamp(20px,5vw,64px)] pt-[clamp(28px,5vh,96px)] pb-[clamp(40px,8vh,128px)] lg:pb-32">
            {current.kind === 'intro' && (
              <PhaseIntro slide={current} onStart={handleNext} />
            )}
            {current.kind === 'task' && (
              <TaskView slide={current} />
            )}
            {current.kind === 'complete' && (
              <PhaseComplete
                slide={current}
                isItemDone={isItemDone}
                onTaskClick={goTo}
              />
            )}
          </div>
        </div>

        {current.kind === 'task' && next && (
          <div
            className="fixed right-[clamp(17px,5vw,64px)] z-40 hidden lg:flex"
            style={{ bottom: PROGRESS_BAR_HEIGHT + 20 }}
          >
            <NavButton onClick={handleNext}>
              <span>Next</span>
              <span aria-hidden>&rarr;</span>
            </NavButton>
          </div>
        )}
        {current.kind === 'complete' && !current.isFinalPhase &&
         (current.tasks || []).every(t => isItemDone(t.id)) && (
          <div
            className="fixed right-[clamp(17px,5vw,64px)] z-40 hidden lg:flex"
            style={{ bottom: PROGRESS_BAR_HEIGHT + 24 }}
          >
            <PrimaryNavButton onClick={() => next && goTo(next.id)}>
              <span>{`Start ${current.nextPhase?.label || 'next phase'}`}</span>
              <span aria-hidden>&rarr;</span>
            </PrimaryNavButton>
          </div>
        )}
      </div>

      <MobileBottomBar
        open={sheetOpen}
        setOpen={setSheetOpen}
        phases={phasesData}
        phaseLocked={phaseLocked}
        onPhaseClick={handlePhaseClick}
        phase={current.phase}
        slideKind={current.kind}
        currentTaskTitle={current.kind === 'task' ? current.task.title : null}
        chapters={current.chapters}
        activeTaskId={current.kind === 'task' ? current.id : null}
        isItemDone={isItemDone}
        isItemVisited={id => visited.has(id)}
        onSelect={goTo}
        onToggle={handleToggleTask}
        actionLabel={
          current.kind === 'intro'
            ? `Start ${current.phase.label}`
            : current.kind === 'task'
              ? next
                ? 'Next'
                : null
              : current.kind === 'complete' &&
                !current.isFinalPhase &&
                (current.tasks || []).every(t => isItemDone(t.id))
                ? `Start ${current.nextPhase?.label || 'next phase'}`
                : null
        }
        actionLabelShort={
          current.kind === 'intro'
            ? 'Start'
            : current.kind === 'task'
              ? 'Next'
              : current.kind === 'complete' &&
                !current.isFinalPhase &&
                (current.tasks || []).every(t => isItemDone(t.id))
                ? current.nextPhase?.label || 'Next'
                : null
        }
        onAction={
          current.kind === 'intro'
            ? handleNext
            : current.kind === 'task' && next
              ? handleNext
              : current.kind === 'complete' &&
                !current.isFinalPhase &&
                next &&
                (current.tasks || []).every(t => isItemDone(t.id))
                ? () => goTo(next.id)
                : null
        }
      />

      <ProgressBar
        phases={phasesData}
        markerPositions={markerPositions}
        progressPct={progressPct}
        phaseLocked={phaseLocked}
        onPhaseClick={handlePhaseClick}
      />
    </div>
  )
}

function Sidebar(props) {
  return (
    <nav className="hidden lg:flex flex-col h-full overflow-y-auto py-10 pl-[clamp(17px,5vw,64px)] pr-6 border-r border-[#E1E7E7] bg-white">
      <SidebarContent {...props} />
    </nav>
  )
}

function SidebarContent({
  phase,
  chapters,
  activeTaskId,
  isItemDone,
  isItemVisited,
  onSelect,
  onToggle,
  onItemClick,
}) {
  return (
    <>
      <div className="mb-10">
        <div className="font-head text-[clamp(28px,3vw,40px)] font-medium tracking-[-0.02em] leading-none text-made-neutral-100">
          {phase.label}
        </div>
      </div>
      <div className="flex flex-col gap-7">
        {chapters.map(ch => (
          <div key={ch.id}>
            <div className="text-[12px] font-medium uppercase tracking-[0.1em] text-[#6F8484] mb-3">
              {ch.title}
            </div>
            <ul className="flex flex-col">
              {ch.items.map(item => {
                const done = isItemDone(item.id)
                const visited = isItemVisited(item.id)
                const active = activeTaskId === item.id
                const canCheck = visited
                return (
                  <li key={item.id} className="flex items-start gap-3 py-1.5">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={done}
                      aria-disabled={!canCheck}
                      aria-label={
                        !canCheck
                          ? `"${item.title}" — open it before marking done`
                          : done
                            ? `Mark "${item.title}" not done`
                            : `Mark "${item.title}" done`
                      }
                      onClick={() => onToggle(item.id)}
                      className={`mt-[3px] shrink-0 w-4 h-4 border flex items-center justify-center transition-colors ${
                        done
                          ? active
                            ? 'bg-made-neutral-100 border-made-neutral-100 text-white'
                            : 'bg-[#A0ABAB] border-[#A0ABAB] text-white'
                          : canCheck
                            ? 'border-[#A0ABAB] hover:border-made-neutral-100 bg-white cursor-pointer'
                            : 'border-[#EDEDED] bg-[#F8FAFA] cursor-not-allowed'
                      }`}
                    >
                      {done && <CheckIcon className="w-3 h-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(item.id)
                        onItemClick?.()
                      }}
                      className={`flex-1 text-left text-[14px] leading-snug transition-colors cursor-pointer ${
                        active
                          ? 'text-made-neutral-100 font-medium'
                          : done
                            ? 'text-[#A0ABAB] hover:text-made-neutral-100'
                            : 'text-made-neutral-100 hover:text-[#6324F3]'
                      }`}
                    >
                      {item.title}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </>
  )
}

function CheckIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" className={className} aria-hidden>
      <path d="M2 6l3 3L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MadeArrow({ className = '' }) {
  return (
    <svg
      viewBox="0 0 35.98 23.34"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <polygon points="35.98 12.79 35.98 13.54 0 13.54 0 10.54 29.49 10.54 21.06 2.12 23.18 0 33.73 10.54 35.98 12.79" />
      <rect
        x="23.43"
        y="18.66"
        width="6"
        height="3"
        transform="translate(-6.51 24.59) rotate(-45)"
      />
    </svg>
  )
}


function PhaseIntro({ slide, onStart }) {
  const { phase, firstTask } = slide
  const introMap = {
    day1: 'Ready to get set up?',
    week1: 'Ready to start your first week?',
    month1: 'Ready to make your first month count?',
  }
  return (
    <div>
      <div className="text-[13px] font-medium uppercase tracking-[0.12em] text-[#6F8484] mb-6">
        {phase.label}
      </div>
      <h1 className="font-head text-[clamp(40px,6vw,72px)] font-medium tracking-[-0.03em] leading-[1.05] text-made-neutral-100 mb-6">
        {introMap[phase.id] || `Ready to start ${phase.label}?`}
      </h1>
      <p className="text-[clamp(16px,1.6vw,18px)] leading-[1.6] text-[#6F8484] max-w-[600px] mb-12">
        {phase.longDescription}
      </p>
      <div className="hidden lg:inline-flex">
        <PrimaryNavButton onClick={onStart}>
          <span>Start {phase.label}</span>
          <span aria-hidden>&rarr;</span>
        </PrimaryNavButton>
      </div>
    </div>
  )
}

function TaskView({ slide }) {
  const { phase, chapter, task } = slide
  return (
    <div>
      <div className="text-[12px] uppercase tracking-[0.14em] text-[#6F8484] mb-5">
        {phase.label}
        {chapter && <span> &nbsp;/&nbsp; {chapter.title}</span>}
      </div>
      <div className="flex items-start gap-4 mb-8">
        {task.logo && (
          <SetupLogo
            logo={task.logo}
            name={task.title}
            className="shrink-0 w-10 h-10 sm:w-12 sm:h-12"
          />
        )}
        <h1 className="font-head text-[clamp(32px,4vw,52px)] font-medium tracking-[-0.02em] leading-[1.05] text-made-neutral-100 min-w-0 flex-1">
          {task.title}
        </h1>
      </div>

      {task.description && (
        <p className="text-[clamp(16px,1.5vw,19px)] leading-[1.7] text-[#3B4747] mb-8 max-w-[720px]">
          {task.description}
        </p>
      )}

      {task.setupUrl && (
        <a
          href={task.setupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 mb-10 text-[14px] font-medium text-made-neutral-100 hover:text-[#6324F3] transition-colors duration-200"
        >
          <span className="border-b border-current pb-0.5">Open the setup page</span>
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">↗</span>
        </a>
      )}

      {task.slides && task.slides.length > 0 && <SlideDeck slides={task.slides} />}

      {task.handbook && <HandbookPointer handbook={task.handbook} />}

      {task.steps && task.steps.length > 0 && (
        <div className="mb-10 border border-[#EDEDED] p-7 sm:p-9">
          <h3 className="text-[12px] font-medium text-made-neutral-100 mb-5 uppercase tracking-[0.12em]">
            What to do
          </h3>
          <ol className="space-y-3.5">
            {task.steps.map((step, i) => (
              <li key={i} className="flex gap-4 text-[16px] leading-relaxed text-[#3B4747]">
                <span className="shrink-0 font-head text-[15px] font-medium text-made-neutral-100 mt-0.5 w-6">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {task.tip && (
            <div className="mt-6 pt-5 border-t border-[#EDEDED] text-[13px] text-[#6F8484]">
              <span className="font-medium text-made-neutral-100">Tip · </span>
              {task.tip}
            </div>
          )}
        </div>
      )}

      {task.videos && task.videos.length > 0 && (
        <div className="mb-10 space-y-6">
          {task.videos.map(v => (
            <VideoEmbed key={v.youtubeId} title={v.title} youtubeId={v.youtubeId} />
          ))}
        </div>
      )}
    </div>
  )
}

const HANDBOOK_TOUR_NAME = 'handbook-navigation'

function HandbookPointer({ handbook }) {
  const { chapterId, articleId } = handbook
  const chapter = CHAPTERS.find(c => c.id === chapterId)
  const article = chapter?.sections.flatMap(s => s.items).find(i => i.id === articleId)
  const handbookUrl = articleId
    ? `/handbook/${chapterId}/${articleId}`
    : `/handbook/${chapterId}`
  const { startTour, hasSeen } = useTour()

  const desktopSteps = [
    {
      findTarget: () => document.querySelector('[data-tour="handbook-nav"]'),
      label: 'Open the Handbook from the top navigation.',
      advanceOnPath: (p) => p === '/handbook' || p.startsWith('/handbook/'),
    },
    {
      findTarget: () => {
        if (!chapter) return null
        const imgs = Array.from(document.querySelectorAll(`img[alt="${chapter.title}"]`))
        const visible = imgs.find(img => img.offsetParent !== null)
        const img = visible || imgs[0]
        if (!img) return null
        return img.closest('.cursor-pointer') || img.parentElement || img
      },
      label: `Open the chapter "${chapter?.title || 'Handbook'}".`,
      advanceOnPath: (p) => p.startsWith(`/handbook/${chapterId}`),
      bodyClass: 'tour-freeze-handbook-cards',
    },
    article && {
      findTarget: () => {
        const links = Array.from(document.querySelectorAll(`a[href="#${articleId}"]`))
        return links.find(a => a.offsetParent !== null) || links[0] || null
      },
      label: `Click the article "${article.title}". Read it through, then come back to mark this task done.`,
      advanceOnPath: (p) => p === `/handbook/${chapterId}/${articleId}`,
      advanceOnClick: true,
      onEnter: () => {
        const sidebarLink = Array.from(
          document.querySelectorAll(`a[href="#${articleId}"]`)
        ).find(a => a.offsetParent !== null)
        const anchor = sidebarLink?.closest('nav') || sidebarLink
        if (!anchor) return
        const r = anchor.getBoundingClientRect()
        const headerH = 30
        window.scrollTo({
          top: window.scrollY + r.top - headerH,
          behavior: 'smooth',
        })
      },
    },
  ].filter(Boolean)

  const mobileSteps = [
    {
      findTarget: () => document.querySelector('button[aria-label="Open menu"]'),
      label: 'Tap the menu icon to open the navigation.',
      advanceOnClick: true,
    },
    {
      findTarget: () => {
        const links = Array.from(document.querySelectorAll('a[href="/handbook"]'))
        return links.find(a => a.offsetParent !== null) || links[0] || null
      },
      label: 'Tap Handbook from the menu.',
      advanceOnPath: (p) => p === '/handbook' || p.startsWith('/handbook/'),
    },
    {
      findTarget: () => {
        if (!chapter) return null
        const imgs = Array.from(document.querySelectorAll(`img[alt="${chapter.title}"]`))
        const visible = imgs.find(img => img.offsetParent !== null)
        const img = visible || imgs[0]
        if (!img) return null
        return img.closest('.cursor-pointer') || img.parentElement || img
      },
      label: `Open the chapter "${chapter?.title || 'Handbook'}".`,
      advanceOnPath: (p) => p.startsWith(`/handbook/${chapterId}`),
    },
    article && {
      findTarget: () => {
        return document.querySelector('button[aria-haspopup="dialog"]')
      },
      label: 'Tap this pill to see all chapter sections.',
      advanceOnClick: true,
      onEnter: () => {
        window.scrollTo({
          top: window.innerHeight * 1.1,
          behavior: 'auto',
        })
      },
    },
    article && {
      findTarget: () => {
        const selectors = [
          `a[href="/handbook/${chapterId}/${articleId}"]`,
          `a[href="#${articleId}"]`,
        ]
        for (const sel of selectors) {
          const links = Array.from(document.querySelectorAll(sel))
          const vis = links.find(a => a.offsetParent !== null)
          if (vis) return vis
        }
        return null
      },
      label: `Tap the article "${article.title}". Read it through, then come back to mark this task done.`,
      advanceOnPath: (p) => p === `/handbook/${chapterId}/${articleId}`,
      advanceOnClick: true,
    },
  ].filter(Boolean)

  function launchTour() {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024
    startTour(HANDBOOK_TOUR_NAME, isMobile ? mobileSteps : desktopSteps)
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return
    if (hasSeen(HANDBOOK_TOUR_NAME)) return
    const t = setTimeout(launchTour, 400)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="mb-10 border border-[#EDEDED] p-7 sm:p-9 bg-white">
      <h3 className="text-[12px] font-medium text-made-neutral-100 mb-5 uppercase tracking-[0.12em]">
        What to do
      </h3>
      <p className="text-[16px] leading-[1.7] text-[#3B4747] mb-6">
        This one lives in the handbook — the place you'll come back to whenever
        you need to look something up. Take a minute to find it yourself so you
        know your way around for next time.
      </p>
      <div className="border-t border-[#EDEDED] pt-5">
        <div className="text-[12px] font-medium text-made-neutral-100 mb-4 uppercase tracking-[0.12em]">
          How to find it
        </div>
        <ol className="space-y-3.5">
          {[
            <>Open <span className="font-medium text-made-neutral-100">Handbook</span> from the top navigation.</>,
            <>Pick the chapter <span className="font-medium text-made-neutral-100">{chapter?.title || 'Handbook'}</span>.</>,
            article
              ? <>Find and read the article <span className="font-medium text-made-neutral-100">{article.title}</span>.</>
              : <>Read through the chapter.</>,
            <>Come back here and check this task off.</>,
          ].map((step, i) => (
            <li key={i} className="flex gap-4 text-[16px] leading-relaxed text-[#3B4747]">
              <span className="shrink-0 font-head text-[15px] font-medium text-made-neutral-100 mt-0.5 w-6">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
          <button
            type="button"
            onClick={launchTour}
            className="hidden lg:inline-flex text-[13px] font-medium text-made-neutral-100 hover:text-[#6324F3] transition-colors"
          >
            <span className="border-b border-current pb-0.5">Show me how</span>
          </button>
          <Link
            to={handbookUrl}
            className="group inline-flex items-center gap-2 text-[12px] text-[#6F8484] hover:text-made-neutral-100 transition-colors border-b border-current pb-1"
          >
            <span>Or jump straight there</span>
            <MadeArrow className="w-[14px] h-auto shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function VideoEmbed({ title, youtubeId }) {
  const src = `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1`
  return (
    <div>
      {title && <div className="text-[13px] font-medium text-made-neutral-100 mb-2">{title}</div>}
      <div className="relative w-full aspect-video overflow-hidden border border-[#EDEDED] bg-[#0F1010]">
        <iframe
          src={src}
          title={title || 'Tutorial video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  )
}

function SlideDeck({ slides }) {
  const [idx, setIdx] = useState(0)
  const total = slides.length
  const slide = slides[idx]
  const prev = () => setIdx(i => (i > 0 ? i - 1 : i))
  const next = () => setIdx(i => (i < total - 1 ? i + 1 : i))
  return (
    <div className="mb-10 border border-[#EDEDED] bg-white">
      <div className="aspect-[16/9] p-8 sm:p-12 flex flex-col justify-center bg-[#FAFBFB] border-b border-[#EDEDED]">
        <div className="text-[11px] uppercase tracking-[0.14em] text-[#6F8484] mb-4">
          Slide {String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
        <h3 className="font-head text-[clamp(22px,2.4vw,32px)] font-medium tracking-[-0.015em] leading-tight text-made-neutral-100 mb-4">
          {slide.title}
        </h3>
        <p className="text-[15px] leading-relaxed text-[#3B4747] max-w-[560px]">
          {slide.body}
        </p>
      </div>
      <div className="flex items-center justify-between px-5 py-4">
        <button
          type="button"
          onClick={prev}
          disabled={idx === 0}
          className="text-[13px] font-medium text-made-neutral-100 hover:text-[#6324F3] transition-colors disabled:text-[#D6DDDD] disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-2"
        >
          <span aria-hidden>&larr;</span> Previous
        </button>
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`w-1.5 h-1.5 rounded-full transition-colors cursor-pointer ${
                i === idx ? 'bg-made-neutral-100' : 'bg-[#D6DDDD] hover:bg-[#A0ABAB]'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={next}
          disabled={idx === total - 1}
          className="text-[13px] font-medium text-made-neutral-100 hover:text-[#6324F3] transition-colors disabled:text-[#D6DDDD] disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-2"
        >
          Next <span aria-hidden>&rarr;</span>
        </button>
      </div>
    </div>
  )
}

function PhaseComplete({ slide, isItemDone, onTaskClick }) {
  const { phase, nextPhase, isFinalPhase, tasks } = slide
  const headlineMap = {
    day1: 'Day 1 done. Nicely done.',
    week1: 'First week wrapped.',
    month1: "That's a wrap. Welcome to Made.",
  }

  const uncheckedTasks = (tasks || []).filter(t => !isItemDone(t.id))
  const allDone = uncheckedTasks.length === 0

  useEffect(() => {
    if (!allDone) return
    if (hasConfettiFired(phase.id)) return
    markConfettiFired(phase.id)

    const colors = ['#6324F3', '#8E5CFF', '#0F1010', '#FFFFFF', '#D6DDDD']
    const opts = { startVelocity: 45, spread: 70, ticks: 200, scalar: 1.05, colors, zIndex: 9999 }
    confetti({ ...opts, particleCount: 80, angle: 60,  origin: { x: 0,   y: 0.85 } })
    confetti({ ...opts, particleCount: 80, angle: 120, origin: { x: 1,   y: 0.85 } })
    setTimeout(() => {
      confetti({ ...opts, particleCount: 120, spread: 120, origin: { x: 0.5, y: 0.4 } })
    }, 250)
  }, [phase.id, allDone])

  if (!allDone) {
    return (
      <div>
        <h1 className="font-head text-[clamp(40px,6vw,72px)] font-medium tracking-[-0.03em] leading-[1.05] text-made-neutral-100 mb-6">
          Almost done with {phase.label}.
        </h1>
        <p className="text-[clamp(16px,1.6vw,18px)] leading-[1.6] text-[#6F8484] max-w-[620px] mb-10">
          {uncheckedTasks.length === 1
            ? 'One task is still unchecked. Finish it to wrap up the phase.'
            : `${uncheckedTasks.length} tasks are still unchecked. Finish them to wrap up the phase.`}
        </p>
        <ul className="flex flex-col">
          {uncheckedTasks.map(t => (
            <li key={t.id} className="border-b border-[#EDEDED] last:border-b-0">
              <button
                type="button"
                onClick={() => onTaskClick?.(t.id)}
                className="group w-full flex items-center justify-between gap-4 py-4 text-left"
              >
                <span className="font-head text-[18px] font-medium text-made-neutral-100 group-hover:text-[#6324F3] transition-colors">
                  {t.title}
                </span>
                <span aria-hidden className="text-made-neutral-100 group-hover:text-[#6324F3] group-hover:translate-x-0.5 transition-all duration-200">
                  &rarr;
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-head text-[clamp(40px,6vw,72px)] font-medium tracking-[-0.03em] leading-[1.05] text-made-neutral-100 mb-6">
        {headlineMap[phase.id] || `${phase.label} complete!`}
      </h1>
      <p className="text-[clamp(16px,1.6vw,18px)] leading-[1.6] text-[#6F8484] max-w-[620px] mb-10">
        {isFinalPhase
          ? "You've made it through the full onboarding. Everything you set up is yours to revisit any time from the handbook or tools."
          : nextPhase
            ? nextPhase.longDescription
            : 'Take a breath and come back when you are ready.'}
      </p>

      {!isFinalPhase && nextPhase && (
        <div className="mb-12 border-t border-[#EDEDED] pt-8">
          <div className="text-[12px] uppercase tracking-[0.14em] text-[#6F8484] mb-4">
            Up next &nbsp;/&nbsp; {nextPhase.label}
          </div>
          <ul className="flex flex-col gap-2">
            {(nextPhase.chapters || []).map(c => (
              <li
                key={c.id}
                className="font-head text-[18px] font-medium text-made-neutral-100 leading-snug"
              >
                {c.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isFinalPhase && (
        <div className="mt-12 sm:mt-14 lg:mt-16 flex flex-col">
          {[
            { to: '/handbook', label: 'Handbook', body: 'Procedures, policies and the small details that make Made tick.' },
            { to: '/tools',    label: 'Tools',    body: 'Every tool we use to design, build, ship and stay in sync.' },
          ].map((item, i) => (
            <div
              key={item.to}
              className={i > 0 ? 'border-t border-[#E1E7E7]' : ''}
            >
              <Link
                to={item.to}
                className="group flex items-center justify-between gap-6 py-6 sm:py-8"
              >
                <div className="min-w-0">
                  <h3 className="font-body font-medium tracking-[-0.005em] text-[clamp(22px,2.4vw,32px)] leading-[1.2] text-made-neutral-100 group-hover:translate-x-1 transition-transform duration-300 ease-out">
                    {item.label}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-made-neutral-100 max-w-[480px]">
                    {item.body}
                  </p>
                </div>
                <span
                  aria-hidden
                  className="shrink-0 inline-block text-[28px] leading-none text-made-neutral-100 transition-transform duration-300 ease-out group-hover:translate-x-2 group-hover:scale-110"
                >
                  &rarr;
                </span>
              </Link>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

function ProgressBar({ phases, markerPositions, progressPct, phaseLocked, onPhaseClick }) {
  const [hoveredId, setHoveredId] = useState(null)
  return (
    <div
      className="hidden lg:block fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E1E7E7]"
      style={{ height: 'clamp(72px, 9vh, 88px)' }}
    >
      <div className="h-full px-[clamp(20px,5vw,64px)] flex flex-col justify-center gap-2.5 sm:gap-3.5">
        <div className="relative h-[2px] bg-[#E1E7E7] mx-2">
          <div
            className="absolute left-0 top-0 bottom-0 bg-made-neutral-100 transition-[width] duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
          {markerPositions.map((pct, i) => {
            const phaseId = phases[i].id
            const locked = !!phaseLocked?.[phaseId]
            const reached = progressPct >= pct - 0.01
            const hovered = !locked && hoveredId === phaseId
            return (
              <button
                key={phaseId}
                type="button"
                onClick={() => onPhaseClick(phaseId)}
                onMouseEnter={() => !locked && setHoveredId(phaseId)}
                onMouseLeave={() => setHoveredId(null)}
                aria-disabled={locked}
                aria-label={
                  locked
                    ? `${phases[i].label} — locked, finish the previous phase first`
                    : `Go to ${phases[i].label}`
                }
                className={`absolute top-1/2 w-2 h-2 rounded-full border transition-all duration-200 ${
                  locked
                    ? 'bg-white border-[#D6DDDD] cursor-not-allowed'
                    : hovered
                      ? 'border-made-neutral-100 bg-made-neutral-100 scale-[1.6] cursor-pointer'
                      : reached
                        ? 'bg-made-neutral-100 border-made-neutral-100 cursor-pointer'
                        : 'bg-white border-made-neutral-100 cursor-pointer'
                }`}
                style={{
                  left: `${pct}%`,
                  transform: hovered
                    ? 'translate(-50%, -50%) scale(1.6)'
                    : 'translate(-50%, -50%)',
                  transformOrigin: 'center',
                }}
              />
            )
          })}
        </div>
        <div className="relative h-[14px] text-[11px] font-medium uppercase tracking-[0.12em] mx-2">
          {phases.map((p, i) => {
            const locked = !!phaseLocked?.[p.id]
            const hovered = !locked && hoveredId === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onPhaseClick(p.id)}
                onMouseEnter={() => !locked && setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}
                aria-disabled={locked}
                className={`absolute whitespace-nowrap transition-all duration-200 ${
                  locked
                    ? 'text-[#A0ABAB] cursor-not-allowed font-medium'
                    : `cursor-pointer text-made-neutral-100 ${hovered ? 'font-semibold' : 'font-medium'}`
                }`}
                style={{
                  left: `${markerPositions[i]}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <span
                  className={`inline-block transition-transform duration-200 ${
                    hovered ? '-translate-y-[2px]' : ''
                  }`}
                >
                  {p.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function NavButton({ onClick, children, ariaLabel, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 2xl:px-5 2xl:py-3 min-[1700px]:px-7 min-[1700px]:py-4 text-[13px] 2xl:text-[14px] min-[1700px]:text-[16px] font-medium border border-made-neutral-100 bg-white text-made-neutral-100 hover:bg-[#6324F3] hover:border-[#6324F3] hover:text-white transition-colors duration-150 cursor-pointer ${className}`}
    >
      {children}
    </button>
  )
}

function PrimaryNavButton({ onClick, children, ariaLabel, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`group relative inline-flex items-center justify-center gap-3 px-7 py-4 2xl:px-8 2xl:py-5 min-[1700px]:px-10 min-[1700px]:py-6 text-[15px] 2xl:text-[16px] min-[1700px]:text-[18px] font-medium border border-made-neutral-100 bg-white text-made-neutral-100 overflow-hidden transition-colors duration-300 cursor-pointer ${className}`}
    >
      <span aria-hidden className="absolute inset-0 bg-[#6324F3] -translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
      <span className="relative z-10 inline-flex items-center gap-3 transition-colors duration-300 group-hover:text-white group-hover:border-[#6324F3]">
        {children}
      </span>
    </button>
  )
}

function PhaseNavInOverlay({ phases, currentPhaseId, isItemDone, phaseLocked, onPhaseClick }) {
  if (!phases?.length) return null
  return (
    <div className="shrink-0 px-[clamp(20px,5vw,64px)] pt-5 pb-5 border-t border-[#EDEDED]">
      <div className="flex items-stretch gap-2">
        {phases.map(p => {
          const tasks = p.chapters.flatMap(c => c.items)
          const done = tasks.filter(t => isItemDone(t.id)).length
          const total = tasks.length
          const pct = total ? Math.round((done / total) * 100) : 0
          const active = p.id === currentPhaseId
          const locked = !!phaseLocked?.[p.id]
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onPhaseClick(p.id)}
              disabled={locked}
              aria-disabled={locked}
              className={`flex-1 flex flex-col items-start gap-1.5 text-left group ${
                locked ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
              aria-current={active ? 'true' : undefined}
            >
              <span
                className={`text-[11px] uppercase tracking-[0.12em] transition-colors ${
                  active
                    ? 'text-made-neutral-100 font-semibold'
                    : locked
                      ? 'text-[#A0ABAB] font-medium'
                      : 'text-[#6F8484] font-medium group-hover:text-made-neutral-100'
                }`}
              >
                {p.label}
              </span>
              <span className="relative w-full h-[2px] bg-[#E1E7E7] overflow-hidden">
                <span
                  className="absolute inset-y-0 left-0 bg-made-neutral-100 transition-[width] duration-300 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className={`text-[10px] tabular-nums ${locked ? 'text-[#A0ABAB]' : 'text-[#6F8484]'}`}>
                {done}/{total}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function MobileBottomBar({
  open,
  setOpen,
  phases,
  phaseLocked,
  onPhaseClick,
  phase,
  slideKind,
  currentTaskTitle,
  chapters,
  activeTaskId,
  isItemDone,
  isItemVisited,
  onSelect,
  onToggle,
  actionLabel,
  actionLabelShort,
  onAction,
}) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  const whereLabel =
    slideKind === 'task' && currentTaskTitle
      ? currentTaskTitle
      : slideKind === 'complete'
        ? `${phase.label} complete`
        : phase.label

  return (
    <>
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-[rgba(15,16,16,0.45)] backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div
        className={`lg:hidden fixed left-4 right-4 bottom-4 z-50 bg-white border border-[#E1E7E7] flex flex-col ${
          open ? 'translate-y-0' : 'translate-y-[100vh]'
        }`}
        style={{
          top: 'calc(clamp(72px, 5.5vh, 108px) + 16px)',
          boxShadow: open
            ? '0 24px 48px -16px rgba(15,16,16,0.35), 0 8px 16px -8px rgba(15,16,16,0.18)'
            : '0 2px 8px rgba(15,16,16,0.04)',
          visibility: open ? 'visible' : 'hidden',
          transition:
            'transform 380ms cubic-bezier(0.22,0.65,0.4,0.95), box-shadow 380ms cubic-bezier(0.22,0.65,0.4,0.95), visibility 380ms cubic-bezier(0.22,0.65,0.4,0.95)',
        }}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-label={`${phase.label} outline`}
      >
        <div className="shrink-0 flex items-start justify-end px-[clamp(20px,5vw,64px)] pt-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close phase outline"
            className="-mt-1 -mr-1 w-9 h-9 flex items-center justify-center text-made-neutral-60 hover:text-made-neutral-100 transition-colors"
          >
            <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-[clamp(20px,5vw,64px)] pb-8">
          <SidebarContent
            phase={phase}
            chapters={chapters}
            activeTaskId={activeTaskId}
            isItemDone={isItemDone}
            isItemVisited={isItemVisited}
            onSelect={onSelect}
            onToggle={onToggle}
            onItemClick={() => setOpen(false)}
          />
        </div>
        <PhaseNavInOverlay
          phases={phases}
          currentPhaseId={phase.id}
          isItemDone={isItemDone}
          phaseLocked={phaseLocked}
          onPhaseClick={(id) => {
            if (phaseLocked?.[id]) return
            onPhaseClick(id)
            setOpen(false)
          }}
        />
      </div>

      <div
        className={`lg:hidden fixed left-4 right-4 bottom-4 z-30 items-stretch bg-white border border-[#E1E7E7] ${
          open ? 'hidden' : 'flex'
        }`}
        style={{
          height: MOBILE_BOTTOM_PILL_HEIGHT,
          boxShadow: '0 2px 8px rgba(15,16,16,0.04)',
        }}
      >
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-label="Open phase outline"
          className="flex-1 flex items-center gap-3 px-5 text-left min-w-0"
        >
          <svg
            viewBox="0 0 16 16"
            className="shrink-0 w-4 h-4 text-made-neutral-100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            <path d="M2 4h12M2 8h12M2 12h12" />
          </svg>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#6F8484] leading-none">
              {phase.label}
            </div>
            <div className="text-[13px] font-medium text-made-neutral-100 truncate leading-tight mt-1">
              {whereLabel}
            </div>
          </div>
        </button>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="shrink-0 px-5 flex items-center gap-2 border-l border-[#E1E7E7] bg-made-neutral-100 text-white text-[13px] font-medium active:bg-[#1A1B1B] transition-colors"
          >
            <span className="hidden sm:inline">{actionLabel}</span>
            <span className="sm:hidden">{actionLabelShort || 'Next'}</span>
            <span aria-hidden>&rarr;</span>
          </button>
        )}
      </div>
    </>
  )
}
