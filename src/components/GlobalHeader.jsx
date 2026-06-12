import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const HERO_BG = 'rgb(243, 245, 245)'
const HEADER_HEIGHT_CLASS = 'h-[clamp(72px,5.5vh,108px)]'

function CrossIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 17 17"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M10.2 0H6.8V6.8H10.2V0Z" />
      <path d="M17 6.8H10.2V10.2H17V6.8Z" />
      <path d="M10.2 10.2H6.8V17H10.2V10.2Z" />
      <path d="M3.4 6.8H0V10.2H3.4V6.8Z" />
    </svg>
  )
}

export default function GlobalHeader() {
  const [logoHover, setLogoHover] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [instantClose, setInstantClose] = useState(false)
  const [bg, setBg] = useState('#FFFFFF')
  const headerRef = useRef(null)

  useEffect(() => {
    function update() {
      const headerH = headerRef.current?.offsetHeight ?? 72
      const el = document.elementFromPoint(
        window.innerWidth / 2,
        headerH + 4
      )
      if (!el) return
      let cur = el
      while (cur && cur.tagName !== 'SECTION' && cur.tagName !== 'FOOTER') {
        cur = cur.parentElement
      }
      if (!cur) return
      const bgColor = getComputedStyle(cur).backgroundColor
      setBg(bgColor === HERO_BG ? '#F3F5F5' : '#FFFFFF')
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [menuOpen])

  return (
    <>
      <motion.header
        ref={headerRef}
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 0.65, 0.4, 0.95] }}
        className={`fixed top-0 left-0 right-0 z-[60] ${HEADER_HEIGHT_CLASS}`}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundColor: bg }}
        />

        <div className="relative h-full mx-auto max-w-[2560px] px-[clamp(17px,5vw,64px)] flex items-center">
          <NavLink
            to="/"
            aria-label="Made — home"
            className="group flex items-center gap-3 select-none"
            onMouseEnter={() => setLogoHover(true)}
            onMouseLeave={() => setLogoHover(false)}
            onClick={() => {
              if (menuOpen) {
                setInstantClose(true)
                setMenuOpen(false)
              }
            }}
          >
            <img
              src="/assets/logo_made.svg"
              alt="Made"
              className="h-[clamp(18px,1.55vw,22px)] w-auto"
            />
            <motion.span
              className="inline-flex text-[#6F8484]"
              animate={{ rotate: logoHover ? 90 : 0 }}
              transition={{ duration: 0.4, ease: [0.22, 0.65, 0.4, 0.95] }}
            >
              <CrossIcon className="h-[clamp(13px,1vw,14px)] w-[clamp(13px,1vw,14px)]" />
            </motion.span>
            <span className="font-body font-medium text-[clamp(13px,1vw,14px)] text-[#6F8484] leading-none hidden sm:inline">
              Internal platform
            </span>
          </NavLink>

          <div className="flex-1" />

          <nav className="hidden md:flex items-center gap-[clamp(28px,3.75vw,54px)]">
            <HeaderLink to="/onboarding">Onboarding</HeaderLink>
            <HeaderLink to="/handbook" tourTarget="handbook-nav">Handbook</HeaderLink>
            <HeaderLink to="/tools">Tools</HeaderLink>
          </nav>

          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => {
              setInstantClose(false)
              setMenuOpen(prev => !prev)
            }}
            className="md:hidden relative w-9 h-9 flex flex-col items-center justify-center gap-[5px] text-made-neutral-100"
          >
            <motion.span
              className="block w-5 h-[1.6px] bg-current rounded-full origin-center"
              animate={menuOpen ? { rotate: 45, y: 6.6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 0.65, 0.4, 0.95] }}
            />
            <motion.span
              className="block w-5 h-[1.6px] bg-current rounded-full"
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.15 }}
            />
            <motion.span
              className="block w-5 h-[1.6px] bg-current rounded-full origin-center"
              animate={menuOpen ? { rotate: -45, y: -6.6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 0.65, 0.4, 0.95] }}
            />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: instantClose ? 0 : 0.25,
              ease: [0.22, 0.65, 0.4, 0.95],
            }}
            onAnimationComplete={() => {
              if (!menuOpen) setInstantClose(false)
            }}
            className="fixed inset-0 z-[55] md:hidden bg-white pt-[clamp(72px,5.5vh,108px)]"
          >
            <motion.nav
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{
                duration: instantClose ? 0 : 0.3,
                delay: instantClose ? 0 : 0.05,
                ease: [0.22, 0.65, 0.4, 0.95],
              }}
              className="flex flex-col px-[clamp(17px,5vw,64px)] py-10 gap-2"
            >
              <MobileLink
                to="/onboarding"
                onClick={() => {
                  setInstantClose(true)
                  setMenuOpen(false)
                }}
              >
                Onboarding
              </MobileLink>
              <MobileLink
                to="/handbook"
                onClick={() => {
                  setInstantClose(true)
                  setMenuOpen(false)
                }}
              >
                Handbook
              </MobileLink>
              <MobileLink
                to="/tools"
                onClick={() => {
                  setInstantClose(true)
                  setMenuOpen(false)
                }}
              >
                Tools
              </MobileLink>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function HeaderLink({ to, children, tourTarget }) {
  const { pathname } = useLocation()
  const [hovered, setHovered] = useState(false)
  useEffect(() => {
    setHovered(false)
  }, [pathname])
  return (
    <NavLink
      to={to}
      end={false}
      data-tour={tourTarget}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={({ isActive }) =>
        `group relative inline-flex items-center justify-center h-[38px] text-[clamp(14px,1.11vw,18px)] font-body whitespace-nowrap text-made-neutral-100 ${
          isActive ? 'font-medium' : 'font-normal'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {children}
          <span
            aria-hidden
            className={`absolute left-0 right-0 bottom-0 h-[2px] origin-left transition-transform duration-300 bg-made-purple-75 ${
              isActive || hovered ? 'scale-x-100' : 'scale-x-0'
            }`}
          />
        </>
      )}
    </NavLink>
  )
}

function MobileLink({ to, onClick, children }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `font-body tracking-[-0.02em] text-[clamp(36px,11vw,56px)] py-3 border-b border-[#E1E7E7] last:border-b-0 text-made-neutral-100 ${
          isActive ? 'font-medium' : 'font-normal'
        }`
      }
    >
      {children}
    </NavLink>
  )
}
