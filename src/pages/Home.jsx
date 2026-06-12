import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'

const JUMP_SECTIONS = [
  {
    id: 'onboarding',
    to: '/onboarding',
    label: 'Onboarding',
    description:
      'New at Made? Get up and running through our onboarding journey, that will guide you step by step from day one.',
  },
  {
    id: 'handbook',
    to: '/handbook',
    label: 'Handbook',
    description:
      'Everything about working at Made: from practical procedures, policies to other essential company info.',
  },
  {
    id: 'tools',
    to: '/tools',
    label: 'Tools',
    description:
      'Explore all available tools to help you work smarter, move faster, and get the most out of everything Made has to offer.',
  },
]

const VALUES = [
  {
    letter: 'Bold',
    tagline: 'We believe in challenging the status quo.',
    body: "We get excited about technologies others haven't figured out yet, then use them to solve problems in ways nobody expected. Our team thrives with a can-do-mentality. We don't just meet the brief, we find the boundaries to push for a better outcome.",
    image: '/assets/bold.png',
  },
  {
    letter: 'Impact',
    tagline: 'What we do matters.',
    body: 'We create work that matters for people and planet. We blend different skills to build solutions that last, not just look good. We turn ideas into experiences that respect both users and resources. Our approach balances what works today with what sustains tomorrow. We make meaningful impact without sacrificing business.',
    image: '/assets/impact.png',
  },
  {
    letter: 'Together',
    tagline: 'We believe in community.',
    body: 'We can only build great things together. We trust each other and celebrate different perspectives. Making room for our strengths and mindsets to shine, and shaping the space for genuine work-life balance. We succeed only because we actually care.',
    image: '/assets/together.png',
  },
  {
    letter: 'Entrepreneurial',
    tagline: 'We lead and act with ownership.',
    body: "We get excited about technologies others haven't figured out yet, then use them to solve problems in ways nobody expected. Our team thrives with a can-do-mentality. We don't just meet the brief, we find the boundaries to push for a better outcome.",
    image: '/assets/entrepreneurial.png',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 48 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 0.65, 0.4, 0.95] },
  },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}

const inView = { once: true, margin: '-80px' }

function Arrow({ className = '' }) {
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

export default function Home() {
  return (
    <div className="pt-[clamp(72px,5.5vh,108px)]">
      <Header />

      <section className="relative -mt-[clamp(40px,5vh,80px)] mx-auto max-w-[2560px] px-[clamp(12px,3vw,72px)]">
        <video
          src="/assets/video.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto block"
        />
      </section>

      <Values />
      <Footer />
    </div>
  )
}

const HERO_LINES = [
  ['Your', 'guide', 'to'],
  ['everything', 'Made.'],
]

function Header() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '-22%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.15])
  const gridY = useTransform(scrollYProgress, [0, 1], ['0%', '12%'])

  const { pathname } = useLocation()
  useEffect(() => {
    if (pathname !== '/') return
    const id = requestAnimationFrame(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    return () => cancelAnimationFrame(id)
  }, [pathname])

  const [hoveredIdx, setHoveredIdx] = useState(null)

  return (
    <section ref={sectionRef} className="bg-white">
      <div className="mx-auto max-w-[2560px] px-[clamp(17px,5.35vw,77px)] min-[1920px]:px-[clamp(120px,9vw,240px)] lg:h-[calc(100vh-clamp(72px,5.5vh,108px))] flex flex-col gap-[clamp(100px,16vh,220px)] pt-[clamp(40px,10vh,180px)] pb-[clamp(40px,7vh,140px)]">
        <motion.h1
          style={{ y: heroY, opacity: heroOpacity }}
          className="font-head font-medium tracking-[-0.01em] leading-[1.15] text-[clamp(48px,7.5vw,180px)] text-made-neutral-100 will-change-transform"
        >
          {HERO_LINES.map((line, lineIdx) => {
            const baseIdx = HERO_LINES
              .slice(0, lineIdx)
              .reduce((n, l) => n + l.length, 0)
            return (
              <span key={lineIdx} className="block overflow-hidden pb-[0.06em]">
                {line.map((word, wordIdx) => (
                  <motion.span
                    key={wordIdx}
                    className="inline-block"
                    style={{
                      marginRight: wordIdx < line.length - 1 ? '0.28em' : 0,
                    }}
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={{
                      duration: 0.95,
                      delay: 0.15 + (baseIdx + wordIdx) * 0.07,
                      ease: [0.22, 0.65, 0.4, 0.95],
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
            )
          })}
        </motion.h1>

        <motion.div
          style={{ y: gridY }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-0 will-change-transform"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {JUMP_SECTIONS.map((s, i) => {
            const dim = hoveredIdx !== null && hoveredIdx !== i
            const active = hoveredIdx === i
            return (
              <motion.div
                key={s.id}
                onMouseEnter={() => setHoveredIdx(i)}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: dim ? 0.3 : 1, y: 0 }}
                transition={{
                  opacity: {
                    duration: 0.5,
                    delay: hoveredIdx === null ? 0.6 + i * 0.1 : 0,
                    ease: [0.22, 0.65, 0.4, 0.95],
                  },
                  y: {
                    duration: 0.85,
                    delay: 0.6 + i * 0.1,
                    ease: [0.22, 0.65, 0.4, 0.95],
                  },
                }}
                className={
                  i > 0
                    ? 'border-t lg:border-t-0 lg:border-l border-[#E1E7E7]'
                    : ''
                }
              >
                <Link
                  to={s.to}
                  className={`group flex flex-col h-full py-[clamp(28px,3vw,40px)] lg:py-0 ${
                    i > 0 ? 'lg:pl-[clamp(32px,4vw,80px)]' : ''
                  } ${
                    i < JUMP_SECTIONS.length - 1 ? 'lg:pr-[clamp(32px,4vw,80px)]' : ''
                  }`}
                >
                  <motion.h3
                    animate={{ x: active ? 8 : 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 0.65, 0.4, 0.95] }}
                    className="font-body font-medium tracking-[-0.005em] text-[clamp(22px,2.22vw,56px)] leading-[1.2] text-made-neutral-100"
                  >
                    {s.label}
                  </motion.h3>
                  <p className="mt-[clamp(20px,2.5vw,48px)] font-body text-[clamp(14px,1.11vw,22px)] leading-[1.4] text-made-neutral-100 max-w-[clamp(260px,24vw,480px)]">
                    {s.description}
                  </p>
                  <div className="mt-auto pt-[clamp(32px,5vh,100px)] flex justify-end text-made-neutral-100">
                    <motion.span
                      aria-hidden
                      className="inline-flex items-center justify-end"
                      animate={{
                        x: active ? 14 : 0,
                        scale: active ? 1.12 : 1,
                      }}
                      transition={{
                        duration: 0.45,
                        ease: [0.22, 0.65, 0.4, 0.95],
                      }}
                    >
                      <Arrow className="w-[clamp(28px,2.5vw,56px)] h-auto" />
                    </motion.span>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

const DOT_SIZE = 3
const DOT_SPACING = DOT_SIZE + 13
const MIN_AREA = 24
const MAX_AREA = 100
const MOVE_THRESHOLD = 30

function DotCanvas({ tone = 'dark' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const parent = canvas.parentElement
    if (!parent) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let dots = []
    let mouseX = -9999
    let mouseY = -9999
    let prevMX = 0
    let prevMY = 0
    let isMoving = false
    let moveTimer = null
    let currentArea = MIN_AREA
    let rafId = null

    const baseColor = tone === 'dark' ? [223, 231, 231] : [120, 138, 138]
    const fadeColor = tone === 'dark' ? [255, 255, 255] : [120, 138, 138]

    function resize() {
      const r = parent.getBoundingClientRect()
      canvas.width = Math.ceil(r.width * dpr)
      canvas.height = Math.ceil(r.height * dpr)
      canvas.style.width = `${r.width}px`
      canvas.style.height = `${r.height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initDots(r.width, r.height)
    }

    function initDots(w, h) {
      dots = []
      for (let x = 0; x < w; x += DOT_SPACING) {
        for (let y = 0; y < h; y += DOT_SPACING) {
          const cx = x + DOT_SPACING / 2
          const cy = y + DOT_SPACING / 2
          const seed = Math.sin(cx * 12.9898 + cy * 78.233) * 43758.5453
          const bias = seed - Math.floor(seed)
          dots.push({
            x: cx,
            y: cy,
            transparency: 0,
            fadeSpeed: 5 + Math.random() * 10,
            bias,
            enabled: false,
          })
        }
      }
    }

    function frame() {
      const w = canvas.width / dpr
      const h = canvas.height / dpr
      ctx.clearRect(0, 0, w, h)

      for (const d of dots) {
        const inRange =
          Math.abs(mouseX - d.x) < currentArea &&
          Math.abs(mouseY - d.y) < currentArea

        if (!d.enabled) {
          if (
            isMoving &&
            inRange &&
            Math.random() > 0.7 &&
            Math.random() > 0.3 + d.bias * 0.7
          ) {
            d.enabled = true
            d.transparency = 255
          }
        } else {
          if (isMoving && inRange) {
            d.transparency = 255
          } else {
            d.transparency = Math.max(0, d.transparency - d.fadeSpeed)
          }
        }

        if (d.enabled && d.transparency > 0) {
          if (d.transparency === 255) {
            ctx.fillStyle = `rgb(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]})`
          } else {
            const a = d.transparency / 255
            ctx.fillStyle = `rgba(${fadeColor[0]}, ${fadeColor[1]}, ${fadeColor[2]}, ${a})`
          }
          ctx.fillRect(d.x - DOT_SIZE / 2, d.y - DOT_SIZE / 2, DOT_SIZE, DOT_SIZE)
        }
      }
      rafId = requestAnimationFrame(frame)
    }

    function onMouseMove(e) {
      const r = parent.getBoundingClientRect()
      mouseX = e.clientX - r.left
      mouseY = e.clientY - r.top
      const dx = Math.abs(mouseX - prevMX)
      const dy = Math.abs(mouseY - prevMY)
      const dist = Math.sqrt(dx * dx + dy * dy)
      currentArea = Math.min(
        MAX_AREA,
        Math.max(MIN_AREA, MIN_AREA + (dist / 100) * (MAX_AREA - MIN_AREA))
      )
      if (dist > MOVE_THRESHOLD) {
        isMoving = true
        prevMX = mouseX
        prevMY = mouseY
        clearTimeout(moveTimer)
        moveTimer = setTimeout(() => {
          isMoving = false
        }, 100)
      }
    }

    function onMouseLeave() {
      mouseX = -9999
      mouseY = -9999
      isMoving = false
    }

    const ro = new ResizeObserver(() => resize())
    ro.observe(parent)
    parent.addEventListener('mousemove', onMouseMove)
    parent.addEventListener('mouseleave', onMouseLeave)

    resize()
    rafId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(moveTimer)
      ro.disconnect()
      parent.removeEventListener('mousemove', onMouseMove)
      parent.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [tone])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 pointer-events-none"
    />
  )
}

const VALUE_LETTER_SIZE = 'text-[clamp(64px,9vw,180px)]'

function Values() {
  return (
    <section
      className="relative bg-white overflow-hidden"
    >
      <DotCanvas tone="light" />

      <div className="relative mx-auto max-w-[2560px] px-[clamp(17px,5vw,80px)] min-[1920px]:px-[clamp(120px,9vw,240px)] pt-[clamp(72px,11vw,260px)] pb-[clamp(80px,8vw,200px)]">
        <motion.div
          className="flex flex-col md:flex-row items-start justify-between gap-10 md:gap-8 mb-[clamp(80px,10vw,160px)]"
          initial="hidden"
          whileInView="show"
          viewport={inView}
          variants={stagger}
        >
          <motion.div
            className="font-body text-[clamp(13px,1.05vw,20px)] font-medium text-made-neutral-100 pt-2 shrink-0"
            variants={fadeUp}
          >
            Our values
          </motion.div>
          <motion.h2
            className="font-head font-medium tracking-[-0.025em] leading-[1.05] max-w-[820px] md:text-right text-[clamp(36px,4.4vw,72px)]"
            variants={fadeUp}
          >
            The standard we hold ourselves to.
          </motion.h2>
        </motion.div>

        <div className="flex flex-col gap-[clamp(96px,14vw,220px)]">
          <ValueRow variant="bold" value={VALUES[0]} />
          <ValueRow variant="impact" value={VALUES[1]} />
          <ValueRow variant="together" value={VALUES[2]} />
          <ValueRow variant="entrepreneurial" value={VALUES[3]} />
        </div>
      </div>
    </section>
  )
}

function ValueStackLayout({ letter, image, tagline, body }) {
  return (
    <div className="lg:hidden flex flex-col min-[631px]:flex-row min-[631px]:justify-between min-[631px]:items-start gap-10 min-[631px]:gap-12">
      <motion.div
        className="flex flex-col gap-6 min-[631px]:gap-[clamp(20px,3vw,48px)]"
        variants={fadeUp}
      >
        <ValueLetter letter={letter} sizeClass={VALUE_LETTER_SIZE} />
        <ParallaxImg
          src={image}
          className="w-[clamp(140px,12vw,260px)] h-[clamp(186px,16vw,330px)]"
        />
      </motion.div>
      <motion.div
        className="max-w-[clamp(280px,22vw,440px)] min-[631px]:pt-[clamp(48px,8vw,128px)]"
        variants={fadeUp}
      >
        <ValueText tagline={tagline} body={body} />
      </motion.div>
    </div>
  )
}

function ValueRow({ variant, value }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={inView}
      variants={stagger}
    >
      {variant === 'bold' && (
        <>
          <div className="hidden lg:flex flex-row items-end">
            <motion.div className="w-[55%]" variants={fadeUp}>
              <ValueLetter letter={value.letter} sizeClass={VALUE_LETTER_SIZE} />
            </motion.div>
            <motion.div className="w-[45%]" variants={fadeUp}>
              <div className="flex flex-row gap-[clamp(20px,3vw,48px)] items-start">
                <ParallaxImg
                  src={value.image}
                  className="w-[clamp(140px,12vw,260px)] h-[clamp(186px,16vw,330px)]"
                />
                <div className="max-w-[clamp(280px,22vw,440px)] pt-[128px]">
                  <ValueText tagline={value.tagline} body={value.body} />
                </div>
              </div>
            </motion.div>
          </div>
          <ValueStackLayout
            letter={value.letter}
            image={value.image}
            tagline={value.tagline}
            body={value.body}
          />
        </>
      )}

      {variant === 'impact' && (
        <>
          <div className="hidden lg:flex flex-row items-end">
            <motion.div className="w-[55%]" variants={fadeUp}>
              <div className="flex flex-row gap-[clamp(20px,3vw,48px)] items-start">
                <ParallaxImg
                  src={value.image}
                  className="w-[clamp(140px,12vw,260px)] h-[clamp(186px,16vw,330px)]"
                />
                <div className="max-w-[clamp(280px,22vw,440px)]">
                  <ValueText tagline={value.tagline} body={value.body} />
                </div>
              </div>
            </motion.div>
            <motion.div className="w-[45%] text-right" variants={fadeUp}>
              <ValueLetter letter={value.letter} sizeClass={VALUE_LETTER_SIZE} />
            </motion.div>
          </div>
          <ValueStackLayout
            letter={value.letter}
            image={value.image}
            tagline={value.tagline}
            body={value.body}
          />
        </>
      )}

      {variant === 'together' && (
        <>
          <div className="hidden lg:flex flex-row items-start">
            <div className="flex flex-row items-end gap-12 w-[72%]">
              <motion.div variants={fadeUp}>
                <ValueLetter letter={value.letter} sizeClass={VALUE_LETTER_SIZE} />
              </motion.div>
              <motion.div variants={fadeUp}>
                <ParallaxImg
                  src={value.image}
                  className="w-[clamp(140px,12vw,260px)] h-[clamp(186px,16vw,330px)]"
                />
              </motion.div>
            </div>
            <motion.div
              className="w-[28%] pt-[128px] max-w-[clamp(280px,22vw,440px)]"
              variants={fadeUp}
            >
              <ValueText tagline={value.tagline} body={value.body} />
            </motion.div>
          </div>
          <ValueStackLayout
            letter={value.letter}
            image={value.image}
            tagline={value.tagline}
            body={value.body}
          />
        </>
      )}

      {variant === 'entrepreneurial' && (
        <div className="flex flex-col gap-[clamp(58px,6.6vw,100px)] items-start">
          <motion.div variants={fadeUp} className="text-left self-start">
            <ValueLetter
              letter={
                <>
                  Entrepre<span className="hidden sm:inline">neurial</span>
                  <span className="sm:hidden">-<br />neurial</span>
                </>
              }
              sizeClass={VALUE_LETTER_SIZE}
            />
          </motion.div>
          <motion.div
            className="flex flex-col min-[631px]:flex-row min-[631px]:justify-between lg:justify-start lg:gap-16 w-full gap-6 items-start"
            variants={fadeUp}
          >
            <ParallaxImg
              src={value.image}
              className="w-[clamp(140px,12vw,260px)] h-[clamp(186px,16vw,330px)]"
            />
            <div className="max-w-[clamp(280px,22vw,440px)]">
              <ValueText tagline={value.tagline} body={value.body} />
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

function ParallaxImg({ src, className = '' }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['8%', '-8%'])
  return (
    <div
      ref={ref}
      className={`relative overflow-hidden shrink-0 ${className}`}
    >
      <motion.img
        src={src}
        alt=""
        style={{ y, scale: 1.18 }}
        className="absolute inset-0 w-full h-full object-cover will-change-transform"
      />
    </div>
  )
}

function ValueLetter({ letter, sizeClass }) {
  return (
    <div
      className={`font-head font-medium tracking-[-0.04em] leading-[0.85] text-made-neutral-100 ${sizeClass}`}
    >
      {letter}
    </div>
  )
}

function ValueText({ tagline, body }) {
  return (
    <p className="text-[clamp(13px,0.95vw,17px)] min-[1920px]:text-[19px] leading-[1.6] text-made-neutral-60">
      <span className="font-medium text-made-neutral-100">{tagline}</span> {body}
    </p>
  )
}

function Footer() {
  return (
    <footer
      className="relative bg-[#0F1010] text-white overflow-hidden"
    >
      <DotCanvas tone="dark" />

      <div className="relative mx-auto max-w-[2560px] px-[clamp(17px,5vw,80px)] min-[1920px]:px-[clamp(120px,9vw,240px)] py-[clamp(80px,8vw,200px)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-[clamp(48px,5vw,96px)] items-start">
          <div className="lg:max-w-[900px]">
            <div className="font-body text-[clamp(13px,1.05vw,20px)] font-medium text-white/70 mb-8">
              Still stuck?
            </div>
            <h2 className="font-head font-medium tracking-[-0.02em] leading-[1.05] text-white text-[clamp(36px,4.4vw,72px)]">
              If the manual doesn't have it, one of us will
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 lg:pt-[44px]">
            <FooterLink
              hint="Something personal?"
              label="Email HR"
              href="mailto:annelies@made.be"
            />
            <FooterLink
              hint="IT issues?"
              label="Open a ticket"
              href="https://made.atlassian.net"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ hint, label, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group block"
    >
      <div className="text-[clamp(12px,0.85vw,18px)] text-white/55 mb-2">{hint}</div>
      <div className="font-body text-[clamp(16px,1.4vw,26px)] font-medium text-white mb-3">{label}</div>
      <span className="inline-flex text-white transition-transform duration-300 group-hover:translate-x-1">
        <Arrow className="w-[clamp(24px,1.7vw,36px)] h-auto" />
      </span>
    </a>
  )
}
