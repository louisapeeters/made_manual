import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTour } from '../context/TourContext'

function CrossIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 17 17" fill="currentColor" className={className} aria-hidden>
      <path d="M10.2 0H6.8V6.8H10.2V0Z" />
      <path d="M17 6.8H10.2V10.2H17V6.8Z" />
      <path d="M10.2 10.2H6.8V17H10.2V10.2Z" />
      <path d="M3.4 6.8H0V10.2H3.4V6.8Z" />
    </svg>
  )
}

function ChevronRight({ className = '' }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 2 L8 6 L4 10" />
    </svg>
  )
}

const PAD = 10
const POLL_MS = 150

function rectFor(el) {
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (r.width === 0 && r.height === 0) return null
  return {
    top: r.top - PAD,
    left: r.left - PAD,
    width: r.width + PAD * 2,
    height: r.height + PAD * 2,
  }
}

export default function TourOverlay() {
  const { tour, advance, endTour } = useTour()
  const location = useLocation()
  const [rect, setRect] = useState(null)
  const enteredStepRef = useRef(null)

  const step = tour ? tour.steps[tour.currentIdx] : null
  const stepKey = tour ? `${tour.name}:${tour.currentIdx}` : null

  useEffect(() => {
    if (!step || enteredStepRef.current === stepKey) return
    enteredStepRef.current = stepKey
    if (typeof step.onEnter === 'function') {
      const t = setTimeout(() => { step.onEnter() }, 80)
      return () => clearTimeout(t)
    }
  }, [step, stepKey])

  useEffect(() => {
    if (!step?.bodyClass) return
    document.body.classList.add(step.bodyClass)
    return () => document.body.classList.remove(step.bodyClass)
  }, [step])

  useEffect(() => {
    if (!step) { setRect(null); return }
    let cancelled = false
    function measure() {
      if (cancelled) return
      const target = step.findTarget?.()
      setRect(rectFor(target))
    }
    measure()
    const id = setInterval(measure, POLL_MS)
    window.addEventListener('scroll', measure, true)
    window.addEventListener('resize', measure)
    return () => {
      cancelled = true
      clearInterval(id)
      window.removeEventListener('scroll', measure, true)
      window.removeEventListener('resize', measure)
    }
  }, [step])

  useEffect(() => {
    if (!step?.advanceOnPath) return
    if (step.advanceOnPath(location.pathname)) advance()
  }, [location.pathname, step, advance])

  useEffect(() => {
    if (!step?.advanceOnClick) return
    const target = step.findTarget?.()
    if (!target) return
    function onClick() { advance() }
    target.addEventListener('click', onClick)
    return () => target.removeEventListener('click', onClick)
  }, [step, rect, advance])

  if (!tour || !step) return null

  if (!rect) {
    return (
      <div className="fixed inset-0 z-[200] bg-[rgba(15,16,16,0.30)] pointer-events-auto" />
    )
  }

  const totalSteps = tour.steps.length
  const stepNum = tour.currentIdx + 1

  const BADGE_GAP = 18
  const BADGE_HEIGHT_GUESS = 116
  const BADGE_WIDTH = 340
  const targetInViewport =
    rect.top < window.innerHeight - 8 && rect.top + rect.height > 8
  let badgeTop, badgeLeft
  if (targetInViewport) {
    const placeBelow =
      rect.top + rect.height + BADGE_GAP + BADGE_HEIGHT_GUESS < window.innerHeight
    badgeTop = placeBelow
      ? rect.top + rect.height + BADGE_GAP
      : Math.max(8, rect.top - BADGE_GAP - BADGE_HEIGHT_GUESS)
    badgeLeft = Math.min(
      Math.max(8, rect.left),
      window.innerWidth - BADGE_WIDTH - 8,
    )
  } else {
    badgeTop = Math.max(8, (window.innerHeight - BADGE_HEIGHT_GUESS) / 2)
    badgeLeft = Math.max(8, (window.innerWidth - BADGE_WIDTH) / 2)
  }

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden
      >
        <defs>
          <mask id="tour-spotlight">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={rect.left}
              y={rect.top}
              width={rect.width}
              height={rect.height}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15,16,16,0.38)"
          mask="url(#tour-spotlight)"
        />
      </svg>

      <div
        className="absolute pointer-events-auto left-0 right-0 top-0"
        style={{ height: Math.max(0, rect.top) }}
      />
      <div
        className="absolute pointer-events-auto left-0 right-0"
        style={{ top: rect.top + rect.height, bottom: 0 }}
      />
      <div
        className="absolute pointer-events-auto left-0"
        style={{ top: rect.top, width: Math.max(0, rect.left), height: rect.height }}
      />
      <div
        className="absolute pointer-events-auto"
        style={{
          top: rect.top,
          left: rect.left + rect.width,
          right: 0,
          height: rect.height,
        }}
      />

      <div
        className="absolute pointer-events-none tour-halo"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        }}
      />

      <div
        className="absolute pointer-events-auto w-[340px] max-w-[calc(100vw-16px)] tour-badge-in bg-white"
        style={{
          top: badgeTop,
          left: badgeLeft,
          border: '1px solid #E1E7E7',
          boxShadow:
            '0 1px 2px rgba(15,16,16,0.08), 0 32px 64px -12px rgba(15,16,16,0.45)',
        }}
      >
        <div className="px-5 pt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CrossIcon className="w-[11px] h-[11px] text-[#6324F3]" />
            <span className="text-[10px] uppercase tracking-[0.16em] text-made-neutral-100 font-medium">
              Quick tour
            </span>
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#A0ABAB]">
              {stepNum} / {totalSteps}
            </span>
          </div>
          <button
            type="button"
            onClick={endTour}
            className="text-[11px] text-[#6F8484] hover:text-made-neutral-100 transition-colors uppercase tracking-[0.12em]"
          >
            Skip
          </button>
        </div>
        <div className="px-5 pb-4 pt-3 flex items-center gap-3">
          <p className="flex-1 font-body text-[14px] font-normal leading-[1.55] text-made-neutral-100">
            {step.label}
          </p>
          <button
            type="button"
            onClick={() => {
              const target = step.findTarget?.()
              if (target) {
                target.dispatchEvent(new MouseEvent('click', {
                  bubbles: true,
                  cancelable: true,
                  view: window,
                }))
              } else {
                advance()
              }
            }}
            aria-label="Next step"
            className="shrink-0 inline-flex items-center justify-center w-8 h-8 text-[#6F8484] hover:text-made-neutral-100 transition-colors duration-150"
          >
            <ChevronRight className="w-[14px] h-[14px]" />
          </button>
        </div>
        <div className="h-[2px] bg-[#EDEDED] overflow-hidden">
          <div
            className="h-full bg-[#6324F3] transition-[width] duration-300 ease-out"
            style={{ width: `${(stepNum / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
