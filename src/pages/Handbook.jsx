import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CHAPTERS } from '../data/chapters'
import { ARTICLE_CONTENT } from '../data/handbookContent'
import SearchInput from '../components/SearchInput'

const EASE = 'ease-out'
const DURATION = '0.4s'

const SYNONYM_GROUPS = [
  ['vacation', 'holiday', 'leave', 'pto', 'time off', 'absence', 'days off'],
  ['salary', 'compensation', 'pay', 'wage', 'wages'],
  ['benefits', 'perks'],
  ['training', 'learning', 'education', 'course', 'courses'],
  ['onboarding', 'welcome', 'orientation', 'first day'],
  ['expense', 'expenses', 'reimbursement', 'cost', 'costs'],
  ['car', 'vehicle', 'lease', 'company car'],
  ['remote', 'wfh', 'telework', 'home office', 'work from home'],
  ['team', 'squad', 'group'],
  ['engineering', 'dev', 'development', 'coding', 'programming'],
  ['design', 'ux', 'ui'],
  ['sick', 'sickness', 'illness', 'ill'],
  ['parental', 'maternity', 'paternity'],
  ['meeting', 'meetings', 'sync', 'standup'],
  ['policy', 'policies', 'rules', 'guidelines'],
  ['tool', 'tools', 'software', 'app', 'apps'],
]

const SYNONYM_LOOKUP = (() => {
  const map = new Map()
  for (const group of SYNONYM_GROUPS) {
    for (const word of group) map.set(word.toLowerCase(), group)
  }
  return map
})()

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildQueryRegex(query, flags = 'i') {
  const q = query.trim().toLowerCase()
  if (!q) return null

  const terms = new Set([q])
  for (const [key, group] of SYNONYM_LOOKUP) {
    if (key.startsWith(q)) {
      for (const word of group) terms.add(word.toLowerCase())
    }
  }

  const sorted = [...terms].sort((a, b) => b.length - a.length)
  const pattern = sorted.map(t => escapeRegex(t)).join('|')
  return new RegExp('\\b(?:' + pattern + ')', flags)
}

const SNIPPET_CONTEXT = 40
function makeSnippet(text, query) {
  const match = buildQueryRegex(query).exec(text)
  if (!match) return null
  const idx = match.index
  const start = Math.max(0, idx - SNIPPET_CONTEXT)
  const end = Math.min(text.length, idx + match[0].length + SNIPPET_CONTEXT)
  let snippet = text.slice(start, end)
  if (start > 0) snippet = '…' + snippet.replace(/^\S+\s/, '')
  if (end < text.length) snippet = snippet.replace(/\s\S+$/, '') + '…'
  return snippet
}

function HighlightedText({ text, query }) {
  if (!text || !query) return text
  const re = buildQueryRegex(query, 'gi')
  const parts = []
  let lastIndex = 0
  let m
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) parts.push({ text: text.slice(lastIndex, m.index), match: false })
    parts.push({ text: m[0], match: true })
    lastIndex = m.index + m[0].length
  }
  if (lastIndex < text.length) parts.push({ text: text.slice(lastIndex), match: false })
  return parts.map((p, j) =>
    p.match ? (
      <mark
        key={j}
        className="bg-made-neutral-15 text-made-neutral-100 font-medium rounded-sm px-0.5"
      >
        {p.text}
      </mark>
    ) : (
      <span key={j}>{p.text}</span>
    )
  )
}

export default function Handbook() {
  const [activeCol, setActiveCol] = useState(null)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const hasHover = activeCol !== null

  const searchResults = useMemo(() => {
    if (!search.trim()) return []
    const re = buildQueryRegex(search)
    const results = []
    CHAPTERS.forEach(ch => {
      ch.sections.forEach(s => {
        s.items.forEach(item => {
          const titleMatch = re.test(item.title)
          const content = ARTICLE_CONTENT[item.id]
          const contentField =
            content &&
            [content.intro, content.body, content.extra].find(
              t => t && re.test(t)
            )
          if (titleMatch || contentField) {
            results.push({
              chapter: ch,
              section: s,
              item,
              snippet: contentField ? makeSnippet(contentField, search) : null,
            })
          }
        })
      })
    })
    return results
  }, [search])

  return (
    <div className="pt-[clamp(72px,5.5vh,108px)] overflow-x-hidden">
      <div
        className="[--page-px:clamp(17px,5vw,64px)] px-[var(--page-px)] lg:h-[calc(100vh-clamp(72px,5.5vh,108px))] lg:overflow-hidden flex flex-col pt-[clamp(40px,6vh,80px)] pb-[clamp(40px,5vh,64px)]"
      >
        <div className="shrink-0 flex flex-col items-center text-center gap-[clamp(20px,3vh,40px)] mb-[clamp(40px,5vh,72px)] lg:mb-0">
          <h1 className="font-head font-medium tracking-[-0.03em] leading-tight text-made-neutral-100 text-[clamp(32px,4.2vw,56px)] max-w-[820px]">
            Looking for something?
          </h1>
          <div className="relative w-full max-w-[680px]">
            <SearchInput
              placeholder="Search the handbook"
              value={search}
              onChange={setSearch}
              variant="large"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E1E7E7] rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto text-left">
                {searchResults.map(({ chapter, section, item, snippet }) => (
                  <button
                    key={`${chapter.id}-${item.id}`}
                    className="w-full text-left px-4 py-3 hover:bg-made-neutral-10 transition-colors border-b border-[#E1E7E7] last:border-b-0"
                    onClick={() => {
                      setSearch('')
                      navigate(`/handbook/${chapter.id}/${item.id}`)
                    }}
                  >
                    <div className="text-sm font-medium text-made-neutral-100">
                      <HighlightedText text={item.title} query={search} />
                    </div>
                    <div className="text-xs text-made-neutral-60 mt-0.5">{chapter.title} &middot; {section.group}</div>
                    {snippet && (
                      <div className="text-xs text-made-neutral-60 mt-1 leading-snug">
                        <HighlightedText text={snippet} query={search} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
            {search.trim() && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E1E7E7] rounded-lg shadow-lg z-50 px-4 py-3 text-left">
                <div className="text-sm text-made-neutral-60">No results found.</div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:hidden flex flex-col gap-[clamp(64px,8vh,112px)]">
          {CHAPTERS.map(ch => (
            <article key={ch.id}>
              <div
                className="w-full aspect-[4/5] sm:aspect-[16/10] overflow-hidden cursor-pointer mb-5"
                onClick={() => navigate(`/handbook/${ch.id}`)}
              >
                <img
                  src={ch.image}
                  alt={ch.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <div
                className="cursor-pointer mb-4"
                onClick={() => navigate(`/handbook/${ch.id}`)}
              >
                <div className="font-body font-medium tracking-[-0.03em] leading-none text-[clamp(28px,5vw,40px)] text-made-neutral-100">
                  {ch.number}
                </div>
                <div className="font-body font-medium text-[clamp(20px,2.6vw,26px)] text-made-neutral-100 mt-1">
                  {ch.title}
                </div>
              </div>

              <ul className="flex flex-col gap-2 border-t border-[#E1E7E7] pt-4">
                {ch.sections.map((s, sIdx) => (
                  <li key={s.group}>
                    <a
                      href={`/handbook/${ch.id}?section=${sIdx}`}
                      onClick={e => {
                        e.preventDefault()
                        navigate(`/handbook/${ch.id}?section=${sIdx}`)
                      }}
                      className="flex items-center justify-between text-[15px] text-made-neutral-100 font-normal leading-snug hover:text-[#6324F3] transition-colors py-1"
                    >
                      <span>{s.group}</span>
                      <span aria-hidden className="text-made-neutral-60 ml-4 shrink-0">→</span>
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div
          className="hidden lg:flex shrink-0 items-end mt-auto"
          style={{
            gap: hasHover ? '6px' : '12px',
            transition: `gap ${DURATION} ${EASE}`,
          }}
          onMouseLeave={() => setActiveCol(null)}
        >
          {CHAPTERS.map((ch, i) => {
            const isActive = activeCol === i
            const isInactive = hasHover && !isActive
            const flexVal = isActive ? '1.7 0 0%' : isInactive ? '0.7 0 0%' : '1 0 0%'

            return (
              <div
                key={ch.id}
                className="min-w-0 overflow-hidden cursor-pointer"
                style={{
                  flex: flexVal,
                  transition: `flex ${DURATION} ${EASE}`,
                }}
                onMouseEnter={() => setActiveCol(i)}
                onClick={() => navigate(`/handbook/${ch.id}`)}
              >
                <div className="mb-3">
                  <div
                    className="font-body font-medium tracking-[-0.03em] leading-none mb-1 text-made-neutral-100 text-[clamp(28px,3vw,48px)]"
                    style={{
                      opacity: isInactive ? 0.35 : 1,
                      transition: `opacity ${DURATION} ${EASE}`,
                    }}
                  >
                    {ch.number}
                  </div>
                  <div
                    className="font-body font-medium text-made-neutral-100 truncate text-[clamp(16px,1.4vw,22px)]"
                    style={{
                      opacity: isInactive ? 0.35 : 1,
                      transition: `opacity ${DURATION} ${EASE}`,
                    }}
                  >
                    {ch.title}
                  </div>
                </div>

                <div
                  className="flex gap-0 overflow-hidden"
                  style={{
                    height: 'clamp(260px, calc(86vh - 425px), 1000px)',
                    filter: isInactive ? 'grayscale(1)' : 'none',
                    opacity: isInactive ? 0.35 : 1,
                    transition: `filter ${DURATION} ${EASE}, opacity ${DURATION} ${EASE}`,
                  }}
                >
                  <div
                    className="overflow-hidden h-full shrink-0"
                    style={{
                      width: 'calc((100vw - 2 * var(--page-px) - 48px) / 5)',
                    }}
                  >
                    <img
                      src={ch.image}
                      alt={ch.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div
                    className="flex flex-col justify-end gap-0.5 pb-1 pl-3 pr-0 overflow-hidden whitespace-nowrap"
                    style={{
                      opacity: isActive ? 1 : 0,
                      maxWidth: isActive
                        ? `${Math.max(...ch.sections.map(s => s.group.length)) * 9 + 24}px`
                        : '0px',
                      transition: `opacity 0.25s ${EASE} ${isActive ? '0.15s' : '0s'}, max-width ${DURATION} ${EASE}`,
                    }}
                  >
                    {ch.sections.map((s, sIdx) => (
                      <a
                        key={s.group}
                        href={`/handbook/${ch.id}?section=${sIdx}`}
                        onClick={e => {
                          e.preventDefault()
                          e.stopPropagation()
                          navigate(`/handbook/${ch.id}?section=${sIdx}`)
                        }}
                        className="text-[clamp(14px,1.1vw,17px)] text-made-neutral-100 font-normal leading-snug hover:text-[#6324F3] transition-colors duration-200 whitespace-nowrap"
                      >
                        {s.group}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
