import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useLayoutEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CHAPTERS } from '../data/chapters'
import { getArticleContent } from '../data/handbookContent'

const HEADER_OFFSET = 'clamp(72px,5.5vh,108px)'
const HEADER_OFFSET_CSS = 'calc(100vh - clamp(72px,5.5vh,108px) + 2px)'

function getHeaderOffsetPx() {
  return Math.min(108, Math.max(72, 0.055 * window.innerHeight))
}

export default function HandbookDetail() {
  const { chapterId, articleId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeId, setActiveId] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState(() => new Set())
  const contentRef = useRef(null)
  const [pastHero, setPastHero] = useState(false)
  const [atPageBottom, setAtPageBottom] = useState(false)
  const [atArticleEnd, setAtArticleEnd] = useState(false)

  const chapter = CHAPTERS.find(c => c.id === chapterId)
  const chapterIndex = chapter ? CHAPTERS.indexOf(chapter) : -1
  const nextChapter = chapterIndex >= 0 && chapterIndex < CHAPTERS.length - 1 ? CHAPTERS[chapterIndex + 1] : null

  const searchParams = new URLSearchParams(location.search)
  const sectionParam = searchParams.get('section')

  let currentSectionIndex = 0
  if (sectionParam !== null) {
    currentSectionIndex = parseInt(sectionParam, 10) || 0
  } else if (chapter && articleId) {
    const found = chapter.sections.findIndex(s => s.items.some(i => i.id === articleId))
    currentSectionIndex = found >= 0 ? found : 0
  }

  const currentSection = chapter ? chapter.sections[currentSectionIndex] || chapter.sections[0] : null
  const nextSection = chapter ? (chapter.sections[currentSectionIndex + 1] || null) : null

  const prevSectionIndexRef = useRef(null)
  const prevChapterIdRef = useRef(null)

  useEffect(() => {
    if (mobileNavOpen) {
      setExpandedSections(new Set([currentSectionIndex]))
    }
  }, [mobileNavOpen, currentSectionIndex])

  useEffect(() => {
    if (!mobileNavOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileNavOpen])

  useLayoutEffect(() => {
    const isFirstMount = prevChapterIdRef.current === null
    const chapterChanged = !isFirstMount && prevChapterIdRef.current !== chapterId
    const sectionChanged = !isFirstMount && prevSectionIndexRef.current !== currentSectionIndex

    prevChapterIdRef.current = chapterId
    prevSectionIndexRef.current = currentSectionIndex

    if (chapterChanged) {
      window.scrollTo(0, 0)
      setPastHero(false)
      if (contentRef.current) contentRef.current.scrollTop = 0
      return
    }

    if (sectionChanged) {
      setAtArticleEnd(false)
      const targetId = articleId || 'subchapter-heading'
      const el = document.getElementById(targetId)
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' })
      return
    }

    if ((isFirstMount && (sectionParam !== null || articleId)) || articleId) {
      setTimeout(() => {
        const targetId = articleId || 'subchapter-heading'
        const el = document.getElementById(targetId)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [articleId, chapterId, sectionParam, currentSectionIndex])

  useEffect(() => {
    function onWindowScroll() {
      const heroEl = document.getElementById('handbook-hero')
      const heroBottom = heroEl ? heroEl.getBoundingClientRect().bottom : window.innerHeight
      setPastHero(heroBottom <= getHeaderOffsetPx() + 1)

      const distFromBottom =
        document.documentElement.scrollHeight -
        (window.scrollY + window.innerHeight)
      setAtPageBottom(distFromBottom < 80)
    }
    window.addEventListener('scroll', onWindowScroll)
    window.addEventListener('resize', onWindowScroll)
    onWindowScroll()
    return () => {
      window.removeEventListener('scroll', onWindowScroll)
      window.removeEventListener('resize', onWindowScroll)
    }
  }, [chapterId])

  useEffect(() => {
    if (!pastHero && contentRef.current) {
      contentRef.current.scrollTop = 0
    }
  }, [pastHero])

  useEffect(() => {
    if (!currentSection) return
    const items = currentSection.items
    const container = contentRef.current

    function findActive() {
      const containerScrolls = container && container.scrollHeight > container.clientHeight
      let nearBottom
      if (containerScrolls) {
        nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
      } else {
        nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100
      }
      setAtArticleEnd(nearBottom)

      let current = ''
      for (const item of items) {
        const el = document.getElementById(item.id)
        if (el && el.getBoundingClientRect().top < 300) {
          current = item.id
        }
      }
      if (nearBottom && items.length > 0) {
        current = items[items.length - 1].id
      }
      setActiveId(current)
    }

    if (container) container.addEventListener('scroll', findActive)
    window.addEventListener('scroll', findActive)
    findActive()
    return () => {
      if (container) container.removeEventListener('scroll', findActive)
      window.removeEventListener('scroll', findActive)
    }
  }, [currentSection])

  if (!chapter || !currentSection) {
    return <div style={{ paddingTop: HEADER_OFFSET }} className="p-12">Chapter not found.</div>
  }

  function scrollToArticle(e, id) {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    const container = contentRef.current
    if (container && container.scrollHeight > container.clientHeight) {
      const offsetTop = el.offsetTop - container.offsetTop
      container.scrollTo({ top: offsetTop - 24, behavior: 'smooth' })
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function scrollToContent() {
    const contentEl = document.getElementById('handbook-content')
    if (contentEl) contentEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const nextTarget = nextSection
    ? { label: nextSection.group, to: `/handbook/${chapter.id}?section=${currentSectionIndex + 1}` }
    : nextChapter
      ? { label: `${nextChapter.number} ${nextChapter.title}`, to: `/handbook/${nextChapter.id}` }
      : null

  return (
    <div style={{ paddingTop: HEADER_OFFSET }}>
      <section
        id="handbook-hero"
        className="relative lg:h-[var(--hero-h)] lg:flex lg:flex-col lg:overflow-hidden"
        style={{ '--hero-h': HEADER_OFFSET_CSS }}
      >
        <div className="lg:hidden">
          <div className="px-[clamp(17px,5vw,64px)] pt-[clamp(20px,4vh,40px)] pb-[clamp(24px,4vh,40px)]">
            <div className="flex items-center gap-2 text-[14px] mb-6 flex-wrap">
              <Link to="/handbook" className="text-[#6324F3] hover:text-made-neutral-100 transition-colors">Handbook</Link>
              <span className="text-made-neutral-30">&gt;</span>
              <span className="text-made-neutral-60">{chapter.title}</span>
            </div>

            <h1 className="font-head text-[clamp(40px,8vw,64px)] font-medium tracking-[-0.03em] leading-[1.02] mb-4 text-made-neutral-100">
              {chapter.title}.
            </h1>

            <p className="text-[clamp(16px,2.4vw,20px)] text-[#6F8484] leading-relaxed">
              {chapter.subtitle}
            </p>
          </div>
          <div className="relative overflow-hidden w-full aspect-[4/5] sm:aspect-[16/10]">
            <img src={chapter.image} alt={chapter.title} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 right-4 font-body text-[clamp(80px,18vw,180px)] font-medium text-white leading-none tracking-[-0.04em]">
              {chapter.number}
            </div>
          </div>
        </div>

        <div className="hidden lg:flex lg:flex-col lg:flex-1 lg:min-h-0">
          <div className="flex-1 grid grid-cols-[1fr_1fr] gap-0 items-start pt-10 min-h-0">
            <div className="flex flex-col px-[clamp(17px,5vw,64px)]">
              <div className="flex items-center gap-2 text-[14px] mb-8">
                <Link to="/handbook" className="text-[#6324F3] hover:text-made-neutral-100 transition-colors">Handbook</Link>
                <span className="text-made-neutral-30">&gt;</span>
                <span className="text-made-neutral-60">{chapter.title}</span>
              </div>

              <h1 className="font-head text-[clamp(52px,6vw,88px)] font-medium tracking-[-0.03em] leading-[1.02] mb-6">
                {chapter.title}.
              </h1>

              <p className="text-[22px] text-[#6F8484] leading-relaxed max-w-[560px]">
                {chapter.subtitle}
              </p>
            </div>

            <div className="relative overflow-hidden h-full">
              <img src={chapter.image} alt={chapter.title} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 right-8 font-body text-[clamp(140px,18vw,260px)] font-medium text-white leading-none tracking-[-0.04em] opacity-100">
                {chapter.number}
              </div>
            </div>
          </div>

          <button
            onClick={scrollToContent}
            aria-label="Scroll down"
            className="absolute bottom-10 hover:opacity-60 transition-opacity cursor-pointer text-[#6F8484]"
            style={{ left: 'calc(50% - 80px)' }}
          >
            <MadeArrow className="w-[36px] h-auto rotate-90" />
          </button>
        </div>
      </section>

      <div
        id="handbook-content"
        className="lg:grid lg:grid-cols-[clamp(260px,calc(5vw+200px),340px)_1fr] lg:items-start lg:h-[var(--content-h)] lg:sticky lg:bg-white"
        style={{ '--content-h': HEADER_OFFSET_CSS, top: HEADER_OFFSET }}
      >
        <nav className="hidden lg:block handbook-sidebar h-[var(--content-h)] overflow-y-auto py-8 pl-[clamp(17px,5vw,64px)] pr-4 border-r border-[#E1E7E7]"
             style={{ '--content-h': HEADER_OFFSET_CSS }}>
          <div className="text-[14px] font-normal text-made-neutral-100 mb-8">
            {chapter.number} {chapter.title}
          </div>
          {chapter.sections.map((section, sIdx) => {
            const isCurrent = sIdx === currentSectionIndex
            return (
              <div key={section.group} className="mb-5">
                <Link
                  to={`/handbook/${chapter.id}?section=${sIdx}`}
                  className={`block text-[14px] mb-2 leading-snug transition-colors ${
                    isCurrent ? 'text-made-neutral-100 font-bold' : 'text-made-neutral-100 font-normal hover:text-[#6324F3]'
                  }`}
                >
                  {section.group}
                </Link>
                {section.items.map(item => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={e => {
                      if (isCurrent) {
                        scrollToArticle(e, item.id)
                      } else {
                        e.preventDefault()
                        navigate(`/handbook/${chapter.id}/${item.id}`)
                      }
                    }}
                    className={`sidebar-link ${isCurrent && activeId === item.id ? 'active' : ''}`}
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            )
          })}
        </nav>

        <div
          ref={contentRef}
          className={`lg:h-[var(--content-h)] ${pastHero ? 'lg:overflow-y-auto' : 'lg:overflow-hidden'} lg:[scrollbar-gutter:stable] lg:py-10 lg:pb-40 relative lg:flex lg:justify-center bg-white`}
          style={{ '--content-h': HEADER_OFFSET_CSS }}
        >
          <div className="max-w-[860px] w-full mx-auto px-[clamp(17px,5vw,64px)] lg:px-8 pt-8 pb-32 lg:pt-0 lg:pb-0">
            <h2 id="subchapter-heading" className="font-head text-[clamp(32px,5vw,48px)] font-medium tracking-[-0.02em] mb-4 scroll-mt-[120px] text-[#0F1010]">
              {currentSection.group}
            </h2>

            <p className="text-[clamp(16px,1.6vw,18px)] leading-[1.6] text-[#6F8484] mb-8 max-w-[600px]">
              {chapter.subtitle}
            </p>

            <div className="w-12 h-[2px] bg-[#EDEDED] mb-12" />

            {currentSection.items.map((item, idx) => {
              const sections = getArticleContent(item.id)
              return (
                <div key={item.id} id={item.id} className="mb-20 scroll-mt-[120px]">
                  <h3 className="font-head text-[clamp(26px,3.2vw,32px)] font-medium tracking-[-0.015em] mb-6 text-[#0F1010]">
                    {item.title}
                  </h3>

                  {(() => {
                    let h3Count = 0
                    let h4Count = 0
                    return sections.map((section, sIdx) => {
                      if (section.type === 'h2') {
                        h3Count = 0
                        return (
                          <h4 key={sIdx} className="font-head text-[clamp(20px,2.4vw,24px)] font-medium mt-10 mb-3 text-[#0F1010]">
                            {section.text}
                          </h4>
                        )
                      }
                      if (section.type === 'h3') {
                        h3Count++
                        h4Count = 0
                        return (
                          <h5 key={sIdx} className="font-head text-[clamp(18px,2vw,20px)] font-medium mt-8 mb-2 text-[#0F1010]">
                            {h3Count}. {section.text}
                          </h5>
                        )
                      }
                      if (section.type === 'h4') {
                        h4Count++
                        return (
                          <h6 key={sIdx} className="font-body text-[16px] font-medium mt-6 mb-2 text-[#243F3F]">
                            {h3Count}.{h4Count} {section.text}
                          </h6>
                        )
                      }
                      return (
                        <p key={sIdx} className="text-[clamp(16px,1vw,19px)] leading-[1.7] text-[#6F8484] mb-4">
                          {section.text}
                        </p>
                      )
                    })
                  })()}

                  <a
                    href="#"
                    className="text-[#6324F3] text-sm font-medium hover:underline mt-6 inline-block"
                    onClick={e => e.preventDefault()}
                  >
                    View on Confluence &rarr;
                  </a>

                  {idx < currentSection.items.length - 1 && (
                    <div className="mt-16 border-t border-[#EDEDED]" />
                  )}
                </div>
              )
            })}

            <div className="h-24" />
          </div>

          {pastHero && atArticleEnd && nextTarget && (
            <div className="hidden lg:flex fixed bottom-[clamp(8px,2.5vw,32px)] right-[clamp(17px,5vw,64px)] z-40 transition-opacity duration-300">
              <NavButton to={nextTarget.to}>
                <span className="hidden sm:inline">{nextTarget.label}</span>
                <span aria-hidden>&rarr;</span>
              </NavButton>
            </div>
          )}
        </div>
      </div>

      <MobileBottomNav
        chapter={chapter}
        currentSection={currentSection}
        currentSectionIndex={currentSectionIndex}
        currentItemId={activeId || articleId}
        open={mobileNavOpen}
        setOpen={setMobileNavOpen}
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        navigate={navigate}
        activeId={activeId}
        visible={pastHero}
        atBottom={atPageBottom}
        nextTarget={nextTarget}
      />
    </div>
  )
}

function NavButton({ to, children, ariaLabel, className = '' }) {
  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      className={`group relative inline-flex items-center justify-center gap-3 px-6 py-3.5 text-[15px] font-medium border border-made-neutral-100 bg-white text-made-neutral-100 overflow-hidden transition-colors duration-300 ${className}`}
    >
      <span
        aria-hidden
        className="absolute inset-0 bg-made-purple-75 -translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
      />
      <span className="relative z-10 inline-flex items-center gap-3 transition-colors duration-300 group-hover:text-white">
        {children}
      </span>
    </Link>
  )
}

function ChevronDown({ className = '' }) {
  return (
    <svg
      viewBox="0 0 16 10"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="2 3 8 8 14 3" />
    </svg>
  )
}

function CloseIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden
    >
      <line x1="3.5" y1="3.5" x2="12.5" y2="12.5" />
      <line x1="12.5" y1="3.5" x2="3.5" y2="12.5" />
    </svg>
  )
}

const EASE = [0.22, 0.65, 0.4, 0.95]

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

function MobileBottomNav({
  chapter,
  currentSection,
  currentSectionIndex,
  currentItemId,
  open,
  setOpen,
  expandedSections,
  setExpandedSections,
  navigate,
  activeId,
  visible,
  atBottom,
  nextTarget,
}) {
  const itemIndex = currentSection.items.findIndex(i => i.id === currentItemId)
  const position = itemIndex >= 0 ? itemIndex + 1 : 1
  const total = currentSection.items.length

  function toggleSection(idx) {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const showAsNext = atBottom && nextTarget && !open

  function handlePillClick() {
    if (open) {
      setOpen(false)
    } else if (showAsNext) {
      navigate(nextTarget.to)
    } else {
      setOpen(true)
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="bottomnav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="lg:hidden fixed inset-0 z-40 bg-[rgba(15,16,16,0.45)] backdrop-blur-[3px]"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {visible && (
          <motion.div
            key="bottomnav-morph"
            initial={{ y: 96, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            role={open ? 'dialog' : undefined}
            aria-modal={open ? 'true' : undefined}
            aria-label={open ? `${chapter.title} sections` : undefined}
            className="lg:hidden fixed bottom-4 left-4 right-4 z-50 overflow-hidden"
            style={{
              backgroundColor: open ? '#FFFFFF' : '#0F1010',
              boxShadow: open
                ? '0 24px 48px -16px rgba(15,16,16,0.35), 0 8px 16px -8px rgba(15,16,16,0.18)'
                : '0 8px 24px rgba(15,16,16,0.18)',
              transition:
                'background-color 380ms cubic-bezier(0.22,0.65,0.4,0.95), box-shadow 380ms cubic-bezier(0.22,0.65,0.4,0.95)',
            }}
          >
            <div
              className={`grid transition-[grid-template-rows] duration-[420ms] ease-out ${
                open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div
                className={`overflow-hidden transition-opacity duration-200 ${
                  open ? 'opacity-100 delay-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <div className="max-h-[calc(100vh-140px)] overflow-y-auto">
                  <div className="sticky top-0 z-10 bg-white px-5 pt-6 pb-5 border-b border-[#E1E7E7] flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-body text-[11px] tabular-nums text-made-neutral-30 tracking-[0.12em] mb-1.5">
                        {chapter.number}
                      </div>
                      <div className="font-head text-[clamp(22px,6.5vw,28px)] font-medium tracking-[-0.02em] leading-[1.05] text-made-neutral-100">
                        {chapter.title}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label="Close menu"
                      className="shrink-0 w-9 h-9 -mr-1 flex items-center justify-center text-made-neutral-60 hover:text-made-neutral-100 transition-colors"
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="px-5">
                    {chapter.sections.map((section, sIdx) => {
                      const isExpanded = expandedSections.has(sIdx)
                      const isCurrentSection = sIdx === currentSectionIndex
                      return (
                        <div
                          key={section.group}
                          className="border-b border-[#EDEDED] last:border-b-0"
                        >
                          <div className="flex items-stretch">
                            <button
                              type="button"
                              onClick={() => {
                                setOpen(false)
                                navigate(`/handbook/${chapter.id}?section=${sIdx}`)
                              }}
                              className="flex-1 flex items-center text-left py-4 pr-3 min-w-0 hover:text-made-purple-75 transition-colors"
                            >
                              <span className="font-head text-[clamp(15px,4vw,17px)] font-medium tracking-[-0.005em] leading-[1.15] truncate text-made-neutral-100 min-w-0">
                                {section.group}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleSection(sIdx)}
                              aria-expanded={isExpanded}
                              aria-label={
                                isExpanded
                                  ? `Collapse ${section.group}`
                                  : `Expand ${section.group}`
                              }
                              className="flex items-center gap-3 py-4 pl-3 -mr-1 shrink-0"
                            >
                              <span className="font-body text-[12px] text-made-neutral-60 tabular-nums">
                                {section.items.length}
                              </span>
                              <ChevronDown
                                className={`w-[14px] h-auto text-made-neutral-100 transition-transform duration-300 ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                          </div>

                          <div
                            className={`grid transition-[grid-template-rows] duration-[350ms] ease-out ${
                              isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                            }`}
                          >
                            <div className="overflow-hidden">
                              <ul className="pb-4 -mt-1">
                                {section.items.map(item => {
                                  const isActiveItem =
                                    isCurrentSection && activeId === item.id
                                  return (
                                    <li key={item.id}>
                                      <a
                                        href={`/handbook/${chapter.id}/${item.id}`}
                                        onClick={e => {
                                          e.preventDefault()
                                          setOpen(false)
                                          if (isCurrentSection) {
                                            const el = document.getElementById(item.id)
                                            if (el)
                                              el.scrollIntoView({
                                                behavior: 'smooth',
                                                block: 'start',
                                              })
                                          } else {
                                            navigate(`/handbook/${chapter.id}/${item.id}`)
                                          }
                                        }}
                                        className={`block font-body text-[14px] py-2.5 transition-colors ${
                                          isActiveItem
                                            ? 'text-made-purple-75 font-medium'
                                            : 'text-made-neutral-100 hover:text-made-purple-75'
                                        }`}
                                      >
                                        {item.title}
                                      </a>
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="h-4" />
                </div>
              </div>
            </div>

            <div
              className={`grid transition-[grid-template-rows] duration-[420ms] ease-out ${
                open ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
              }`}
            >
              <div
                className={`overflow-hidden transition-opacity duration-200 ${
                  open ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-100'
                }`}
              >
                <button
                  type="button"
                  onClick={handlePillClick}
                  aria-haspopup={showAsNext ? undefined : 'dialog'}
                  aria-expanded={showAsNext ? undefined : open}
                  className="group w-full flex items-center justify-between gap-4 text-white px-5 py-4 active:scale-[0.985] transition-transform"
                >
                  {showAsNext ? (
                    <>
                      <span className="flex items-center gap-3 min-w-0">
                        <span className="text-[11px] uppercase tracking-[0.12em] text-white/55 shrink-0">
                          Next
                        </span>
                        <span className="text-[15px] font-medium truncate">
                          {nextTarget.label}
                        </span>
                      </span>
                      <MadeArrow className="w-[18px] h-auto text-white shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </>
                  ) : (
                    <>
                      <span className="text-[15px] font-medium truncate">{currentSection.group}</span>
                      <span className="text-[13px] tabular-nums opacity-80 shrink-0">
                        {position}/{total}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
