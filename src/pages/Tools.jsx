import { useState, useMemo, useRef, useEffect } from 'react'
import { TOOLS, TOOL_CATEGORIES } from '../data/tools'
import SearchInput from '../components/SearchInput'

const LINE_COLOR = '#EDEDED'
const BLEED_V_TOP = 20
const BLEED_V_BOTTOM = 50

function FilterIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <line x1="2" y1="4" x2="14" y2="4" />
      <line x1="4" y1="8" x2="14" y2="8" />
      <line x1="6" y1="12" x2="14" y2="12" />
    </svg>
  )
}

function FilterCloseIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <line x1="3.5" y1="3.5" x2="12.5" y2="12.5" />
      <line x1="12.5" y1="3.5" x2="3.5" y2="12.5" />
    </svg>
  )
}

function FilterMenu({ categories, active, onChange }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const pillBase =
    'px-3 sm:px-5 py-1 sm:py-1.5 text-sm sm:text-base min-[2269px]:text-base min-[2269px]:px-6 font-medium rounded-full border cursor-pointer select-none transition-all duration-200 whitespace-nowrap'
  const pillFor = cat =>
    `${pillBase} ${
      active === cat
        ? 'bg-[#6324F3] border-[#6324F3] text-white'
        : 'bg-white border-[#EDEDED] text-[#6F8484] hover:border-[#6F8484] hover:text-made-neutral-100'
    }`

  return (
    <>
      <div className="hidden min-[480px]:flex flex-nowrap items-center gap-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => onChange(cat)} className={pillFor(cat)}>
            {cat}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={active === 'All' ? 'Filter tools' : `Filter (currently ${active})`}
        className="min-[480px]:hidden self-start flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full border bg-white border-[#EDEDED] text-made-neutral-100 hover:border-[#6F8484] transition-colors"
      >
        <FilterIcon className="w-4 h-4" />
        <span>{active}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter tools"
          className="fixed inset-0 z-[100] bg-white flex flex-col min-[480px]:hidden"
        >
          <div className="px-[clamp(17px,5vw,64px)] pt-[clamp(20px,5vh,40px)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-head text-[clamp(28px,6vw,40px)] font-medium tracking-[-0.03em] text-made-neutral-100">
                Filter
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filter"
                className="w-10 h-10 -mr-1 flex items-center justify-center text-made-neutral-100 hover:text-[#6324F3] transition-colors"
              >
                <FilterCloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-start pt-2 pb-4">
              <button
                type="button"
                onClick={() => {
                  onChange('All')
                  setOpen(false)
                }}
                className="text-sm font-medium text-[#6F8484] underline underline-offset-4 hover:text-made-neutral-100 transition-colors"
              >
                Reset filter
              </button>
            </div>
          </div>
          <ul className="flex-1 flex flex-col justify-end px-[clamp(17px,5vw,64px)] pb-[clamp(20px,4vh,40px)]">
            <li className="border-t border-[#EDEDED]" />
            {categories.map(cat => {
              const isActive = active === cat
              return (
                <li key={cat} className="border-b border-[#EDEDED]">
                  <button
                    type="button"
                    onClick={() => {
                      onChange(cat)
                      setOpen(false)
                    }}
                    aria-pressed={isActive}
                    className={`w-full flex items-center text-left font-head font-medium tracking-[-0.02em] text-[clamp(22px,6vw,44px)] leading-none py-7 transition-colors ${
                      isActive
                        ? 'text-[#6324F3]'
                        : 'text-made-neutral-100 hover:text-[#6324F3]'
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </>
  )
}

export default function Tools() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const gridRef = useRef(null)
  const [gridInfo, setGridInfo] = useState({ cols: 4, cellW: 0, cellH: 0 })

  const filteredTools = useMemo(() => {
    const filtered = TOOLS.filter(t => {
      const matchesFilter = activeFilter === 'All' || (t.tags && t.tags.includes(activeFilter))
      const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase())
      return matchesFilter && matchesSearch
    })
    if (activeFilter === 'All') {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    }
    return filtered
  }, [search, activeFilter])

  useEffect(() => {
    function measure() {
      if (!gridRef.current) return
      const el = gridRef.current
      const style = getComputedStyle(el)
      const colWidths = style.gridTemplateColumns.split(' ')
      const cols = colWidths.length
      const cellW = parseFloat(colWidths[0]) || 0
      const firstCard = el.firstElementChild
      const measuredH = firstCard ? firstCard.getBoundingClientRect().height : 0
      const cellH = measuredH || cellW / (322 / 336)
      setGridInfo({ cols, cellW, cellH })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [filteredTools.length])

  const { cols, cellW, cellH } = gridInfo
  const actualRows = cols > 0 ? Math.ceil(filteredTools.length / cols) : 0
  const hLineCount = actualRows + 1

  const innerVLines = []
  for (let i = 1; i < cols; i++) {
    innerVLines.push(i)
  }

  const gridTotalWidth = cols * cellW

  return (
    <div className="pt-[clamp(72px,5.5vh,108px)] [--page-px:clamp(17px,5vw,64px)]">
      <div className="min-h-[calc(100vh-clamp(72px,5.5vh,108px))]">
        <div className="px-[var(--page-px)] pt-[clamp(40px,6vh,80px)]">
          <div>
            <h1 className="font-head text-[clamp(40px,5vw,72px)] font-medium tracking-[-0.03em] leading-none mb-4">
              Tools
            </h1>
            <p className="text-[clamp(14px,1.6vw,16px)] leading-relaxed max-w-[460px]" style={{ color: '#6F8484' }}>
              All platforms and AI tools we use. Find what you need or request something new.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8 mt-[clamp(28px,5vh,48px)] mb-[clamp(32px,7vh,56px)]">
            <FilterMenu
              categories={TOOL_CATEGORIES}
              active={activeFilter}
              onChange={setActiveFilter}
            />
            <SearchInput
              placeholder="Search in tools"
              value={search}
              onChange={setSearch}
              className="w-full min-[480px]:w-[clamp(260px,24vw,320px)] lg:shrink-0"
              variant="medium"
            />
          </div>
        </div>

        <div className="px-[var(--page-px)] pb-[clamp(40px,8vh,80px)]">
          <div className="relative overflow-visible">
            {cellW > 0 && cols > 1 && (
              <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                {Array.from({ length: hLineCount }).map((_, i) => (
                  <div
                    key={`h-${i}`}
                    className="absolute"
                    style={{
                      top: i * cellH,
                      left: 0,
                      width: gridTotalWidth,
                      height: 1,
                      background: LINE_COLOR,
                    }}
                  />
                ))}
                {innerVLines.map(i => (
                  <div
                    key={`v-${i}`}
                    className="absolute"
                    style={{
                      left: `calc(${(i / cols) * 100}%)`,
                      top: -BLEED_V_TOP,
                      bottom: -BLEED_V_BOTTOM,
                      width: 1,
                      background: LINE_COLOR,
                    }}
                  />
                ))}
              </div>
            )}

            <div
              ref={gridRef}
              className="relative z-10 grid grid-cols-1 sm:grid-cols-2 min-[861px]:grid-cols-3 min-[1255px]:grid-cols-4 2xl:grid-cols-5 border-b sm:border-b-0 border-[#EDEDED]"
            >
              {filteredTools.map(tool => (
                <div
                  key={tool.name}
                  className="tool-card border-t sm:border-t-0 border-[#EDEDED] flex flex-col cursor-default overflow-hidden group sm:aspect-[322/336]"
                >
                  <div
                    className="flex flex-col h-full gap-8 sm:gap-0 min-[2269px]:!p-10"
                    style={{ padding: 'clamp(28px,3.5vw,36px) clamp(20px,2.8vw,28px) clamp(28px,3vw,32px)' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="h-7 sm:h-8 min-[2269px]:h-10 flex items-center min-w-0 flex-1">
                        {tool.url ? (
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open ${tool.name}`}
                            className="inline-flex items-center"
                          >
                            {tool.logo ? (
                              <img
                                src={tool.logo}
                                alt={tool.name}
                                className="h-6 sm:h-7 min-[2269px]:h-9 max-w-[110px] sm:max-w-[120px] min-[2269px]:max-w-[160px] object-contain object-left"
                              />
                            ) : (
                              <span className="text-base min-[2269px]:text-lg font-medium text-made-neutral-100 truncate">{tool.name}</span>
                            )}
                          </a>
                        ) : tool.logo ? (
                          <img
                            src={tool.logo}
                            alt={tool.name}
                            className="h-6 sm:h-7 min-[2269px]:h-9 max-w-[110px] sm:max-w-[120px] min-[2269px]:max-w-[160px] object-contain object-left"
                          />
                        ) : (
                          <span className="text-base min-[2269px]:text-lg font-medium text-made-neutral-100 truncate">{tool.name}</span>
                        )}
                      </div>
                      <span
                        className="text-sm min-[2269px]:text-base px-3 min-[2269px]:px-4 py-1 min-[2269px]:py-1.5 border border-[#EDEDED] rounded-full whitespace-nowrap shrink-0"
                        style={{ color: '#6F8484' }}
                      >
                        {tool.tag}
                      </span>
                    </div>

                    <div className="tool-hover-content flex-1 flex flex-col justify-end mt-4 sm:mt-4">
                      <h3 className="font-body text-base min-[2269px]:text-lg font-medium text-made-neutral-100 mb-3.5 min-[2269px]:mb-4">
                        {tool.name}
                      </h3>
                      <span
                        className="inline-block text-[13px] min-[2269px]:text-sm px-2.5 min-[2269px]:px-3 py-0.5 min-[2269px]:py-1 border border-[#EDEDED] rounded-full mb-3 min-[2269px]:mb-4 self-start"
                        style={{ color: '#6F8484' }}
                      >
                        {tool.accountType}
                      </span>
                      <p className="text-sm min-[2269px]:text-base leading-relaxed" style={{ color: '#6F8484' }}>
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {filteredTools.length === 0 && (
                <div className="col-span-full text-center py-20 text-base" style={{ color: '#6F8484' }}>
                  No tools found matching your search.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
